const test = require('node:test')
const assert = require('node:assert/strict')
const JSZip = require('jszip')
const sharp = require('sharp')
const { DOMParser } = require('@xmldom/xmldom')
const { load } = require('./load.cjs')
const { templates } = load('src/lib/report-engine/templates.ts', { '../../../template-registry.json': require('../template-registry.json') })
const { mapReportFields, isCalculatedField, fieldBinding } = load('src/lib/reports/field-mapping.ts')
const { generateReport } = load('src/lib/report-engine/report.ts')
const nodes = (node, tag) => Array.from(node.getElementsByTagNameNS('*', tag))
const parse = xml => new DOMParser().parseFromString(xml, 'application/xml')

async function inspectOutput(zip, template) {
  if (template.kind === 'docx') {
    const doc = parse(await zip.file('word/document.xml').async('text'))
    return field => {
      if (template.id === 'veritas') return doc.documentElement.textContent
      if (field.paragraphIndex !== undefined) return nodes(doc, 'p')[field.paragraphIndex]?.textContent
      const body = nodes(doc, 'body')[0]
      if (field.bodyChild !== undefined) return Array.from(body.childNodes).filter(n=>n.nodeType===1)[field.bodyChild]?.textContent
      return nodes(nodes(nodes(body,'tbl')[field.table],'tr')[field.row],'tc')[field.cell]?.textContent
    }
  }
  const shared = nodes(parse(await zip.file('xl/sharedStrings.xml').async('text')), 'si').map(n=>n.textContent)
  const workbook = parse(await zip.file('xl/workbook.xml').async('text'))
  const rels = nodes(parse(await zip.file('xl/_rels/workbook.xml.rels').async('text')), 'Relationship')
  const sheets = new Map()
  for (const sheet of nodes(workbook,'sheet')) {
    const target = rels.find(r=>r.getAttribute('Id')===sheet.getAttribute('r:id')).getAttribute('Target')
    sheets.set(sheet.getAttribute('name'),parse(await zip.file(target.startsWith('/')?target.slice(1):`xl/${target}`).async('text')))
  }
  return field => {
    const cell = nodes(sheets.get(field.sheet),'c').find(c=>c.getAttribute('r')===field.cell)
    if (!cell) return undefined
    if (field.cellType==='date' && cell.textContent) {
      const date1904 = ['1','true'].includes(nodes(workbook,'workbookPr')[0]?.getAttribute('date1904'))
      const epoch = date1904 ? Date.UTC(1904,0,1) : Date.UTC(1899,11,30)
      return new Date(epoch+Number(cell.textContent)*86400000).toISOString().slice(0,10)
    }
    return cell.getAttribute('t')==='s' ? shared[Number(nodes(cell,'v')[0]?.textContent)] : cell.textContent
  }
}

