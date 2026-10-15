const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
let ts;
try { ts = require('typescript'); } catch { ts = require('../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript'); }
const source = fs.readFileSync('app/api/analyse/route.ts', 'utf8');
const code = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const routeExports = {};
vm.runInNewContext(code, {exports:routeExports, Response, Request, File, FormData, AbortSignal, Uint8Array, require(name){
 if(name==='ai')return {generateText(){throw Error('Gemini must not be called without a key');}};
 if(name==='@/lib/ai')return {defaultModel:{},hasGeminiApiKey:()=>false};
 if(name==='@/lib/forms/validation')return {photoError:()=>null};
 throw Error(name);
}});
(async()=>{const body=new FormData();body.set('photo',new File(['photo'],'item.png',{type:'image/png'}));const response=await routeExports.POST(new Request('http://localhost/api/analyse',{method:'POST',body}));assert.equal(response.status,200,'Missing Gemini configuration should return a manual-description fallback');const data=await response.json();assert.equal(data.status,'manual');assert.match(data.message,/describe/i);console.log('PASS: missing Gemini key returns an explicit manual-description fallback without calling Gemini.');})().catch(e=>{console.error(e.message);process.exitCode=1;});

