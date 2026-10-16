const fs = require("fs");
const vm = require("vm");
const assert = require("assert/strict");
const ts = require("typescript");
const logs = [];
const diagnostics = {};
const code = ts.transpileModule(fs.readFileSync("lib/diagnostics.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
vm.runInNewContext(code, {
  exports: diagnostics,
  console: { info: (...args) => logs.push(args), error: (...args) => logs.push(args) },
  fetch: globalThis.fetch,
});
(async () => {
  const secret = "SENSITIVE_FIXTURE_VALUE";
  let calls = 0;
  const wrapped = diagnostics.diagnosticFetch("test-reference", "gemini-test", async () => {
    calls++;
    return calls === 1
      ? new Response(
          JSON.stringify({
            error: { status: "UNAVAILABLE", message: "Model overloaded " + secret },
          }),
          { status: 503 },
        )
      : new Response("ok", { status: 200 });
  });
  const response = await wrapped("https://example.invalid/?key=" + secret);
  assert.equal(response.status, 503);
  assert.match(await response.text(), /overloaded/, "Provider error body remains available to SDK");
  assert.equal((await wrapped("https://example.invalid/")).status, 200);
  const responses = logs.filter((row) => row[1].event === "provider_response").map((row) => row[1]);
  assert.equal(responses[0].attempt, 1);
  assert.equal(responses[0].status, 503);
  assert.equal(responses[0].providerCode, "UNAVAILABLE");
  assert.equal(responses[0].reason, "provider_capacity");
  assert.equal(responses[1].attempt, 2);
  const sql = diagnostics.safeFailure({
    name: "DrizzleQueryError",
    message: secret,
    sql: secret,
    cause: { name: "PostgresError", code: "42P01", message: secret },
  });
  assert.equal(sql.databaseCode, "42P01");
  assert.equal(sql.reason, "missing_table");
  assert.equal(
    diagnostics.safeFailure({ cause: { code: "28P01" } }).reason,
    "database_authentication",
  );
  assert.equal(diagnostics.safeFailure({ cause: { code: "ENOTFOUND" } }).reason, "dns_failure");
  const network = diagnostics.diagnosticFetch("network-reference", "gemini-test", async () => {
    throw { code: "ECONNREFUSED", message: secret };
  });
  await assert.rejects(() => network("https://example.invalid/"));
  assert.equal(logs.at(-1)[1].reason, "connection_refused");
  assert.ok(!JSON.stringify(logs).includes(secret));
  assert.ok(!JSON.stringify(sql).includes(secret));
  console.log(
    "PASS: each provider attempt/status/capacity reason, nested database failures, network failures and exclusion of sensitive data.",
  );
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
