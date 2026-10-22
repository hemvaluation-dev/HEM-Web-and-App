import { calculateMeasurements } from '@/lib/valuation/measurements'
import { mapReportFields } from '@/lib/reports/field-mapping'
import { appendMeasurements } from '@/lib/reports/measurement-appendix'
import { reportCase, persistReport } from '@/lib/reports/persistence'
import { ApiError, withApi } from '@/lib/api/route'
import { boundedRequest } from '@/lib/api/body'
import { NextResponse } from 'next/server'
import { generateReport } from '@/lib/report-engine/report'
import { reportImage } from '@/lib/reports/images'
import { signFiles } from '@/lib/reports/storage'
import { findTemplate } from '@/lib/report-engine/templates'

export const POST = withApi(async (req, context) => {
    const formData = await (await boundedRequest(req)).formData()
    const record = await reportCase(context, formData.get('case_id'), formData.get('revision'))
    const reportId = formData.get('report_id')
    const dataJson = formData.get('data_json')
    
    if (typeof reportId !== 'string' || typeof dataJson !== 'string' || !reportId || !dataJson) {
      return NextResponse.json({ error: 'Missing report_id or data_json' }, { status: 400 })
    }

    const submittedData = JSON.parse(dataJson)
    let data = submittedData
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ApiError(400, 'INVALID_BODY', 'Supply an object for report data.')
    const template = findTemplate(reportId)
    if (!template) throw new ApiError(400, 'INVALID_TEMPLATE', 'Choose a supported report template.')

    const rawMeasurements = formData.get('measurement_json')
    const edits = typeof rawMeasurements === 'string' ? JSON.parse(rawMeasurements) : {}
    if (!edits || typeof edits !== 'object' || Array.isArray(edits)) throw new ApiError(400, 'INVALID_BODY', 'Supply an object for measurements.')
    const measurements = calculateMeasurements({ ...(record.extracted_data || {}), ...edits })
    const location = Array.isArray(record.case_location) ? record.case_location[0] : record.case_location
    data = mapReportFields(template, measurements, submittedData, record, location || {})

    // Extract photos in order (photo_0, photo_1, etc.)
    const photos: (File | Blob | null)[] = []
    const photoCount = template.photoCount || 16 // fallback if not defined
    for (let i = 0; i < photoCount; i++) {
      const file = formData.get(`photo_${i}`)
      if (file !== null && (!(file instanceof File) || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024)) {
        throw new ApiError(400, 'INVALID_IMAGE', 'Use JPEG, PNG, or WebP photos smaller than 8 MB.')
      }
      photos.push(file)
    }

    const photoIds = Array.from({ length: photoCount }, (_, index) => formData.get(`photo_id_${index}`))
    const requested = photoIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
    if (requested.length) {
      const { data: evidence, error } = await context.supabase.from('case_photos')
        .select('id,file_url').eq('case_id', record.id).in('id', requested)
      if (error || !evidence || requested.some(id => !evidence.some(photo => photo.id === id))) {
        throw new ApiError(400, 'INVALID_PHOTO', 'A selected photo does not belong to this case or is no longer available.')
      }
      const signed = await signFiles(context.supabase, evidence, 'photos')
      for (let start = 0; start < photoCount; start += 4) {
        await Promise.all(photoIds.slice(start, start + 4).map(async (id, offset) => {
          if (!id || photos[start + offset]) return
          const photo = signed.find(photo => photo.id === id)!
          const bytes = await reportImage(photo.file_url)
          if (bytes) photos[start + offset] = new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' })
        }))
      }
    }

    // Generate the report buffer using the engine
    const { buffer: generatedBuffer, extension, contentType } = await generateReport(template.id, data, photos, template)

    const buffer = await appendMeasurements(generatedBuffer, extension, measurements)
    const reportVersion = await persistReport(context, record, template.id, { ...data, measurements }, buffer, extension, contentType)
    // Return the generated file as a downloadable response
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'X-Report-Version': reportVersion,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="Report_${String(data.application_number || data.applicant_name || 'generated').replace(/[^a-z0-9_-]/gi, '-').slice(0, 100)}.${extension}"`
      }
    })
}, { workload: 'report' })
