const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('lib/ai/classify-photo.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const classifier = {};
// A synthetic key only: no local or deployment credentials are loaded.
const env = { OPENROUTER_API_KEY: 'test-only-key' };
let sent, mode = 'success', calls = 0;
vm.runInNewContext(code, {
  exports: classifier, process: { env }, Buffer, AbortSignal, console,
  require(name) {
    if (name === 'server-only') return {};
    if (name === '@/lib/diagnostics') return {
      diagnosticFetch: () => async (url, init) => {
        calls++;
        sent = { url, ...init, body: JSON.parse(init.body) };
        if (mode === 'rate-limit') return Response.json({ error: 'private provider body' }, { status: 429 });
        const empty = mode === 'empty' || (mode === 'empty-once' && calls === 1);
        return Response.json({ choices: [{ finish_reason: empty ? 'length' : 'stop', message: { content: empty ? '' : 'A metal toaster' } }] });
      },
    };
    throw Error(name);
  },
});
(async () => {
  const photo = new File([new Uint8Array([137, 80, 78, 71])], 'photo.png', { type: 'image/png' });
  assert.equal(await classifier.classifyPhoto(photo, 'reference'), 'A metal toaster');
  assert.equal(sent.url, 'https://openrouter.ai/api/v1/chat/completions');
  assert.equal(sent.headers.Authorization, 'Bearer test-only-key');
  assert.equal(sent.body.model, 'openrouter/free');
  assert.equal(sent.body.messages[0].content[1].image_url.url, 'data:image/png;base64,iVBORw==');
  assert.equal(sent.body.max_tokens, 1024);
  assert.ok(sent.signal instanceof AbortSignal);
  mode = 'empty-once'; calls = 0;
  assert.equal(await classifier.classifyPhoto(photo, 'reference'), 'A metal toaster', 'HTTP 200 with empty content should retry once');
  assert.equal(calls, 2);
  assert.equal(sent.body.reasoning.enabled, false);
  assert.ok(sent.body.max_tokens >= 1024);
  mode = 'rate-limit';
  await assert.rejects(() => classifier.classifyPhoto(photo, 'reference'), error => error.statusCode === 429 && !JSON.stringify(error).includes('private provider body'));
  mode = 'empty';
  await assert.rejects(() => classifier.classifyPhoto(photo, 'reference'), { name: 'AI_NoOutputGeneratedError' });
  env.OPENROUTER_API_KEY = ' ';
  assert.equal(classifier.hasImageApiKey(), false);
  const previousCalls = calls;
  await assert.rejects(() => classifier.classifyPhoto(photo, 'reference'));
  assert.equal(calls, previousCalls);
  console.log('PASS: free vision model, image encoding, auth, timeout, rate limits, empty output and missing key.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
