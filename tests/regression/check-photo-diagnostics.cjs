const fs = require("fs");
const vm = require("vm");
const assert = require("assert/strict");
let ts;
try {
  ts = require("typescript");
} catch {
  ts = require("../../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript");
}
const diagnosticModule = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("lib/diagnostics.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText,
  { exports: diagnosticModule },
);
const code = ts.transpileModule(fs.readFileSync("app/api/analyse/route.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const route = {};
const logs = [];
const secret = "SENSITIVE_TEST_VALUE";
vm.runInNewContext(code, {
  exports: route,
  Response,
  Request,
  File,
  FormData,
  AbortSignal,
  Uint8Array,
  console: { info() {}, error: (...args) => logs.push(args) },
  require(name) {
    if (name === "@/lib/catalogue/load-photo-catalogue")
      return { loadPhotoCatalogue: async () => null };
    if (name === "@/lib/catalogue/photo-selection") {
      const result = {};
      vm.runInNewContext(
        ts.transpileModule(fs.readFileSync("lib/catalogue/photo-selection.ts", "utf8"), {
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
        }).outputText,
        { exports: result },
      );
      return result;
    }
    if (name === "@/lib/diagnostics") return diagnosticModule;
    if (name === "ai")
      return {
        generateText: async () => {
          throw {
            name: "AI_APICallError",
            statusCode: 404,
            message: secret,
            url: secret,
            responseBody: JSON.stringify({ error: { status: "NOT_FOUND", message: secret } }),
          };
        },
      };
    if (name === "@/lib/ai/classify-photo")
      return {
        classifyPhoto: async () => {
          throw {
            name: "AI_APICallError",
            statusCode: 404,
            message: secret,
            url: secret,
            responseBody: JSON.stringify({ error: { status: "NOT_FOUND", message: secret } }),
          };
        },
        hasImageApiKey: () => true,
        IMAGE_MODEL_ID: "gemini-test",
      };
    if (name === "@/lib/forms/validation") return { photoError: () => null };
    throw Error(name);
  },
});
(async () => {
  const body = new FormData();
  body.set("photo", new File(["test"], "test.png", { type: "image/png" }));
  const response = await route.POST(
    new Request("http://localhost/api/analyse", { method: "POST", body }),
  );
  const data = await response.json();
  assert.equal(response.status, 502);
  assert.match(data.error, /model is unavailable/);
  assert.ok(data.reference);
  assert.equal(logs[0][1].stage, "openrouter");
  assert.equal(logs[0][1].status, 404);
  assert.equal(logs[0][1].providerCode, "NOT_FOUND");
  assert.equal(logs[0][1].reference, data.reference);
  assert.ok(!JSON.stringify(logs).includes(secret));
  assert.ok(!JSON.stringify(data).includes(secret));
  console.log(
    "PASS: provider failure classified, reference correlated, sensitive error fields excluded from logs and response.",
  );
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
