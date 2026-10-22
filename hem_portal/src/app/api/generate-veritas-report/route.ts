import { reportCase, persistReport } from '@/lib/reports/persistence'
import { ApiError, withApi } from '@/lib/api/route'
import { readJsonObject } from '@/lib/api/body'
import { reportImage } from '@/lib/reports/images'
import { NextResponse } from 'next/server'
import { calculateMeasurements } from '@/lib/valuation/measurements'
import { mapReportFields } from '@/lib/reports/field-mapping'
import { appendMeasurements } from '@/lib/reports/measurement-appendix'
import { veritas } from '@/lib/report-engine/templates'
import { generateDocx, ReportData } from '@/lib/veritas_report'

export const runtime = 'nodejs'

async function fetchImageAsBlob(url: unknown): Promise<Blob | null> {
  const bytes = await reportImage(url)
  return bytes ? new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' }) : null
}

export const POST = withApi(async (req, context) => {
    const body = await readJsonObject(req)
    const record = await reportCase(context, body.case_id, body.revision)
    if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
      return new NextResponse('Missing body data', { status: 400 })
    }

    if (!Object.values(body.data).every(value => typeof value === 'string')) {
      throw new ApiError(400, 'INVALID_FIELDS', 'Report fields must contain text.')
    }
    const edits = body.measurements ?? {}
    if (!edits || typeof edits !== 'object' || Array.isArray(edits)) throw new ApiError(400, 'INVALID_BODY', 'Supply an object for measurements.')
    const measurements = calculateMeasurements({ ...(record.extracted_data || {}), ...edits })
    const location = Array.isArray(record.case_location) ? record.case_location[0] : record.case_location
    const data = mapReportFields(veritas, measurements, body.data as ReportData, record, location || {});
    const photoUrls = body.photos ?? [];
    const extraUrls = body.extras ?? [];
    if (!Array.isArray(photoUrls) || photoUrls.length > 12 || !Array.isArray(extraUrls) || extraUrls.length > 5) {
      throw new ApiError(400, 'INVALID_IMAGES', 'Use at most 12 photos and 5 additional images.')
    }

    // Decode one image at a time to bound peak memory for large photographs.
    const photos: (Blob | null)[] = [];
    const extras: (Blob | null)[] = [];
    for (let i = 0; i < 12; i++) photos.push(await fetchImageAsBlob(photoUrls[i]));
    for (let i = 0; i < 5; i++) extras.push(await fetchImageAsBlob(extraUrls[i]));

    const buffer = await appendMeasurements(await generateDocx(data, photos, extras), 'docx', measurements);

    const version = await persistReport(context, record, 'veritas', { ...data, measurements }, buffer, 'docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    const applicant = (data.applicant_name || 'Valuation-Report').replace(/[^a-z0-9]+/gi, '-')
    const filename = `Veritas_Report_${applicant}.docx`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'X-Report-Version': version,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
}, { workload: 'report' })
