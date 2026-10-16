const fs = require("fs");
const vm = require("vm");
const assert = require("assert/strict");
let ts;
try {
  ts = require("typescript");
} catch {
  ts = require("../../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript");
}
function load(file) {
  const result = {};
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    exports: result,
    require() {
      throw Error("Unexpected runtime import");
    },
  });
  return result;
}
const { matchItemByKeywords: match } = load("lib/submissions/match-item.ts");
const { SEED_ITEMS } = load("lib/catalogue/seed-data.ts");
const catalogue = SEED_ITEMS.map((item, index) => ({ ...item, id: String(index) }));
catalogue.push({
  id: "test-only-laptop",
  title: "Laptops and computers",
  keywords: ["laptop", "macbook"],
});
const cases = [
  ["Laptop", "Laptops and computers"],
  ["An old MacBook", "Laptops and computers"],
  ["A broken toaster", "Small electrical appliances"],
  ["A broken chair", "Household furniture"],
  ["An old iPhone", "Mobile phones and tablets"],
  ["A kettle", "Small electrical appliances"],
  ["Some batteries", "Lithium batteries (household)"],
  ["This is broken", null],
  ["A telephone book", null],
  ["A battery and toaster", null],
];
for (const [description, title] of cases)
  assert.equal(match(description, catalogue).item?.title ?? null, title, description);
assert.equal(match("A battery and toaster", [...catalogue].reverse()).item, null);
console.log(
  "PASS: real seed catalogue, item terms, condition bias, substring boundaries, ambiguous categories and catalogue order.",
);
