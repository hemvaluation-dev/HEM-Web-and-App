import { ApiError } from '@/lib/api/errors'
import { permissions, type Profile } from '@/lib/auth/permissions'

export function canManageLeaves(profile: Profile): boolean {
  return permissions(profile).owner || ['admin', 'manager', 'lead'].includes(profile.role || '') || profile.department === 'HR/Admin'
}

export function nextLeaveStatus(current: string, requested: string, profile: Profile, selfApproval: boolean): string {
  if (!canManageLeaves(profile)) throw new ApiError(403, 'FORBIDDEN', 'You do not have permission to review leave requests.')
  if (selfApproval) throw new ApiError(403, 'SELF_APPROVAL', 'Your leave request must be reviewed by another administrator.')
  if (!['approved', 'rejected'].includes(requested)) throw new ApiError(400, 'INVALID_STATUS', 'Choose approve or reject.')
  if (!['pending', 'pending_owner'].includes(current)) throw new ApiError(409, 'ALREADY_REVIEWED', 'This leave request has already been resolved.')
  const owner = permissions(profile).owner
  if (current === 'pending_owner' && !owner) throw new ApiError(403, 'OWNER_REQUIRED', 'This request needs the workspace owner’s decision.')
  return requested === 'approved' && !owner ? 'pending_owner' : requested
}

export function validLeaveDates(start: string, end: string): boolean {
  const valid = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
  return valid(start) && valid(end) && start <= end
}
