import { applyLegacyMeasurements } from '@/lib/valuation/legacy'
import { reportCase, persistReport } from '@/lib/reports/persistence'
import { ApiError, withApi } from '@/lib/api/route'
import { readJsonObject } from '@/lib/api/body'
import { reportImageDataUrl } from '@/lib/reports/images'
import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import ValuationReportDocument from '@/lib/pdf/ValuationReportDocument'

export const runtime = 'nodejs'

let cachedLogo = null

function getLogoDataUrl() {
  if (cachedLogo) return cachedLogo
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const bytes = readFileSync(logoPath)
    cachedLogo = `data:image/png;base64,${bytes.toString('base64')}`
    return cachedLogo
  } catch {
    return ''
  }
}

export const POST = withApi(async (req, context) => {
    const params = new URL(req.url).searchParams
    const record = await reportCase(context, params.get('case_id'), params.get('revision'))
    const data = applyLegacyMeasurements(await readJsonObject(req))
    const snapshot = JSON.parse(JSON.stringify(data))
    if (data.photographs?.extra && (!Array.isArray(data.photographs.extra) || data.photographs.extra.length > 16)) {
      throw new ApiError(400, 'TOO_MANY_IMAGES', 'Use at most 16 additional photographs.')
    }

    const logoDataUrl = getLogoDataUrl()

    // Optimize images
    if (data.photographs?.elevation?.image) {
      data.photographs.elevation.image = await reportImageDataUrl(data.photographs.elevation.image)
    }
    if (data.photographs?.roadView?.image) {
      data.photographs.roadView.image = await reportImageDataUrl(data.photographs.roadView.image)
    }
    if (data.photographs?.extra && Array.isArray(data.photographs.extra)) {
      for (const extra of data.photographs.extra) {
        if (extra.image) {
          extra.image = await reportImageDataUrl(extra.image)
        }
      }
    }

    const buffer = await renderToBuffer(
      React.createElement(ValuationReportDocument, { data, logoDataUrl })
    )

    const applicant = (data.applicant?.applicantName || 'Valuation-Report').replace(/[^a-z0-9]+/gi, '-')
    const filename = `Valuation_Report_${applicant}.pdf`

    const version = await persistReport(context, record, 'generic-pdf', snapshot, buffer, 'pdf', 'application/pdf')
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'X-Report-Version': version,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
}, { workload: 'report' })
