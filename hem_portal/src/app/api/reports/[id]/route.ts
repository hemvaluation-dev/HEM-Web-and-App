import { withApi, ApiError, requireUuid } from '@/lib/api/route'
import { NextResponse } from 'next/server'

export const GET = withApi(async (request, { supabase }) => {
  const id = new URL(request.url).pathname.split('/').pop()
  requireUuid(id, 'reportId')
  const { data, error } = await supabase.from('case_reports').select('storage_path').eq('id', id).single()
  if (error || !data) throw new ApiError(404, 'NOT_FOUND', 'This report is unavailable.')
  const { data: link, error: linkError } = await supabase.storage.from('reports').createSignedUrl(data.storage_path, 60, { download: true })
  if (linkError || !link) throw new ApiError(502, 'DOWNLOAD_FAILED', 'The report could not be downloaded.')
  return NextResponse.redirect(link.signedUrl)
})
