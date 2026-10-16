const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
let ts;
try { ts = require('typescript'); } catch { ts = require('../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript'); }
const source = fs.readFileSync('app/api/analyse/route.ts', 'utf8');
const diagnosticModule={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/diagnostics.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:diagnosticModule});
const code = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const routeExports = {};
vm.runInNewContext(code, {exports:routeExports, Response, Request, File, FormData, AbortSignal, Uint8Array, require(name){if(name==='@/lib/catalogue/load-photo-catalogue')return {loadPhotoCatalogue:async()=>null};if(name==='@/lib/catalogue/photo-selection'){const result={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/catalogue/photo-selection.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:result});return result;}if(name==='@/lib/diagnostics')return diagnosticModule;
 if(name==='ai')return {generateText(){throw Error('OpenRouter must not be called without a key');}};
 if(name==='@/lib/ai/classify-photo')return {classifyPhoto:()=>{throw Error("Must not classify without key");},hasImageApiKey:()=>false};
 if(name==='@/lib/forms/validation')return {photoError:()=>null};
 throw Error(name);
}});
(async()=>{const body=new FormData();body.set('photo',new File(['photo'],'item.png',{type:'image/png'}));const response=await routeExports.POST(new Request('http://localhost/api/analyse',{method:'POST',body}));assert.equal(response.status,200,'Missing OpenRouter configuration should return a manual-description fallback');const data=await response.json();assert.equal(data.status,'manual');assert.match(data.message,/describe/i);console.log('PASS: missing OpenRouter key returns an explicit manual-description fallback without calling OpenRouter.');})().catch(e=>{console.error(e.message);process.exitCode=1;});

