const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const dataset = require('../data/postcodes/nz-postcode-centroids.json');
const codes = require('../data/postcodes/valid-postcodes.json');
assert.deepEqual(codes, dataset.centroids.map(row => row.postcode), 'Client membership index must match the postcode JSON');
const cache = {};
function load(file) {
  if (cache[file]) return cache[file];
  const result = cache[file] = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText;
  vm.runInNewContext(code, { exports: result, File, require(name) {
    if (name === '@/data/postcodes/valid-postcodes.json') return codes;
    if (name === '@/data/postcodes/nz-postcode-centroids.json') return dataset;
    if (name === '@/lib/location/valid-postcode') return load('lib/location/valid-postcode.ts');
    if (name === '@/lib/location/geocode') return load('lib/location/geocode.ts');
    if (name === '@/lib/db/schema') return { businessItemRoleEnum: { enumValues: ['reuse', 'repair', 'drop_off', 'collection'] } };
    return require(name);
  } });
  return result;
}
const { submissionSchema } = load('lib/forms/validation.ts');
for (const postcode of codes) assert.equal(submissionSchema.safeParse({ description: 'Laptop', postcode }).success, true);
for (const postcode of ['0000', '1020', '9999', '110', 'abcd', '10101']) {
  assert.equal(submissionSchema.safeParse({ description: 'Laptop', postcode }).success, false);
  assert.equal(submissionSchema.safeParse({ description: 'Laptop', postcode, coordinates: { latitude: -36.85, longitude: 174.76 } }).success, false);
}
assert.equal(submissionSchema.safeParse({ description: 'Laptop', coordinates: { latitude: -36.85, longitude: 174.76 } }).success, true);
assert.equal(submissionSchema.safeParse({ description: 'Laptop' }).success, false);
assert.equal(submissionSchema.parse({ description: 'Laptop', postcode: ' 0110 ' }).postcode, '0110');
const { mapBusinessCsvRow } = load('lib/catalogue/map-csv-rows.ts');
for (const [input, expected] of [['no', false], ['false', false], ['yes', true], ['', null], ['unknown', null]]) {
  const mapped = mapBusinessCsvRow({ business_id: 'fixture', business_name: 'Fixture', accepts_household: input }, 'manual');
  assert.equal(mapped.acceptsHousehold, expected, 'CSV imports must preserve explicit household refusals');
}

const { buildRecommendations } = load('lib/submissions/build-recommendations.ts');
const business = (id, overrides = {}) => ({ id, externalId: id, name: id, latitude: -36.85, longitude: 174.76, ...overrides });
const rows = [
  { business: business('closed', { status: 'Closed' }), role: 'drop_off', notes: null },
  { business: business('commercial-only', { acceptsHousehold: false }), role: 'drop_off', notes: null },
  { business: business('far-acceptor', { latitude: -36.90 }), role: 'reuse', notes: 'Check condition' },
  { business: business('near-acceptor'), role: 'drop_off', notes: 'Fee applies' },
  { business: business('near-acceptor'), role: 'repair', notes: 'Call ahead' },
  { business: business('unknown-location', { latitude: null }), role: 'drop_off', notes: null },
  { business: business('demo-listing', { status: 'demo' }), role: 'drop_off', notes: null },
  { business: business('too-far', { latitude: -41 }), role: 'drop_off', notes: null },
];
const ranked = buildRecommendations({ title: 'Laptop' }, rows, -36.85, 174.76).filter(row => row.businessId);
assert.deepEqual(Array.from(ranked, row => row.businessId), ['near-acceptor', 'far-acceptor', 'unknown-location']);
assert.match(ranked[0].body, /Fee applies/);
assert.match(ranked[0].body, /Call ahead/);
assert.equal(ranked[2].distanceKm, null);
console.log(`PASS: all ${codes.length} source postcodes, leading zeroes, unknown codes, location bypass, household/status exclusions, distinct shortlist, notes and distance ranking.`);
