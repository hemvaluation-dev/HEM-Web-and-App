const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const sharp = require('sharp')
const JSZip = require('jszip')
const {load} = require('./load.cjs')
const {photoTypes, matchReportPhotos} = load('src/lib/reports/photo-types.ts')
const {templates} = load('src/lib/report-engine/templates.ts', {'../../../template-registry.json':require('../template-registry.json')})

test('mobile and portal expose the same unique photo types',()=>{
 const dart = fs.readFileSync('../HEM_Agent/lib/core/photo_types.dart','utf8').split('const photoTypes = <String>[')[1].split('];')[0]
 assert.deepEqual([...dart.matchAll(/'([^']+)'/g)].map(m=>m[1]), [...photoTypes])
 assert.equal(new Set(photoTypes).size,photoTypes.length)
})
test('typed photos are assigned to matching slots regardless of upload order; no reuse or generic guessing',()=>{
 for(const t of templates) {
  const photos = t.photoSlots.filter(s=>s.photoTypes).map((s,i)=>({id:i,photo_type:s.photoTypes[0]})).reverse()
  photos.unshift({id:-1,photo_type:'Others - Screenshots'})
  const assigned=matchReportPhotos(t,photos)
  const used=assigned.filter(Boolean)
  assert.equal(new Set(used.map(p=>p.id)).size,used.length,t.id)
  assigned.forEach((p,i)=>{if(p){assert.notEqual(p.id,-1);if(t.photoSlots[i].photoTypes)assert.ok(t.photoSlots[i].photoTypes.includes(p.photo_type),t.id)}})
  for(const [i,s]of t.photoSlots.entries()) if(s.photoTypes)assert.ok(assigned[i],`${t.id} ${s.label}`)
 }
})
test('all named screenshot placeholders have measured full-width frames and supported types',()=>{
 for(const t of templates) for(const s of t.photoSlots) if(s.fullWidth) {
  assert.ok(s.aspectRatio>0 && s.aspectRatio<20,`${t.id} ${s.label}`)
  assert.ok(s.photoTypes.every(type=>photoTypes.includes(type)))
 }
})
test('generated screenshots preserve the whole portrait image inside landscape report frames',async()=>{
 const {generateReport}=load('src/lib/report-engine/report.ts')
 const input=await sharp({create:{width:100,height:300,channels:3,background:'#123456'}}).png().toBuffer()
 for(const t of templates) {
  const i=t.photoSlots.findIndex(s=>s.fullWidth);assert.ok(i>=0,t.id)
  const photos=Array(t.photoSlots.length).fill(null);photos[i]=new Blob([input])
  const output=await generateReport(t.id,{},photos,t)
  const zip=await JSZip.loadAsync(output.buffer)
  const bytes=await zip.file(t.photoSlots[i].media).async('nodebuffer')
  const {data,info}=await sharp(bytes).removeAlpha().raw().toBuffer({resolveWithObject:true})
  assert.ok(Math.abs(info.width/info.height-t.photoSlots[i].aspectRatio)<.01,t.id)
  const center=(Math.floor(info.height/2)*info.width+Math.floor(info.width/2))*info.channels
  assert.ok(Math.abs(data[center]-18)<5 && Math.abs(data[center+2]-86)<5,t.id)
  assert.ok(data[0]>245 && data[1]>245 && data[2]>245,`${t.id}: white padding, no stretching`)
 }
})

test('Veritas preserves portrait property photos inside the lender frames',async()=>{
 const {generateReport}=load('src/lib/report-engine/report.ts')
 const t=templates.find(t=>t.id==='veritas')
 const input=await sharp({create:{width:100,height:300,channels:3,background:'#123456'}}).png().toBuffer()
 const result=await generateReport(t.id,{},[new Blob([input])],t)
 const zip=await JSZip.loadAsync(result.buffer)
 const bytes=await zip.file(t.photoSlots[0].media).async('nodebuffer')
 const {data,info}=await sharp(bytes).removeAlpha().raw().toBuffer({resolveWithObject:true})
 assert.ok(Math.abs(info.width/info.height-t.photoSlots[0].aspectRatio)<.01)
 assert.ok(data[0]>245 && data[1]>245 && data[2]>245)
})
