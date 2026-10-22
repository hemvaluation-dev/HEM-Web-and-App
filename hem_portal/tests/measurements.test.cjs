const test = require('node:test')
const assert = require('node:assert/strict')
const JSZip = require('jszip')
const { load } = require('./load.cjs')
const m = load('src/lib/valuation/measurements.ts')
const { mapReportFields } = load('src/lib/reports/field-mapping.ts')
const registry = require('../template-registry.json')
const { getTemplate, templates } = load('src/lib/report-engine/templates.ts', { '../../../template-registry.json': registry })
const { generateReport } = load('src/lib/report-engine/report.ts')
const { appendMeasurements } = load('src/lib/reports/measurement-appendix.ts')
const input = { land_measurements_east: '30', land_measurements_west: '30', land_measurements_north: '40', land_measurements_south: '40', plinth_measurements_east: '20', plinth_measurements_west: '20', plinth_measurements_north: '30', plinth_measurements_south: '30', slab_measurements_east: '20', slab_measurements_west: '20', slab_measurements_north: '30', slab_measurements_south: '30', land_rate: '9,000', construction_rate: '1000', slab_rate: '100' }
const near = (a, b) => assert.ok(Math.abs(Number(a) - b) < .01, `${a} != ${b}`)
test('feet measurements, legacy units, conversion and independently selected amounts', () => {
  const d = m.calculateMeasurements(input)
  near(d.land_area, 1200/9); near(d.bua, 600/9); near(d.land_value, 1200000); near(d.building_value, 600000); near(d.slab_value, 60000); near(d.total_value, 1800000)
  const next = m.changeUnit(m.changeUnit(d, 'land_area', 'sqm'), 'land_rate', 'sqm')
  near(next.land_area, 111.483648); near(next.land_value, 1200000)
  near(m.calculateMeasurements({ ...next, include_slab_value: true }).total_value, 1860000)
  near(m.calculateMeasurements({ ...next, include_slab_value: true, include_land_value: false, include_plinth_value: false }).total_value, 60000)
  assert.equal(m.calculateMeasurements({ ...input, land_measurements_east: '' }).land_area, '')
  assert.equal(m.calculateMeasurements({ ...input, land_measurements_east: '-1' }).total_value, '')
  near(m.calculateMeasurements({ ...input, land_rate: 0 }).land_value, 0)
})
test('Veritas HL receives agent fields, unit-correct areas and rates and calculated amounts', () => {
  const d = mapReportFields(getTemplate('VERITAS-HL'), { ...input, property_usage: 'Residential', boundaries_document_east: 'Road', age_of_property: 5, flooring_type: 'Tiles' })
  assert.equal(d.usage, 'Residential'); assert.equal(d.east_title, 'Road'); assert.equal(d.building_age, '5'); assert.equal(d.flooring, 'Tiles')
  near(d.land_sft, 1200); near(d.rate_sft, 1000); near(d.existing_bua, 600); near(d.total_property_value, 1800000)
  const k = mapReportFields(getTemplate('kreditbee'), input)
  near(k.kreditbee_49, 1200); near(k.kreditbee_50, 1000); near(k.kreditbee_f99, 600); near(k.kreditbee_h99, 1000)
})
test('all templates accept mapped agent data and expose calculation summaries in generated files', async () => {
  for (const template of templates) {
    const data = mapReportFields(template, { ...input, applicant_name: 'QA MAPPING ONLY', property_usage: 'Residential' })
    const output = await generateReport(template.id, data, [], template)
    const buffer = await appendMeasurements(output.buffer, output.extension, input)
    const zip = await JSZip.loadAsync(buffer)
    if (output.extension === 'docx') {
      const xml = await zip.file('word/document.xml').async('text')
      assert.ok(xml.includes('Site measurements and valuation'), template.id)
      assert.ok(xml.includes('1800000'), template.id)
    } else {
      const sheet = Object.keys(zip.files).find(name => name.includes('/hem_measurements_'))
      assert.ok(sheet, template.id)
      assert.ok((await zip.file(sheet).async('text')).includes('1800000'), template.id)
      assert.ok((await zip.file('xl/workbook.xml').async('text')).includes('HEM Measurements'))
    }
  }
})
test('legacy PDF mapping preserves selected units and recomputes current dimensions', () => {
  const { applyLegacyMeasurements, legacyMeasurements } = load('src/lib/valuation/legacy.ts')
  const d = applyLegacyMeasurements({ valuation: {} }, m.changeUnit(m.calculateMeasurements(input), 'bua', 'sqm'))
  near(d.valuation.totalConstructionArea, 600)
  near(d.valuation.constructionRate, 1000)
  near(legacyMeasurements(d).bua, 55.741824)
  d.buildingDimensions.east = '40'
  near(legacyMeasurements(d).building_value, 900000)
})
test('report API recalculates forged totals and stores the same measurements used for output', async () => {
  let generated, saved
  const { POST } = load('src/app/api/generate-template-report/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/api/route': { withApi: handler => req => handler(req, {}), ApiError: Error },
    '@/lib/api/body': { boundedRequest: async req => req },
    '@/lib/reports/persistence': { reportCase: async () => ({ id: 'case', extracted_data: input }), persistReport: async (_ctx, _case, _id, data) => { saved = data; return 'report' } },
    '@/lib/report-engine/templates': { findTemplate: () => getTemplate('veritas') },
    '@/lib/report-engine/report': { generateReport: async (_id, data) => { generated = data; return { buffer: Buffer.from('test'), extension: 'docx', contentType: 'application/octet-stream' } } },
    '@/lib/reports/measurement-appendix': { appendMeasurements: async buffer => buffer },
    '@/lib/reports/images': {}, '@/lib/reports/storage': {},
  })
  const form = new FormData()
  form.set('case_id', 'case'); form.set('revision', '1'); form.set('report_id', 'veritas')
  form.set('data_json', JSON.stringify({ land_value: '1', total_property_value: '2', usage: 'Commercial' }))
  const response = await POST(new Request('http://localhost/api/generate-template-report', { method: 'POST', body: form }))
  assert.equal(response.status, 200)
  near(generated.land_value, 1200000); near(generated.total_property_value, 1800000)
  assert.equal(generated.usage, 'Commercial')
  assert.equal(saved.total_property_value, saved.measurements.total_value)
})
