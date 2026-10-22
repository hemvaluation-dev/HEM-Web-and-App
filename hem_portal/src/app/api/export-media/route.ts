import { signFiles } from '@/lib/reports/storage'
import { serializeCsv } from '@/lib/exports/csv'
import { NextResponse } from 'next/server'
import { requireUuid, withApi } from '@/lib/api/route'
import JSZip from 'jszip'

export const GET = withApi(async (req, { supabase }) => {
  const { searchParams } = new URL(req.url)
  const caseId = searchParams.get('caseId')

  requireUuid(caseId, 'caseId')

  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('*, case_location(*)')
    .eq('id', caseId)
    .single()
  
  if (caseError || !caseData) return new NextResponse('Case not found', { status: 404 })

  const { data: rawPhotos } = await supabase.from('case_photos').select('*').eq('case_id', caseId)
  const { data: rawDocuments } = await supabase.from('case_documents').select('*').eq('case_id', caseId)
  const { data: rawReports } = await supabase.from('case_reports').select('*').eq('case_id', caseId)

  const [photos, documents] = await Promise.all([
    signFiles(supabase, rawPhotos || [], 'photos'),
    signFiles(supabase, rawDocuments || [], 'documents')
  ])

  let reports: { file_url?: string; template_id: string; storage_path: string }[] = []
  if (rawReports && rawReports.length > 0) {
    const { data: signedReports } = await supabase.storage.from('reports').createSignedUrls(rawReports.map(r => r.storage_path), 3600)
    if (signedReports) {
      reports = rawReports.map((r, i) => ({ ...r, file_url: signedReports[i]?.signedUrl }))
    }
  }

  const zip = new JSZip()
  const extracted = caseData.extracted_data || {}
  const location = Array.isArray(caseData.case_location) ? caseData.case_location[0] : caseData.case_location
  const rows = [
    ['Case ID', caseData.id || ''],
    ['Application Number', caseData.application_number || ''],
    ['Applicant Name', caseData.applicant_name || ''],
    ['Case Status', caseData.status || ''],
    ['Case Type', caseData.case_type || ''],
    ['Property Type', caseData.property_type || ''],
    ['Address', caseData.address || ''],
    ['Priority', caseData.priority || ''],
    ['Created At', caseData.created_at || ''],
    ...Object.entries(extracted).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')]),
    ...(location ? Object.entries(location).map(([k, v]) => [`location_${k}`, typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')]) : [])
  ]
  zip.file('case_data.csv', serializeCsv(['Field Name', 'Value'], rows))

  const addMediaToZip = async (items: { file_url?: string; [key: string]: unknown }[], folderName: string, nameField: string, defaultExt: string) => {
    if (!items.length) return
    const folder = zip.folder(folderName)
    if (!folder) return
    await Promise.all(items.map(async (item, i) => {
      try {
        if (!item.file_url) return
        const res = await fetch(item.file_url)
        if (!res.ok) return
        const buf = await res.arrayBuffer()
        let filename = item[nameField] ? String(item[nameField]) : `file_${i + 1}`
        const extension = typeof item.storage_path === 'string' ? item.storage_path.match(/\.[a-z0-9]+$/i)?.[0] : undefined
        if (!filename.includes('.')) filename += extension || defaultExt
        filename = `${i + 1}_${filename}`
        folder.file(filename.replace(/[^a-zA-Z0-9.\-_]/g, '_'), buf)
      } catch (e) {
        console.error(`Failed to download ${folderName} item`, e)
      }
    }))
  }

  await Promise.all([
    addMediaToZip(photos, 'photos', 'photo_type', '.jpg'),
    addMediaToZip(documents, 'documents', 'document_type', '.pdf'),
    addMediaToZip(reports, 'reports', 'template_id', '.docx'),
  ])

  const content = await zip.generateAsync({ type: 'nodebuffer' })

  return new NextResponse(new Uint8Array(content), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="case_archive_${caseId}.zip"`,
    }
  })
}, { roles: ['owner', 'manager', 'lead', 'admin', 'reviewer'] })
