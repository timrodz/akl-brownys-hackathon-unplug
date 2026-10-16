const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const ts = require("typescript");

function compile(file) {
  return ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

const selection = {};
vm.runInNewContext(compile("lib/catalogue/catalogue-selection.ts"), {
  exports: selection,
  require(name) {
    if (name === "zod") return require("zod");
    if (name === "./photo-selection") return { PhotoCatalogue: undefined };
    throw Error(name);
  },
});

const matchItem = {};
vm.runInNewContext(compile("lib/submissions/match-item.ts"), {
  exports: matchItem,
  require() {
    return {};
  },
});

const powerBank = {
  id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  title: "Power bank",
  keywords: null,
  externalId: "IT38",
};
const keyword = matchItem.matchItemByKeywords("powerbank", [powerBank]);
assert.equal(keyword.item, null, "keywords should not match powerbank to Power bank");

const catalogue = {
  items: [{ id: powerBank.id, title: powerBank.title, keywords: null }],
  itemTypes: [{ id: "ET13", name: "Batteries", description: "Loose batteries" }],
};
const resolved = selection.resolveCatalogueSelection(
  { itemId: powerBank.id, itemTypeId: "ET13", confidence: "high" },
  catalogue,
  [powerBank],
);
assert.equal(resolved.item.title, "Power bank");
assert.equal(resolved.confidence, 0.85);

const textMatcher = {};
let generateCalls = 0;
vm.runInNewContext(compile("lib/submissions/match-item-by-text.ts"), {
  exports: textMatcher,
  console: { error() {} },
  require(name) {
    if (name === "server-only") return {};
    if (name === "ai") {
      return {
        generateText: async () => {
          generateCalls++;
          return {
            output: {
              itemId: powerBank.id,
              itemTypeId: null,
              confidence: "medium",
            },
          };
        },
        Output: { object: ({ schema }) => ({ schema }) },
      };
    }
    if (name === "@/lib/ai") {
      return {
        hasGeminiApiKey: () => true,
        defaultModel: {},
        createAnalysisModel: () => ({}),
      };
    }
    if (name === "@/lib/diagnostics") {
      return { safeFailure: () => ({}) };
    }
    if (name === "@/lib/catalogue/catalogue-selection") return selection;
    if (name === "@/lib/catalogue/load-photo-catalogue") {
      return { loadPhotoCatalogue: async () => catalogue };
    }
    if (name === "./match-item") return matchItem;
    throw Error(name);
  },
});

(async () => {
  const ai = await textMatcher.matchItemByTextAi("powerbank", [powerBank], "ref-1");
  assert.equal(ai.method, "ai");
  assert.equal(ai.item?.title, "Power bank");
  assert.equal(ai.confidence, 0.65);
  assert.equal(generateCalls, 1);
  console.log(
    "PASS: powerbank misses keywords; typed AI schema resolves Power bank when Gemini path is configured.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
