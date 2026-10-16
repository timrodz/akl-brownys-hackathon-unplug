const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('lib/location/geocode.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const result = {};
const env = {};
let calls = 0;
let valid = true;
vm.runInNewContext(code, { exports: result, process: { env }, URL, AbortSignal, fetch: async url => {
  calls++;
  assert.equal(url.searchParams.get('components'), 'postal_code:1010|country:NZ');
  return { ok: true, json: async () => ({ status: 'OK', results: [{ geometry: { location: { lat: 0, lng: 0 } }, address_components: [{ long_name: valid ? '1010' : '9999', types: ['postal_code'] }, { short_name: 'NZ', types: ['country'] }] }] }) };
} });
(async () => {
  assert.equal(await result.geocodePostcode('1010'), null);
  assert.equal(calls, 0, 'No key means no fabricated location and no provider call');
  env.GOOGLE_MAPS_API_KEY = 'test-fixture-key';
  assert.equal((await result.geocodePostcode('1010')).latitude, 0);
  valid = false;
  assert.equal(await result.geocodePostcode('1010'), null, 'Reject a response for a different postcode');
  console.log('PASS: Maps postcode lookup uses provider coordinates, returns no fabricated location without a key, and rejects mismatched postcodes.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
