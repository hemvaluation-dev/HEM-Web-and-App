import { authorizeCase } from '@/lib/auth/actions'
import { objectPath } from '@/lib/reports/storage'
import { revalidatePath } from 'next/cache'

export async function editableEvidence(caseId: string) {
  const { supabase } = await authorizeCase(caseId)
  const { data, error } = await supabase.rpc('hem_case_edit', { cid: caseId })
  if (error || data !== true) throw new Error('This case is locked or you do not have permission to edit its evidence.')
  return supabase
}

function refreshEvidence(caseId: string) {
  revalidatePath(`/dashboard/cases/${caseId}`, 'layout')
}

export async function uploadEvidence(form: FormData, bucket: 'photos' | 'documents') {
  try {
    const caseId = String(form.get('caseId') || '')
    const kind = String(form.get(bucket === 'photos' ? 'photoType' : 'documentType') || '')
    const file = form.get('file')
    if (!(file instanceof File) || !file.size || !kind) return { error: 'Select a file and its category.' }
    const types: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', ...(bucket === 'documents' ? { 'application/pdf': 'pdf' } : {}) }
    const extension = types[file.type]
    if (!extension || file.size > (bucket === 'photos' ? 8 : 18) * 1024 * 1024) return { error: `Use a supported ${bucket === 'photos' ? 'image up to 8 MB' : 'PDF or image up to 18 MB'}.` }
    const supabase = await editableEvidence(caseId)
    const path = `${caseId}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type })
    if (uploadError) return { error: uploadError.message }
    const file_url = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
    const row: Record<string, unknown> = bucket === 'photos' ? { case_id: caseId, photo_type: kind, file_url } : { case_id: caseId, document_type: kind, file_url, file_name: file.name, extracted_data: {} }
    const { error } = await supabase.from(`case_${bucket}`).insert(row)
    if (error) {
      await supabase.storage.from(bucket).remove([path])
      return { error: error.message }
    }
    refreshEvidence(caseId)
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'The file could not be uploaded.' }
  }
}

export async function deleteEvidence(id: string, caseId: string, bucket: 'photos' | 'documents') {
  try {
    const supabase = await editableEvidence(caseId)
    const { data, error } = await supabase.from(`case_${bucket}`).delete().eq('id', id).eq('case_id', caseId).select('file_url').maybeSingle()
    if (error || !data) return { error: error?.message || 'The file was not found or the case is locked.' }
    const path = objectPath(data.file_url, bucket)
    if (path.startsWith(`${caseId}/`)) {
      const { error: storageError } = await supabase.storage.from(bucket).remove([path])
      if (storageError) {
        refreshEvidence(caseId)
        return { error: 'The attachment was removed, but its stored file could not be cleaned up.' }
      }
    }
    refreshEvidence(caseId)
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'The file could not be deleted.' }
  }
}
