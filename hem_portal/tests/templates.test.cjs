const test = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('./load.cjs')
const registry = require('../template-registry.json')
const catalog = load('src/lib/report-engine/templates.ts', { '../../../template-registry.json': registry })

test('existing institution slugs resolve to the correct report instead of the generic PDF', () => {
  for (const name of ['KREDITBEE', 'KREDIT BEE', 'kreditbee_template', 'kredit_bee_template', 'KRAZYBEE SERVICES LIMITED']) {
    assert.equal(catalog.getTemplate(name).id, 'kreditbee')
    assert.equal(catalog.getTemplate(name).kind, 'xlsx')
  }
  for (const name of ['VERITAS', 'veritas_template', 'VERITAS-HL', 'veritas_hl_template', 'veritas_eel_template']) {
    assert.equal(catalog.getTemplate(name).id, 'veritas')
    assert.equal(catalog.getTemplate(name).kind, 'docx')
  }
  for (const template of catalog.templates) assert.equal(catalog.getTemplate(template.id).id, template.id)
  assert.equal(catalog.findTemplate('unconfigured lender'), undefined)
  assert.throws(() => catalog.getTemplate('unconfigured lender'), /supported report template/)
})

test('KreditBee maps unique editable cells, mobile boundaries and building inputs', () => {
  const template = catalog.getTemplate('kreditbee')
  assert.equal(new Set(template.fields.map(f => f.id)).size, template.fields.length)
  assert.equal(new Set(template.fields.map(f => `${f.sheet}!${f.cell}`)).size, template.fields.length)
  const cell = address => template.fields.find(f => f.cell === address)
  assert.equal(cell('D23').sourceKey, 'boundaries_document_east')
  assert.equal(cell('F23').sourceKey, 'boundaries_document_west')
  assert.equal(cell('H25').sourceKey, 'boundaries_physical_north')
  assert.equal(cell('J25').sourceKey, 'boundaries_physical_south')
  for (const address of ['F99', 'H99', 'D80', 'F80', 'H80']) assert.equal(cell(address).cellType, 'number')
  // Derived totals must remain workbook formulas, not editable overrides.
  for (const address of ['F86', 'H86', 'J98', 'J99', 'H105', 'H112']) assert.equal(cell(address), undefined)
})

test('report API uses canonical IDs for generation and version persistence', async () => {
  const calls = []
  const { POST } = load('src/app/api/generate-template-report/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/api/route': { withApi: handler => request => handler(request, {}), ApiError: Error },
    '@/lib/api/body': { boundedRequest: async request => request },
    '@/lib/reports/persistence': { reportCase: async () => ({ id: 'case' }), persistReport: async (_ctx, _case, id) => { calls.push(id); return '1' } },
    '@/lib/report-engine/report': { generateReport: async (id) => { calls.push(id); return { buffer: Buffer.from('test'), extension: 'docx', contentType: 'application/octet-stream' } } },
    '@/lib/reports/measurement-appendix': { appendMeasurements: async buffer => buffer },
    '@/lib/reports/images': {}, '@/lib/reports/storage': {},
    '@/lib/report-engine/templates': catalog,
  })
  const form = new FormData()
  form.set('case_id', 'case'); form.set('revision', '1')
  form.set('report_id', 'VERITAS-HL'); form.set('data_json', '{}')
  const response = await POST(new Request('http://localhost/api/generate-template-report', { method: 'POST', body: form }))
  assert.equal(response.status, 200)
  assert.deepEqual(calls, ['veritas', 'veritas'])
})
