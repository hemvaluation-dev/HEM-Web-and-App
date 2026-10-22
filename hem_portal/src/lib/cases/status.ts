export const CASE_STATUSES = ['new', 'assigned', 'in_progress', 'field_visit_done', 'report_drafted', 'in_review', 'reviewed', 'completed'] as const
export type CaseStatus = typeof CASE_STATUSES[number]
const aliases: Record<string, CaseStatus> = {
  created: 'new', draft: 'new', delivered: 'completed', approved: 'completed',
  location_captured: 'in_progress', photos_uploaded: 'in_progress', data_drafted: 'in_progress',
  documents_uploaded: 'in_progress', document_uploaded: 'in_progress', document_processing: 'in_progress',
  submitted: 'field_visit_done', site_inspected: 'field_visit_done', site_inspection_completed: 'field_visit_done',
  pending_review: 'in_review', under_review: 'in_review',
}
export function normalizeCaseStatus(value?: string | null): string {
  const status = (value || 'new').toLowerCase()
  return aliases[status] || status
}
export function fieldWorkLocked(value?: string | null): boolean {
  return ['field_visit_done', 'report_drafted', 'in_review', 'reviewed', 'completed'].includes(normalizeCaseStatus(value))
}
export function caseStage(value?: string | null): string {
  const status = normalizeCaseStatus(value)
  return ({new: 'New', assigned: 'Assigned', in_progress: 'Inspection', field_visit_done: 'Field submitted',
    report_drafted: 'Report drafted', in_review: 'In review', reviewed: 'Reviewed', completed: 'Completed'} as Record<string, string>)[status] || status.replaceAll('_', ' ')
}
