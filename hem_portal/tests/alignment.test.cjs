const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { load } = require('./load.cjs')
const { calculateMeasurements } = load('src/lib/valuation/measurements.ts')
const { normalizeCaseStatus, fieldWorkLocked } = load('src/lib/cases/status.ts')
for (const f of require('../../qa/fixtures/measurements.json')) test(`mobile parity: ${f.name}`, () => {
  const result = calculateMeasurements(f.input)
  for (const [key, value] of Object.entries(f.expected)) assert.equal(result[key], value, key)
})
test('mobile and portal share all legacy workflow aliases', () => {
  const dart = fs.readFileSync('../HEM_Agent/lib/core/case_status.dart', 'utf8').split('const aliases = {')[1].split('};')[0]
  for (const match of dart.matchAll(/'([^']+)': '([^']+)'/g)) {
    assert.equal(normalizeCaseStatus(match[1]), match[2])
    assert.equal(fieldWorkLocked(match[1]), ['field_visit_done','report_drafted','in_review','reviewed','completed'].includes(match[2]))
  }
})
test('report API maps case GPS and visit date even without browser overrides', async () => {
  let generated
  const { getTemplate } = load('src/lib/report-engine/templates.ts', {'../../../template-registry.json': require('../template-registry.json')})
  const { POST } = load('src/app/api/generate-template-report/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/api/route': { withApi: handler => req => handler(req, {}), ApiError: Error },
    '@/lib/api/body': { boundedRequest: async req => req },
    '@/lib/reports/persistence': { reportCase: async () => ({id:'case',extracted_data:{},case_location:[{latitude:12.9,longitude:77.6,created_at:'2026-10-11T10:00:00Z'}]}),persistReport:async()=> 'report' },
    '@/lib/report-engine/templates': {findTemplate:()=>getTemplate('veritas')},
    '@/lib/report-engine/report': {generateReport:async(_id,data)=>{generated=data;return {buffer:Buffer.from('test'),extension:'docx',contentType:'application/octet-stream'}}},
    '@/lib/reports/measurement-appendix': {appendMeasurements:async buffer=>buffer},
  })
  const form = new FormData(); form.set('case_id','case');form.set('revision','1');form.set('report_id','veritas');form.set('data_json','{}')
  const response=await POST(new Request('http://localhost/api/generate-template-report',{method:'POST',body:form}))
  assert.equal(response.status,200);assert.equal(generated.latitude,'12.9');assert.equal(generated.longitude,'77.6');assert.equal(generated.inspection_date,'2026-10-11')
})

test('legacy Veritas API uses the same mapped and recalculated dossier', async () => {
  let generated, snapshot
  const { veritas } = load('src/lib/report-engine/templates.ts', {'../../../template-registry.json': require('../template-registry.json')})
  const input = require('../../qa/fixtures/measurements.json')[0].input
  const { POST } = load('src/app/api/generate-veritas-report/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/api/route': { withApi: handler => req => handler(req, {}), ApiError: Error },
    '@/lib/api/body': {readJsonObject: req => req.json()},
    '@/lib/reports/persistence': {reportCase: async()=>({id:'case',extracted_data:{...input,property_usage:'Residential'}}), persistReport:async(_c,_r,_t,data)=>{snapshot=data;return 'report'}},
    '@/lib/report-engine/templates': {veritas},
    '@/lib/veritas_report': {generateDocx:async data=>{generated=data;return Buffer.from('test')}},
    '@/lib/reports/images': {reportImage:async()=>null},
    '@/lib/reports/measurement-appendix': {appendMeasurements:async buffer=>buffer},
  })
  const response=await POST(new Request('http://localhost/api/generate-veritas-report',{method:'POST',body:JSON.stringify({case_id:'case',revision:1,data:{land_value:'1',total_property_value:'2'}})}))
  assert.equal(response.status,200);assert.equal(generated.usage,'Residential');assert.equal(generated.land_value,'1200000');assert.equal(snapshot.total_property_value,'1800000');assert.equal(snapshot.measurements.total_value,'1800000')
})

test('ZIP export preserves repeated media names, report extensions and zero values', async () => {
  const JSZip = require('jszip')
  const supabase = {
    from: table => ({select:()=>({eq:()=>table==='cases'?{single:async()=>({data:{id:'qa',extracted_data:{land_rate:0},case_location:[]}})}:Promise.resolve({data:table==='case_photos'?[{photo_type:'Exterior',file_url:'https://qa.invalid/one'},{photo_type:'Exterior',file_url:'https://qa.invalid/two'}]:table==='case_reports'?[{template_id:'kreditbee',storage_path:'qa/report.xlsx'}]:[]})})}),
    storage:{from:()=>({createSignedUrls:async()=>({data:[{signedUrl:'https://qa.invalid/report'}]})})},
  }
  const { GET }=load('src/app/api/export-media/route.ts',{
    'next/server':{NextResponse:Response},
    '@/lib/api/route':{requireUuid:()=>{},withApi:handler=>req=>handler(req,{supabase})},
    '@/lib/reports/storage':{signFiles:async(_s,rows)=>rows},
  })
  const previous=global.fetch
  try {
    global.fetch=async()=>new Response('synthetic artifact')
    const response=await GET(new Request('http://localhost/api/export-media?caseId=qa'))
    const zip=await JSZip.loadAsync(await response.arrayBuffer())
    assert.ok(zip.file('photos/1_Exterior.jpg'));assert.ok(zip.file('photos/2_Exterior.jpg'));assert.ok(zip.file('reports/1_kreditbee.xlsx'))
    assert.match(await zip.file('case_data.csv').async('text'),/"land_rate","0"/)
  } finally {global.fetch=previous}
})
