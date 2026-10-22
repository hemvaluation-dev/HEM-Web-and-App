const test = require('node:test')
const assert = require('node:assert/strict')
const JSZip = require('jszip')
const { DOMParser } = require('@xmldom/xmldom')
const { load } = require('./load.cjs')
const { generateReport } = load('src/lib/report-engine/report.ts')
const registry = require('../template-registry.json')

test('Veritas disclaimer contains no previous inspection observations', async () => {
  const output = await generateReport('veritas', { comments: 'Synthetic case observation' }, [], {})
  const zip = await JSZip.loadAsync(output.buffer)
  const doc = new DOMParser().parseFromString(await zip.file('word/document.xml').async('text'), 'application/xml')
  const table = doc.getElementsByTagName('w:tbl')[0]
  const note = table.getElementsByTagName('w:tr')[119]
  assert.equal(note.getElementsByTagName('w:p').length, 1)
  assert.match(note.textContent, /^Note:Valuation report/)
  assert.ok(note.textContent.endsWith('related to the property.'))
  assert.ok(doc.documentElement.textContent.includes('Synthetic case observation'))
})

test('KreditBee numeric fields replace textual placeholders with valid numeric cells', async () => {
  const template = registry.find(t => t.id === 'kreditbee')
  const output = await generateReport('kreditbee', { kreditbee_h99: '1,800', kreditbee_f99: '1200' }, [], template)
  const zip = await JSZip.loadAsync(output.buffer)
  const doc = new DOMParser().parseFromString(await zip.file('xl/worksheets/sheet1.xml').async('text'), 'application/xml')
  const cells = Array.from(doc.getElementsByTagName('c'))
  const rate = cells.find(c => c.getAttribute('r') === 'H99')
  assert.notEqual(rate.getAttribute('t'), 's')
  assert.equal(rate.getElementsByTagName('v')[0].textContent, '1800')
  const total = cells.find(c => c.getAttribute('r') === 'J99')
  assert.equal(total.getElementsByTagName('f')[0].textContent, 'F99*H99')
})
