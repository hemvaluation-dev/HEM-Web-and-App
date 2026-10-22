// Read-only check of synthetic QA report artifacts; never logs credentials or signed URLs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');
const req = createRequire(path.resolve(__dirname, '../hem_portal/package.json'));
const env = req('dotenv').parse(fs.readFileSync(path.resolve(__dirname, '../hem_portal/.env.local')));
const db = req('@supabase/supabase-js').createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const out = path.resolve(__dirname, 'runs/2026-09-26-alignment');
(async () => {
 const { data: cases, error } = await db.from('cases').select('id,application_number,status').like('application_number','QA-20260926-%');
 if(error) throw new Error('Could not read synthetic cases');
 const results=[];
 for(const c of cases) {
  const { data: versions, error } = await db.from('case_reports').select('id,template_id,storage_path,sha256,created_at').eq('case_id',c.id).order('created_at',{ascending:false});
  if(error) throw new Error('Could not read report versions');
  const r={reference:c.application_number,status:c.status,versions:versions.length,artifacts:[]};
  for(const v of versions) {
   const { data, error } = await db.storage.from('reports').download(v.storage_path);
   if(error) { r.artifacts.push({id:v.id,pass:false,error:'Download failed'});continue; }
   const bytes=Buffer.from(await data.arrayBuffer());
   const pass=crypto.createHash('sha256').update(bytes).digest('hex')===v.sha256;
   r.artifacts.push({id:v.id,template:v.template_id,bytes:bytes.length,pass});
  }
  results.push(r);
 }
 fs.writeFileSync(path.join(out,'saved-report-results.json'),JSON.stringify(results,null,2));
 const summary={cases:results.length,withReports:results.filter(r=>r.versions>0).length,artifacts:results.flatMap(r=>r.artifacts).length,failedHashes:results.flatMap(r=>r.artifacts).filter(r=>!r.pass).length};
 console.log(JSON.stringify(summary));
 if(summary.withReports!==14||summary.failedHashes)process.exitCode=1;
})().catch(()=>{console.error('Saved-report verification failed; no credentials emitted.');process.exitCode=1;});
