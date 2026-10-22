const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto')
const dir=path.resolve('.secrets/supabase-backups/2026-10-22-cases')
const raw=JSON.parse(fs.readFileSync(path.join(dir,'edge-google-geocode.json')))
const edge=JSON.parse(raw.content.find(c=>c.type==='text').text)
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')))
const secret=crypto.randomBytes(32).toString('hex')
const digest=crypto.createHash('sha256').update(secret).digest('hex')
const files=manifest.files.map(f=>({bucket:f.bucket,name:f.name,bytes:f.bytes,sha256:f.sha256,contentType:f.contentType||'application/octet-stream'}))
const source=`
// Temporary migration-only route: fixed manifest, exact hashes, one-hour expiry.
const restoreExpected = ${JSON.stringify(files)};
async function restoreUpload(req:Request):Promise<Response> {
 const reply=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
 if(req.method!=='POST') return reply({error:'POST required'},405);
 if(Date.now()>${Date.now()+3600000}) return reply({error:'Restore expired'},410);
 const header=req.headers.get('x-hem-restore')||'';
 const hex=(bytes:ArrayBuffer)=>Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('');
 if(hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(header)))!==${JSON.stringify(digest)}) return reply({error:'Unauthorized'},401);
 const base=Deno.env.get('SUPABASE_URL')!;
 if(base!=='https://gwqfwtcxlwcmglrozshc.supabase.co')return reply({error:'Wrong project'},503);
 const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
 const headers={apikey:key,Authorization:'Bearer '+key};
 const index=Number(new URL(req.url).searchParams.get('file'));
 if(index===-1){
  const list=await fetch(base+'/storage/v1/bucket',{headers,signal:AbortSignal.timeout(15000)});
  if(!list.ok)return reply({error:'Bucket listing failed: '+list.status},503);
  const buckets=await list.json();
  for(const id of ['photos','documents','reports']){
   const existing=buckets.find((bucket:{id:string})=>bucket.id===id);
   if(!existing){
    const create=await fetch(base+'/storage/v1/bucket',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({id,name:id,public:false}),signal:AbortSignal.timeout(15000)});
    if(!create.ok&&create.status!==409)return reply({error:'Bucket initialization failed: '+create.status},503);
   }else if(existing.public)return reply({error:'Bucket must be private'},409);
  }
  return reply({initialized:true});
 }
 const item=restoreExpected[index];
 if(!Number.isInteger(index)||!item)return reply({error:'Unknown file'},400);
 const bytes=await req.arrayBuffer();
 if(bytes.byteLength!==item.bytes||hex(await crypto.subtle.digest('SHA-256',bytes))!==item.sha256)return reply({error:'Checksum mismatch'},400);
 const objectPath=encodeURIComponent(item.bucket)+'/'+item.name.split('/').map(encodeURIComponent).join('/');
 const upload=await fetch(base+'/storage/v1/object/'+objectPath,{method:'POST',headers:{...headers,'Content-Type':item.contentType,'x-upsert':'false'},body:bytes,signal:AbortSignal.timeout(60000)});
 if(!upload.ok&&upload.status!==409&&upload.status!==400)return reply({error:'Storage upload failed'},503);
 const read=await fetch(base+'/storage/v1/object/authenticated/'+objectPath,{headers,signal:AbortSignal.timeout(60000)});
 if(!read.ok)return reply({error:'Read-back failed'},503);
 const saved=await read.arrayBuffer();
 if(saved.byteLength!==item.bytes||hex(await crypto.subtle.digest('SHA-256',saved))!==item.sha256)return reply({error:'Destination checksum mismatch; no overwrite performed'},409);
 return reply({file:index,bytes:item.bytes,sha256:item.sha256,verified:true});
}
`;
const entry=edge.files.find(f=>f.name==='google-geocode/index.ts')
entry.content=source+'\n'+entry.content.replace('Deno.serve(async (req: Request) => {',"Deno.serve(async (req: Request) => {\n  if(req.headers.has('x-hem-restore')) return restoreUpload(req);")
fs.writeFileSync(path.join(dir,'temporary-upload-function.json'),JSON.stringify({files:edge.files}),{mode:0o600})
fs.writeFileSync(path.join(dir,'temporary-upload-client.json'),JSON.stringify({url:'https://gwqfwtcxlwcmglrozshc.supabase.co/functions/v1/google-geocode',secret,files}),{mode:0o600})
console.log('Prepared scoped temporary upload route for '+files.length+' files; credential kept private')
