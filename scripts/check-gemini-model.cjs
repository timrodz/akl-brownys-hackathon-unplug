const fs = require("fs");
const vm = require("vm");
const assert = require("assert/strict");
const ts = require("../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript");
const code = ts.transpileModule(fs.readFileSync("lib/ai.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function load(env) {
  const result = {};
  vm.runInNewContext(code, {
    exports: result,
    process: { env },
    console: { warn() {} },
    require(name) {
      if (name === "server-only") return {};
      if (name === "@/lib/diagnostics") return { diagnosticFetch: () => undefined };
      if (name === "@ai-sdk/google")
        return { createGoogleGenerativeAI: () => (id) => ({ modelId: id }) };
      throw Error(name);
    },
  });
  return result;
}
assert.equal(load({}).GEMINI_MODEL_ID, "gemini-3.8-flash");
assert.equal(load({ GEMINI_MODEL: " custom-model " }).GEMINI_MODEL_ID, "custom-model");
assert.equal(load({ GEMINI_MODEL: " " }).GEMINI_MODEL_ID, "gemini-3.8-flash");
console.log("PASS: current default, configurable model and blank override fallback.");
