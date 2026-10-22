import JSZip from 'jszip'
import { calculateMeasurements, measurementGroups, areaUnits, unit } from '@/lib/valuation/measurements'
const xml = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
export async function appendMeasurements(buffer: Buffer, extension: string, input: Record<string, unknown>) {
  const d = calculateMeasurements(input)
  const rows: string[][] = [['Site measurements and valuation'], ['All side measurements are in feet. Area uses average opposite sides; irregular plots require survey verification.'], ['Component', 'East (fts)', 'West (fts)', 'North (fts)', 'South (fts)', 'Area', 'Area unit', 'Rate (INR)', 'Rate per', 'Value (INR)']]
  for (const g of measurementGroups) rows.push([g.label, ...['east', 'west', 'north', 'south'].map(s => String(d[`${g.prefix}_measurements_${s}`] ?? '')), String(d[g.area] ?? ''), areaUnits[unit(d[`${g.area}_unit`])], String(d[g.rate] ?? ''), areaUnits[unit(d[`${g.rate}_unit`])], String(d[g.amount] ?? '')])
  rows.push(['Total valuation (INR)', String(d.total_value ?? '')], ['Included in total', measurementGroups.filter(g => d[`include_${g.prefix}_value`] ?? (g.prefix !== 'slab')).map(g => g.label).join(', ')])
  const zip = await JSZip.loadAsync(buffer)
  if (extension === 'docx') {
    let doc = await zip.file('word/document.xml')!.async('text')
    const docRows = [rows[0], rows[1], ...measurementGroups.flatMap((g, i) => { const row = rows[i+3]; return [[g.label], [`East: ${row[1]} fts; West: ${row[2]} fts; North: ${row[3]} fts; South: ${row[4]} fts`], [`Area: ${row[5]} ${row[6]}; Rate: INR ${row[7]} per ${row[8]}; Value: INR ${row[9]}`]] }), ...rows.slice(6)]
    const appendix = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>' + docRows.map(row => `<w:p><w:r><w:t xml:space="preserve">${xml(row.join(' | '))}</w:t></w:r></w:p>`).join('')
    // Section properties must remain the final child of the document body.
    const position = doc.lastIndexOf('<w:sectPr')
    if (position >= 0) doc = doc.slice(0, position) + appendix + doc.slice(position)
    else doc = doc.replace('</w:body>', appendix + '</w:body>')
    zip.file('word/document.xml', doc)
  } else {
    const workbook = await zip.file('xl/workbook.xml')!.async('text')
    const relations = await zip.file('xl/_rels/workbook.xml.rels')!.async('text')
    const types = await zip.file('[Content_Types].xml')!.async('text')
    const id = Math.max(0, ...Array.from(workbook.matchAll(/sheetId="(\d+)"/g), m => Number(m[1]))) + 1
    const rid = `rIdHemMeasurements${id}`, name = `hem_measurements_${id}.xml`
    const sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="10" width="22" customWidth="1"/></cols><sheetData>' + rows.map((row, i) => `<row r="${i + 1}">${row.map((v, j) => `<c r="${String.fromCharCode(65+j)}${i+1}" t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`).join('')}</row>`).join('') + '</sheetData></worksheet>'
    zip.file(`xl/worksheets/${name}`, sheet)
    zip.file('xl/workbook.xml', workbook.replace('</sheets>', `<sheet name="HEM Measurements" sheetId="${id}" r:id="${rid}"/></sheets>`))
    zip.file('xl/_rels/workbook.xml.rels', relations.replace('</Relationships>', `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/${name}"/></Relationships>`))
    zip.file('[Content_Types].xml', types.replace('</Types>', `<Override PartName="/xl/worksheets/${name}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`))
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
}
