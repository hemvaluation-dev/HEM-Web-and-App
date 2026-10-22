const test = require('node:test')
const assert = require('node:assert/strict')
const JSZip = require('jszip')
const { DOMParser } = require('@xmldom/xmldom')
const { load } = require('./load.cjs')
const registry = require('../template-registry.json')
const { templates, getTemplate } = load('src/lib/report-engine/templates.ts', { '../../../template-registry.json': registry })
const { lenderBindings } = load('src/lib/reports/lender-bindings.ts')
const { mapReportFields, isCalculatedField } = load('src/lib/reports/field-mapping.ts')
const { generateReport } = load('src/lib/report-engine/report.ts')
const nodes = (el, name) => Array.from(el.getElementsByTagNameNS('*', name))
const parse = xml => new DOMParser().parseFromString(xml, 'application/xml')
test('report area conversion uses original dimensions without rounded-area drift', () => {
  const source = {land_measurements_east:30,land_measurements_west:30,land_measurements_north:40,land_measurements_south:40,land_area_unit:'sqyd'}
  assert.equal(mapReportFields(getTemplate('veritas'), source).land_sft, '1200')
  assert.equal(mapReportFields(getTemplate('kreditbee'), source).kreditbee_49, '1200')
})
test('draft reports map case fields without a captured location', () => {
  for (const template of templates) {
    assert.deepEqual(mapReportFields(template, {}, {}, {application_number:'QA-DRAFT'}, null), mapReportFields(template, {}, {}, {application_number:'QA-DRAFT'}, {}))
  }
  const fields = mapReportFields(getTemplate('veritas'), {}, {}, {application_number:'QA-DRAFT', applicant_name:'QA ONLY'}, null)
  assert.equal(fields.application_number, 'QA-DRAFT')
  assert.equal(fields.applicant_name, 'QA ONLY')
  assert.equal(fields.latitude, '')
  assert.equal(fields.inspection_date, '')
})
test('explicit bindings reference real fields and never guess labels', () => {
  assert.equal(templates.length, 14)
  for (const [id, bindings] of Object.entries(lenderBindings)) for (const key of Object.keys(bindings)) assert.ok(getTemplate(id).fields.some(f => f.id === key), key)
  assert.equal(mapReportFields({id:'unknown',fields:[{id:'x',label:'Applicant name',sourceKey:'applicant_name'}]}, {applicant_name:'AGENT'}).x, '')
})
test('document, site, approved and individual floor areas stay distinct', () => {
  const source = {boundaries_document_west:'DOC WEST',boundaries_physical_west:'SITE WEST',bua:100,floor_wise_area:[{floor:'First Floor',plinthArea:222},{floor:'Ground Floor',plinthArea:111}]}
  const t = getTemplate('ugrow'), mapped = mapReportFields(t,source)
  for (const [cell,value] of [['C40','SITE WEST'],['D40','DOC WEST']]) assert.equal(mapped[t.fields.find(f=>f.cell===cell).id],value)
  assert.equal(mapReportFields(getTemplate('equitas'),source).equitas_53,'')
  for (const t of templates) {
    const d=mapReportFields(t,source)
    for (const [key,b] of Object.entries(lenderBindings[t.id]||{})) {
      if(b.floor==='ground') assert.equal(d[key],'111',key)
      if(b.floor==='first') assert.equal(d[key],'222',key)
      if(b.floor==='gf1') assert.equal(d[key],'',key)
    }
  }
})
test('JM converts metres and rural adopted rates remain separate from market inquiries',()=>{
 const source={land_area:100,land_area_unit:'sqyd',land_rate:9000,land_rate_unit:'sqyd',approach_road_width:20}
 const d=mapReportFields(getTemplate('jm-finance'),source)
 assert.equal(d['jm-finance_86'],'83.612736');assert.equal(d['jm-finance_site_e161'],'900');assert.equal(d['jm-finance_site_g161'],'1000');assert.equal(d['jm-finance_47'],'6.096')
 const r=mapReportFields(getTemplate('smfg-rural-lap'),source)
 assert.equal(r['smfg-rural-lap_71'],'9000');assert.equal(r['smfg-rural-lap_69'],'')
})
test('mapped agent values appear in actual lender cells across all 14 generated files',async()=>{
 for(const t of templates){
  const bindings=lenderBindings[t.id]||{applicant_name:{source:'applicant_name'}},source={}
  for(const b of Object.values(bindings))if(b.source&&!b.floor&&!b.format)source[b.source]=`QA_${b.source}_VALUE`
  for(const f of t.fields)if(f.cellType==='number'&&bindings[f.id]?.source)source[bindings[f.id].source]='123'
  const mapped=mapReportFields(t,source),output=await generateReport(t.id,mapped,[],t),zip=await JSZip.loadAsync(output.buffer)
  const doc=t.kind==='docx'?parse(await zip.file('word/document.xml').async('text')):null,sheets={}
  if(!doc){
   const wb=parse(await zip.file('xl/workbook.xml').async('text')),rels=parse(await zip.file('xl/_rels/workbook.xml.rels').async('text'))
   for(const sh of nodes(wb,'sheet')){
    const target=nodes(rels,'Relationship').find(r=>r.getAttribute('Id')===sh.getAttribute('r:id')).getAttribute('Target')
    sheets[sh.getAttribute('name')]=parse(await zip.file(target.startsWith('/')?target.slice(1):`xl/${target}`).async('text'))
   }
  }
  const shared=zip.file('xl/sharedStrings.xml')?nodes(parse(await zip.file('xl/sharedStrings.xml').async('text')),'si').map(n=>n.textContent):[]
  let checked=0
  for(const f of t.fields){
   const b=bindings[f.id]
   if(!b?.source||b.floor||b.format||isCalculatedField(t.id,f.id)||f.mirrorOf||f.composeTemplate||f.cellType==='number')continue
   const expected=source[b.source];if(!expected||mapped[f.id]!==expected)continue
   let text
   if(t.id==='veritas')text=nodes(nodes(nodes(doc,'tbl')[0],'tr')[5],'tc')[1].textContent
   else if(doc&&(typeof f.paragraphIndex==='number'||typeof f.bodyChild==='number'))text=doc.documentElement.textContent
   else if(doc)text=nodes(nodes(nodes(doc,'tbl')[f.table],'tr')[f.row],'tc')[f.cell].textContent
   else {const cell=nodes(sheets[f.sheet],'c').find(c=>c.getAttribute('r')===f.cell);text=cell?.getAttribute('t')==='s'?shared[Number(cell.textContent)]:cell?.textContent}
   assert.ok(text?.includes(expected),`${t.id} ${f.id} ${f.cell}: ${text} expected ${expected}`);checked++
  }
  assert.ok(checked>0,t.id)
 }
})

