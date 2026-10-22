import { generateReport } from './report-engine/report'
import { veritas } from './report-engine/templates'

export type ReportData = Record<string, string>

/** Compatibility entry point; all Veritas exports use the same validated mappings. */
export async function generateDocx(data: ReportData, photos: (Blob | null)[], extras: (Blob | null)[]): Promise<Buffer> {
  const result = await generateReport('veritas', data, [...photos, ...extras], veritas)
  return result.buffer
}
