const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const exportsObject = {};
let expanded = false;
const source = ts.transpileModule(fs.readFileSync('app/components/business-result-row.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
vm.runInNewContext(source, {
  exports: exportsObject, URLSearchParams,
  require(name) {
    if (name === 'react') return {
      useId: () => 'test-location',
      useState: () => [expanded, update => { expanded = typeof update === 'function' ? update(expanded) : update; }],
    };
    return require(name);
  },
});
const business = { id: 'fixture', name: 'Fixture business', streetAddress: 'Fixture address', suburb: null, latitude: -36.85, longitude: 174.76, phone: null, website: 'https://example.com' };
const recommendation = { business, pathway: 'repair', distanceKm: 1.2 };
const render = () => exportsObject.BusinessResultRow({ recommendation, rank: 1 });
function nodes(root) {
  if (!root || typeof root !== 'object') return [];
  return [root, ...[root.props?.children].flat(Infinity).flatMap(nodes)];
}
const find = (tree, type) => nodes(tree).find(node => node.type === type);
let tree = render();
assert.equal(find(tree, 'button').props['aria-expanded'], false);
assert.equal(find(tree, 'iframe'), undefined, 'No map is requested while collapsed');
// Button activation is also the browser's Enter/Space activation path.
find(tree, 'button').props.onClick();
tree = render();
assert.equal(find(tree, 'button').props['aria-expanded'], true);
const map = new URL(find(tree, 'iframe').props.src);
assert.equal(map.searchParams.get('marker'), '-36.85,174.76');
assert.ok(map.searchParams.get('bbox').startsWith('174.75,'), 'Bounding box starts with longitude');
assert.ok(nodes(tree).some(node => node.props?.href?.includes('destination=-36.85%2C174.76')));
assert.equal(find(tree, 'button').props['aria-controls'], 'test-location');
find(tree, 'tr').props.onClick({ target: { closest: () => ({}) } });
assert.equal(expanded, true, 'Links must not toggle the row');
find(tree, 'tr').props.onClick({ target: { closest: () => null } });
assert.equal(expanded, false, 'Clicking row whitespace collapses it');
for (const point of [[null, null], [undefined, undefined], [NaN, 174], [0, 0], [-100, 174]]) {
  expanded = true;
  [business.latitude, business.longitude] = point;
  tree = render();
  assert.equal(find(tree, 'iframe'), undefined);
  assert.ok(nodes(tree).some(node => String(node.props?.children).includes('Map unavailable')));
}
console.log('PASS: disclosure, row/link actions, deferred map loading, pin/directions coordinates, missing/invalid coordinates and older stored results.');
