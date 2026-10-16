const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');let ts;try{ts=require('typescript');}catch{ts=require('../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript');}
const code=ts.transpileModule(fs.readFileSync('app/api/analyse/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const route={};let sent;
vm.runInNewContext(code,{exports:route,Response,Request,File,FormData,AbortSignal,Uint8Array,require(name){
 if(name==='ai')return {generateText:async options=>{sent=options;return {text:'A toaster'};}};
 if(name==='@/lib/ai')return {defaultModel:{},hasGeminiApiKey:()=>true};
 if(name==='@/lib/forms/validation')return {photoError:()=>null};
 if(name==='@/lib/catalogue/check-description')return {checkCatalogueDescription:async()=>({catalogueMatch:null})};
 throw Error(name);
}});
(async()=>{const bytes=new Uint8Array([137,80,78,71]);const body=new FormData();body.set('photo',new File([bytes],'item.png',{type:'image/png'}));const response=await route.POST(new Request('http://localhost/api/analyse',{method:'POST',body}));assert.equal(response.status,200);const part=sent.messages[0].content[1];assert.equal(part.type,'file');assert.equal(part.mediaType,'image/png');assert.deepEqual([...part.data],[...bytes]);assert.equal((await response.json()).description,'A toaster');console.log('PASS: photo bytes and MIME type sent as file content; identification response preserved.');})().catch(error=>{console.error(error.message);process.exitCode=1;});
