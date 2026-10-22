import { createHash } from 'node:crypto'
import type { ApiContext } from '@/lib/api/route'
import { ApiError, requireUuid } from '@/lib/api/errors'
import { permissions } from '@/lib/auth/permissions'
import { normalizeCaseStatus } from '@/lib/cases/status'

export async function reportCase(context: ApiContext, id: unknown, revision: unknown) {
  requireUuid(id, 'caseId')
  if (!Number.isSafeInteger(Number(revision)) || revision === null || revision === undefined) throw new ApiError(400, 'REVISION_REQUIRED', 'Refresh the case before generating a report.')
  const { data, error } = await context.supabase.from('cases').select('id, status, revision, assigned_to, reviewer_id, valuator_id, created_by, created_at, extracted_data, applicant_name, application_number, address, property_type, branch, state, case_location(latitude,longitude,created_at)').eq('id', id).single()
  const access = permissions(context.profile)
  if (error || !data || !access.valuation || (!access.administration && ![data.valuator_id, data.reviewer_id, data.created_by].includes(context.user.id))) throw new ApiError(403, 'FORBIDDEN', 'You cannot generate a report for this case.')
  if (!['in_progress', 'field_visit_done', 'report_drafted', 'submitted'].includes(normalizeCaseStatus(data.status))) throw new ApiError(409, 'DOSSIER_NOT_READY', 'Save field data before generating a report. An approved report requires a revision workflow.')
  if (data.revision !== Number(revision)) throw new ApiError(409, 'CONFLICT', 'This case changed. Refresh before generating a report.')
  return data
}

export async function persistReport(context: ApiContext, record: { id: string; revision: number }, template: string, snapshot: unknown, buffer: Uint8Array, extension: string, contentType: string) {
  const path = `${record.id}/${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await context.supabase.storage.from('reports').upload(path, buffer, { contentType, upsert: false })
  if (uploadError) throw new ApiError(502, 'REPORT_STORAGE_FAILED', 'The report could not be stored. Try again.')
  const { data, error } = await context.supabase.rpc('record_case_report', {
    p_case_id: record.id, p_template_id: template, p_storage_path: path,
    p_data: snapshot, p_sha256: createHash('sha256').update(buffer).digest('hex'), p_expected_revision: record.revision,
  })
  if (error) {
    await context.supabase.storage.from('reports').remove([path])
    throw new ApiError(error.code === '40001' ? 409 : 400, 'REPORT_SAVE_FAILED', error.message)
  }
  return data as string
}
