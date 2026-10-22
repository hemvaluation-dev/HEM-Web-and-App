// Explicit QA fixture setup, not evidence that application authorization passed.
// Reads/writes ONLY cases with this run's prefix and their child rows/storage paths.
// Run from hem_portal: node --env-file=.env.local ../qa/seed-cases.cjs
const fs=require('node:fs');const path=require('node:path');const {createRequire}=require('node:module');
const req=createRequire(path.resolve('package.json'));const {createClient}=req('@supabase/supabase-js');
const root=path.resolve('../qa/runs/2026-09-26');const prefix='QA-20260926-';
const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const clients=JSON.parse(fs.readFileSync(path.join(root,'fixtures/clients.json')));
const templates=JSON.parse(fs.readFileSync(path.join(root,'fixtures/templates.json')));
const schema=JSON.parse(fs.readFileSync(path.join(root,'fixtures/schema.json')));
const image=fs.readFileSync(path.join(root,'fixtures/synthetic-property.jpg'));
const manifestPath=path.join(root,'case-manifest.json');let manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath)):[];
const check=r=>{if(r.error)throw new Error(r.error.message);return r.data;};
async function main(){for(const t of templates){
 const fixture=JSON.parse(fs.readFileSync(path.join(root,`fixtures/${t.id}.json`)));const c=fixture.common;
 if(!c.application_number.startsWith(prefix))throw Error('QA prefix required');
 const client=clients.find(x=>x.template_name.replaceAll('_','-')===t.id);
 let record=check(await s.from('cases').select('id,application_number,client_id').eq('application_number',c.application_number).maybeSingle());
 const preexisting=!!record;
 if(!record)record=check(await s.from('cases').insert({application_number:c.application_number,applicant_name:c.applicant_name,address:c.address,phone_number:c.phone_number,state:c.state,property_type:c.property_type,client_id:client.id,assigned_to:'9264f506-f098-4e0f-8af0-07981480b9e4',created_by:'280b0ff3-1f0c-4740-8293-46d3403c19f1',reviewer_id:'280b0ff3-1f0c-4740-8293-46d3403c19f1',valuator_id:'280b0ff3-1f0c-4740-8293-46d3403c19f1',status:'assigned',idempotency_key:c.application_number,extracted_data:fixture.data}).select('id,application_number,client_id').single());
 if(record.client_id!==client.id)throw Error('Unexpected lender for QA case');
 let row=manifest.find(x=>x.caseId===record.id);if(!row){row={template:t.id,caseId:record.id,reference:c.application_number,creation:preexisting?'portal UI':'service fixture setup',photos:[],document:null};manifest.push(row);fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));}
 check(await s.from('cases').update({extracted_data:fixture.data}).eq('id',record.id).eq('application_number',c.application_number));
 const field={case_id:record.id};for(const [k,v]of Object.entries(c))if(schema.case_field_data.properties[k]&&!['created_at','case_id'].includes(k))field[k]=v;
 check(await s.from('case_field_data').upsert(field,{onConflict:'case_id'}));
 const locs=check(await s.from('case_location').select('id').eq('case_id',record.id));if(!locs.length)check(await s.from('case_location').insert({case_id:record.id,latitude:12.9716,longitude:77.5946,address:c.address,address_from_gps:'SYNTHETIC QA coordinates - not GPS capture',city:'Bengaluru',state:'Karnataka',pincode:'560001',accuracy:5,altitude:900}));
 for(let i=0;i<t.photoCount;i++){
  const photoType=i===0?'elevation':i===1?'road_view':`qa_slot_${String(i+1).padStart(2,'0')}`;
  const storagePath=`${record.id}/qa-20260926-${String(i+1).padStart(2,'0')}.jpg`;
  const existing=check(await s.from('case_photos').select('id').eq('case_id',record.id).eq('photo_type',photoType));
  if(!existing.length){check(await s.storage.from('photos').upload(storagePath,image,{contentType:'image/jpeg',upsert:true}));const url=s.storage.from('photos').getPublicUrl(storagePath).data.publicUrl;check(await s.from('case_photos').insert({case_id:record.id,photo_type:photoType,file_url:url,latitude:12.9716,longitude:77.5946}));}
  if(!row.photos.includes(storagePath))row.photos.push(storagePath);
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
 }
 row.fixtureLoaded=true;console.log(row.reference,record.id,row.photos.length,'photos');fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
}}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
