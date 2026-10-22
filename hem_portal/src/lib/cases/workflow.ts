import type { Profile } from '@/lib/auth/permissions'
import { permissions } from '@/lib/auth/permissions'
import { ApiError } from '@/lib/api/errors'

import { normalizeCaseStatus } from './status'

const transitions: Record<string, readonly string[]> = {
  new: ['assigned', 'in_progress'], assigned: ['in_progress'], in_progress: ['field_visit_done'],
  field_visit_done: ['report_drafted'], report_drafted: ['in_review', 'field_visit_done'],
  in_review: ['report_drafted', 'reviewed'], reviewed: ['completed'], completed: [],
}

export function nextCaseStatus(current: string, requested: string, profile: Profile): string {
  const from = normalizeCaseStatus(current)
  const to = normalizeCaseStatus(requested)
  if (!transitions[from] || !Object.hasOwn(transitions, to)) throw new ApiError(400, 'INVALID_STATUS', 'This case status is not supported.')
  if (from === to) return to
  if (!transitions[from].includes(to)) throw new ApiError(409, 'INVALID_TRANSITION', 'Complete the current workflow step before changing this status.')
  const { senior, valuation } = permissions(profile)
  if (['report_drafted', 'in_review'].includes(to) && !valuation) throw new ApiError(403, 'VALUATOR_REQUIRED', 'A report valuator must complete this step.')
  if ((from === 'in_review' || to === 'completed') && !senior) throw new ApiError(403, 'REVIEW_REQUIRED', 'A senior reviewer must approve this change.')
  return to
}
