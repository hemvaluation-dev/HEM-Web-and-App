type Cell = string | number | boolean | null | undefined

function encodeCell(value: Cell): string {
  let text = value == null ? '' : String(value)
  // Spreadsheet applications interpret these prefixes as executable formulae.
  if (typeof value === 'string' && /^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export function serializeCsv(headers: readonly string[], rows: readonly (readonly Cell[])[]): string {
  for (const row of rows) {
    if (row.length !== headers.length) throw new Error('CSV row does not match its column headers.')
  }
  return '\uFEFF' + [headers, ...rows].map(row => row.map(encodeCell).join(',')).join('\r\n')
}
