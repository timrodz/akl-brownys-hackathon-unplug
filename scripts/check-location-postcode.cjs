const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const ts = require("typescript");
const dataset = require("../data/postcodes/nz-postcode-centroids.json");
function compile(file) {
  return ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
}
const lookup = {};
vm.runInNewContext(compile("lib/location/nearest-postcode.ts"), {
  exports: lookup,
  require: () => dataset,
});
const point = dataset.centroids.find((row) => row.postcode === "1010");
assert.equal(lookup.nearestPostcode(point.latitude, point.longitude), "1010");
assert.equal(lookup.nearestPostcode(51.5, -0.1), null);
assert.equal(lookup.nearestPostcode(0, 0), null);
assert.equal(lookup.nearestPostcode(NaN, 174), null);

let cursor = 0,
  success,
  failure;
const hooks = [];
const react = {
  useState(initial) {
    const i = cursor++;
    if (!(i in hooks)) hooks[i] = initial;
    return [
      hooks[i],
      (value) => {
        hooks[i] = value;
      },
    ];
  },
  useRef(initial) {
    const i = cursor++;
    return (hooks[i] ??= { current: initial });
  },
};
const page = {};
vm.runInNewContext(compile("app/page.tsx"), {
  exports: page,
  navigator: {
    geolocation: {
      getCurrentPosition(ok, fail) {
        success = ok;
        failure = fail;
      },
    },
  },
  require(name) {
    if (name === "react") return react;
    if (name === "next/navigation") return { useRouter: () => ({ push() {} }) };
    if (name === "@/lib/results-storage") return { RESULTS_STORAGE_KEY: "test" };
    if (name === "@/lib/location/nearest-postcode") return lookup;
    if (name === "@/lib/location/valid-postcode")
      return {
        isValidNzPostcode: (value) => dataset.centroids.some((row) => row.postcode === value),
        POSTCODE_ERROR: "Invalid postcode",
      };
    return require(name);
  },
});
function nodes(root) {
  return !root || typeof root !== "object"
    ? []
    : [root, ...[root.props?.children].flat(Infinity).flatMap(nodes)];
}
function render() {
  cursor = 0;
  return nodes(page.default());
}
const locate = (tree) =>
  tree.find(
    (node) => node.type === "button" && String(node.props.children).includes("Use my location"),
  );
const input = (tree) => tree.find((node) => node.props?.id === "postcode");
const feedback = (tree) => tree.find((node) => node.props?.id === "postcode-feedback");
(async () => {
  let tree = render();
  locate(tree).props.onClick();
  await success({ coords: { latitude: point.latitude, longitude: point.longitude, accuracy: 20 } });
  tree = render();
  assert.equal(input(tree).props.value, "1010");
  assert.equal(feedback(tree).props.children, "", "Success must not add a status message");
  locate(tree).props.onClick();
  const stale = success;
  input(render()).props.onChange({ target: { value: "0600" } });
  await stale({ coords: { latitude: point.latitude, longitude: point.longitude, accuracy: 20 } });
  assert.equal(
    input(render()).props.value,
    "0600",
    "Delayed geolocation must not overwrite a manual edit",
  );
  locate(render()).props.onClick();
  failure();
  assert.match(feedback(render()).props.children, /Couldn't access/);
  locate(render()).props.onClick();
  await success({ coords: { latitude: 51.5, longitude: -0.1, accuracy: 20 } });
  assert.match(feedback(render()).props.children, /Couldn't determine/);
  assert.equal(input(render()).props.value, "0600");
  console.log(
    "PASS: real postcode estimate fills form, success status stays empty, manual edits beat delayed location, and permission/out-of-range failures display errors.",
  );
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