test('generated Word reports have no run highlight or text shading, including inherited styles', async () => {
  for (const template of templates.filter(t => t.kind === 'docx')) {
    const output = await generateReport(template.id, {}, [], template)
    const zip = await JSZip.loadAsync(output.buffer)
    for (const name of Object.keys(zip.files).filter(name => /^word\/.*\.xml$/.test(name))) {
      const doc = parse(await zip.file(name).async('text'))
      for (const rPr of nodes(doc, 'rPr')) {
        assert.equal(nodes(rPr, 'shd').length, 0, `${template.id}: ${name} shading`)
        assert.equal(nodes(rPr, 'highlight').length, 0, `${template.id}: ${name} highlight`)
      }
    }
  }
})

test('Veritas maps saved review data without a case_location row', async () => {
  const template = getTemplate('veritas')
  const mapped = mapReportFields(template, {
    owner_name: 'QA Document Owner', panchayat_name: 'QA Gram Panchayat',
    road_width: '', approach_road_width: '18', gps_coordinates: '16.922773, 82.007830',
    property_documents_verified: '', property_usage: 'NA', occupancy_details: 'NA',
    land_measurements_east: '18', land_measurements_west: '18', land_measurements_north: '35', land_measurements_south: '35',
    plinth_measurements_east: '13', plinth_measurements_west: '13', plinth_measurements_north: '26', plinth_measurements_south: '26',
    land_area_unit: 'sqft', bua_unit: 'sqft', land_rate: '1111', land_rate_unit: 'sqft', construction_rate: '2300', construction_rate_unit: 'sqft',
  }, {}, {}, null)
  assert.equal(mapped.document_holder_name, 'QA Document Owner')
  assert.equal(mapped.civic_status, 'QA Gram Panchayat')
  assert.equal(mapped.road_width, '18')
  assert.equal(mapped.latitude, '16.922773')
  assert.equal(mapped.longitude, '82.007830')
  assert.equal(mapped.usage, 'NA')
  assert.equal(mapped.documents_list, '')
  assert.equal(mapped.existing_bua, '338')
  assert.equal(mapped.total_property_value, '1477330')
  const output = await generateReport('veritas', mapped, [], template)
  const zip = await JSZip.loadAsync(output.buffer)
  const doc = parse(await zip.file('word/document.xml').async('text'))
  const rows = nodes(nodes(doc, 'tbl')[0], 'tr')
  for (const [row, cell, value] of [[11,1,mapped.document_holder_name],[23,1,mapped.civic_status],[62,1,'18'],[19,2,mapped.latitude],[20,2,mapped.longitude]]) {
    assert.equal(nodes(nodes(rows[row], 'tc')[cell], 't').map(t=>t.textContent).join(''),value)
  }
})
test('Veritas fallbacks preserve explicit edits and reject invalid GPS text', () => {
  const template = getTemplate('veritas')
  const source = {road_width:'12',approach_road_width:'18',civic_status:'Municipality',panchayat_name:'Other',gps_coordinates:'91, 82'}
  const mapped = mapReportFields(template, source)
  assert.equal(mapped.road_width,'12');assert.equal(mapped.civic_status,'Municipality');assert.equal(mapped.latitude,'')
  assert.equal(mapReportFields(template,source,{document_holder_name:'Manual owner'}).document_holder_name,'Manual owner')
})
