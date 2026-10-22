// Run from hem_portal after the template completeness tests pass.
const fs = require('node:fs')
const { load } = require('../tests/load.cjs')
const { templates } = load('src/lib/report-engine/templates.ts', { '../../../template-registry.json': require('../template-registry.json') })
const { fieldBinding, isCalculatedField, reportFieldOrigin } = load('src/lib/reports/field-mapping.ts')
const output = '../qa/runs/2026-10-17-template-audit/'
fs.mkdirSync(output, { recursive: true })
const quote = value => '"' + String(value ?? '').replaceAll('"', '""') + '"'
const rows = [['Template', 'Field ID', 'Field label', 'Input type', 'Population', 'Source / derivation', 'Output destination']]
const counts = []
for (const template of templates) {
  const c = { template: template.client, id: template.id, visible: 0, agent: 0, calculated: 0, separate: 0, photos: template.photoSlots.length }
  for (const field of template.fields) {
    const bound = fieldBinding(template.id, field.id)
    const calculated = isCalculatedField(template.id, field.id)
    const kind = field.mirrorOf ? 'Mirror' : field.composeTemplate ? 'Composed' : calculated ? 'Calculated' : bound ? 'Agent / case' : 'Separate report input'
    if (!field.hidden) {
      c.visible++
      if (calculated) c.calculated++
      else if (bound) c.agent++
      else c.separate++
    }
    const target = template.id === 'veritas' ? 'Veritas named field' : field.sheet ? `${field.sheet}!${field.cell}` : field.paragraphIndex !== undefined ? `Paragraph ${field.paragraphIndex}` : field.bodyChild !== undefined ? `Body child ${field.bodyChild}` : `Table ${field.table}, row ${field.row}, cell ${field.cell}`
    rows.push([template.id, field.id, field.label, field.cellType || 'text', kind, field.mirrorOf ? `Mirror of ${field.mirrorOf}` : field.composeTemplate || reportFieldOrigin(template.id, field.id), target])
  }
  counts.push(c)
}
fs.writeFileSync(output + 'field-mapping.csv', rows.map(row => row.map(quote).join(',')).join('\n') + '\n')
fs.writeFileSync(output + 'summary.json', JSON.stringify(counts, null, 2) + '\n')
const sum = key => counts.reduce((total, row) => total + row[key], 0)
const summary = `# Built-in template mapping audit - 17 October 2026

All ${templates.length} built-in template definitions were checked using synthetic data. The completeness tests generate actual DOCX/XLSX files, verify each independent report input, verify every configured agent binding (including dates, coordinates and floor rows), and check the image bytes at every media slot. Existing valuation tests check area units, rates and calculated totals.

The audit covers ${sum('visible')} visible report fields and ${sum('photos')} photo slots. Of the visible fields, ${sum('agent')} have case/agent bindings, ${sum('calculated')} are calculated by the mapping layer, and ${sum('separate')} are separate lender inputs. Hidden mirrors and document composition fields are tested as well. Workbook formulas are preserved and covered by the existing formula tests; this does not mean every workbook formula was independently recalculated.

| Template | Visible fields | Agent/case | Calculated | Separate inputs | Photo slots |
| --- | ---: | ---: | ---: | ---: | ---: |
${counts.map(c => `| ${c.id} | ${c.visible} | ${c.agent} | ${c.calculated} | ${c.separate} | ${c.photos} |`).join('\n')}

## Issues corrected

- Aditya Birla LAP: the supporting-document paragraph points into the sale-deed cell. It now mirrors the deed-details input instead of overwriting it with another field.
- Excel date fields: twelve date cells in ICICI, JM Finance, Niwas, SMFG Rural LAP and KreditBee now accept calendar dates and write Excel date serials while preserving cell styles. Empty dates clear the previous template values. Invalid dates are rejected. Date pickers replace plain text entry for those fields.

## Limits and use

A blank source stays blank. Lender-specific legal details, approved/documentary areas, signatures, government rates and similar inputs require verified user data; measured site areas do not silently replace them. Missing photographs cannot be created from the field data.

These are generated-file content checks. They do not certify every template's page layout or the correctness of a real inspection. No live cases or storage records were modified during this audit.

Run node --test tests/template-completeness.test.cjs from hem_portal to repeat the checks. The accompanying field-mapping.csv lists every field, input type, source and destination. Generate the inventory with node scripts/audit-template-mapping.cjs.
`
fs.writeFileSync(output + 'README.md', summary)
console.log(`Wrote ${rows.length - 1} field mappings for ${templates.length} templates and ${sum('photos')} photo slots to ${output}`)