for (const template of templates) {
  test(`${template.id}: every independent report input survives generation in its destination`,async()=>{
    const overrides = {}
    const fields = template.fields.filter(f=>!f.hidden&&!f.mirrorOf&&!f.composeTemplate&&!isCalculatedField(template.id,f.id))
    fields.forEach((f,i)=>{overrides[f.id]=f.cellType==='date'?'2026-10-17':f.cellType==='number'?String(700001+i):`QA_FIELD_${String(i).padStart(4,'0')}_END`})
    const mapped = mapReportFields(template,{},overrides)
    const output = await generateReport(template.id,mapped,[],template)
    const read = await inspectOutput(await JSZip.loadAsync(output.buffer),template)
    for (const field of fields) assert.ok(read(field)?.includes(overrides[field.id]),`${field.id} (${field.label}) lost or overwritten`)
    // Mirrored and composed fields must use their actual source input too.
    for (const field of template.fields.filter(f=>f.mirrorOf||f.composeTemplate)) {
      const refs = field.mirrorOf ? [field.mirrorOf] : [...field.composeTemplate.matchAll(/\{([^}]+)\}/g)].map(m=>m[1])
      for (const ref of refs.filter(ref=>overrides[ref])) assert.ok(read(field)?.includes(overrides[ref]),`${field.id} lost ${ref}`)
    }
  })
  test(`${template.id}: every agent binding fills the generated destination, including dates, coordinates and floors`,async()=>{
    const source={}
    const fields=template.fields.filter(f=>fieldBinding(template.id,f.id)&&!isCalculatedField(template.id,f.id)&&!f.mirrorOf&&!f.composeTemplate)
    const floors=new Set()
    for(const f of fields){
      const binding=fieldBinding(template.id,f.id)
      if(binding.floor){floors.add(binding.floor);continue}
      for(const key of binding.sources||[binding.source]) source[key]=`QA_SOURCE_${key}_END`
      if(binding.format==='date')source[binding.source]='2026-10-17T12:30:00Z'
      if(binding.format==='feet-to-metres')source[binding.source]='30'
      if(binding.format==='coordinates'){source.latitude='17.123456';source.longitude='82.654321'}
    }
    // One source can feed both a numeric and a text cell.
    for(const f of fields.filter(f=>f.cellType==='number')){
      const binding=fieldBinding(template.id,f.id)
      if(binding.source&&!binding.floor&&!binding.format)source[binding.source]='123456'
    }
    source.floor_wise_area=[...floors].map((floor,i)=>({floor,plinthArea:111+i*37}))
    const mapped=mapReportFields(template,source)
    const generated=await generateReport(template.id,mapped,[],template)
    const read=await inspectOutput(await JSZip.loadAsync(generated.buffer),template)
    for(const f of fields){
      const binding=fieldBinding(template.id,f.id)
      let expected=source[binding.source]
      if(binding.floor)expected=source.floor_wise_area.find(row=>row.floor===binding.floor).plinthArea
      if(binding.format==='date')expected='2026-10-17'
      if(binding.format==='feet-to-metres')expected='9.144'
      if(binding.format==='coordinates')expected=binding.sources.map(key=>source[key]).join(', ')
      assert.equal(mapped[f.id],String(expected),`${f.id}: binding lost source`)
      assert.ok(read(f)?.includes(String(expected)),`${f.id}: bound value lost in generated file`)
    }
  })
  test(`${template.id}: every photo reaches its own media slot`,async()=>{
    const slots=template.photoSlots||[]
    const colors=slots.map((_,i)=>({r:30+i*13%180,g:50+i*29%160,b:70+i*47%140}))
    const photos=await Promise.all(colors.map(async color=>new Blob([await sharp({create:{width:24,height:40,channels:3,background:color}}).png().toBuffer()])))
    const result=await generateReport(template.id,{},photos,template)
    const zip=await JSZip.loadAsync(result.buffer)
    assert.equal(new Set(slots.map(s=>s.media)).size,slots.length,'duplicate media targets')
    for(const [i,slot]of slots.entries()){
      const {data,info}=await sharp(await zip.file(slot.media).async('nodebuffer')).removeAlpha().raw().toBuffer({resolveWithObject:true})
      const center=(Math.floor(info.height/2)*info.width+Math.floor(info.width/2))*info.channels
      for(const [channel,key]of ['r','g','b'].entries())assert.ok(Math.abs(data[center+channel]-colors[i][key])<12,`${slot.label} received the wrong photo`)
    }
  })
}

test('spreadsheet date cells preserve their numeric style, reject invalid dates and clear old dates',async()=>{
  const template=templates.find(t=>t.id==='icici')
  const result=await generateReport(template.id,{icici_77:'2024-02-29'},[],template)
  const zip=await JSZip.loadAsync(result.buffer)
  const sheet=parse(await zip.file('xl/worksheets/sheet1.xml').async('text'))
  const cell=nodes(sheet,'c').find(c=>c.getAttribute('r')==='F94')
  assert.notEqual(cell.getAttribute('t'),'s')
  assert.equal(Number(nodes(cell,'v')[0].textContent),(Date.UTC(2024,1,29)-Date.UTC(1899,11,30))/86400000)
  const cleared=nodes(sheet,'c').find(c=>c.getAttribute('r')==='F107')
  assert.equal(nodes(cleared,'v').length,0)
  await assert.rejects(generateReport(template.id,{icici_77:'2026-02-30'},[],template),/Invalid date/)
})
