const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
function compile(file) {
  return ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
}
const selection = {};
vm.runInNewContext(compile('lib/catalogue/photo-selection.ts'), { exports: selection });
const catalogue = { items: [{ id: 'laptop-id', title: 'Laptop', keywords: ['laptop'] }], itemTypes: [{ id: 'IT', name: 'Computers & IT', description: 'Computers and accessories' }] };
const answer = { itemId: 'laptop-id', itemTypeId: 'IT', confidence: 'high' };
const prompt = selection.photoSelectionPrompt(catalogue);
assert.ok(prompt.includes('laptop-id') && prompt.includes('Computers & IT'));
const known = selection.parsePhotoSelection(JSON.stringify(answer), catalogue);
assert.equal(known.description, 'Laptop');
assert.equal(known.catalogueMatch.method, 'ai');
assert.equal(known.suggestedItemType.name, 'Computers & IT');
for (const value of [null, {}, { ...answer, itemId: 'invented' }, { ...answer, itemTypeId: 'invented' }, { ...answer, confidence: 'low' }]) {
  assert.equal(selection.parsePhotoSelection(JSON.stringify(value), catalogue).status, 'manual');
}
assert.equal(selection.parsePhotoSelection('not JSON', catalogue).status, 'manual');
assert.equal(selection.parsePhotoSelection('```json\n' + JSON.stringify(answer) + '\n```', catalogue).description, 'Laptop');

const route = {};
let sentPrompt;
vm.runInNewContext(compile('app/api/analyse/route.ts'), {
  exports: route, Request, Response, File, FormData, console: { info() {}, error() {} },
  require(name) {
    if (name === '@/lib/catalogue/photo-selection') return selection;
    if (name === '@/lib/catalogue/load-photo-catalogue') return { loadPhotoCatalogue: async () => catalogue };
    if (name === '@/lib/forms/validation') return { photoError: () => null };
    if (name === '@/lib/diagnostics') return { safeFailure: () => ({}) };
    if (name === '@/lib/ai/classify-photo') return {
      IMAGE_MODEL_ID: 'openrouter/free', hasImageApiKey: () => true,
      classifyPhoto: async (photo, reference, prompt) => { sentPrompt = prompt; return JSON.stringify(answer); },
    };
    throw Error(name);
  },
});
(async () => {
  const loader = {};
  const itemsTable = { id: 'id', title: 'title' };
  const typesTable = { itemTypeId: 'type-id', itemTypeName: 'type-name' };
  vm.runInNewContext(compile('lib/catalogue/load-photo-catalogue.ts'), {
    exports: loader,
    require(name) {
      if (name === 'server-only') return {};
      if (name === 'drizzle-orm') return { asc: value => value };
      if (name === '@/lib/db/schema') return { items: itemsTable, itemTypes: typesTable };
      if (name === '@/lib/db') return { db: { select: () => ({ from: table => ({ orderBy: () => ({ limit: async () => table === itemsTable ? [
        { ...catalogue.items[0], externalId: 'IT01' },
        { id: 'demo', title: 'Synthetic fixture', externalId: 'demo-laptop', keywords: [] },
      ] : catalogue.itemTypes }) }) }) } };
      throw Error(name);
    },
  });
  const loaded = await loader.loadPhotoCatalogue();
  assert.equal(loaded.items.length, 1);
  assert.equal(loaded.items[0].id, 'laptop-id');
  assert.equal(loaded.itemTypes[0].id, 'IT');
  assert.equal(loaded.items[0].externalId, undefined, 'Only classifier fields leave the catalogue loader');
  const body = new FormData();
  body.set('photo', new File(['test fixture'], 'test.png', { type: 'image/png' }));
  const response = await route.POST(new Request('http://localhost/api/analyse', { method: 'POST', body }));
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.description, 'Laptop');
  assert.equal(data.catalogueMatch.id, 'laptop-id');
  assert.equal(data.suggestedItemType.id, 'IT');
  assert.equal(sentPrompt, prompt);
  console.log('PASS: catalogue Items/Item Types reach the model; IDs validated; canonical name returned; unknown/low-confidence/malformed outputs request manual description.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
