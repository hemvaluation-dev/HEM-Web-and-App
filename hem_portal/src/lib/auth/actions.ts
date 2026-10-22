import { authenticate } from './session'
import { ApiError, requireUuid } from '@/lib/api/errors'
import { permissions } from './permissions'

/** Reuse the verified client and case snapshot for authorization and conditional writes. */
export async function authorizeCase(caseId: string) {
  requireUuid(caseId, 'caseId')
  const context = await authenticate()
  const { data: record, error } = await context.supabase.from('cases')
    .select('status, revision, assigned_to, reviewer_id, valuator_id, created_by').eq('id', caseId).single()
  if (error || !record || (!permissions(context.profile).administration &&
    ![record.assigned_to, record.reviewer_id, record.valuator_id, record.created_by].includes(context.user.id))) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not have access to this case.')
  }
  return { ...context, record }
}

/** Authorize before constructing any service-role client. */
export async function authorizeAction(scope: 'owner' | 'administration' | 'case', caseId?: string) {
  try {
    if (scope === 'case') {
      requireUuid(caseId, 'caseId')
      await authorizeCase(caseId)
      return null
    }
    const { profile } = await authenticate()
    const access = permissions(profile)
    if (scope === 'owner' && !access.owner) throw new ApiError(403, 'FORBIDDEN', 'Only the workspace owner can manage user access.')
    if (scope === 'administration' && !access.administration) throw new ApiError(403, 'FORBIDDEN', 'You do not have permission to manage this workspace.')
    return null
  } catch (error) {
    return error instanceof ApiError ? error.message : 'Access could not be verified. Please sign in and try again.'
  }
}
