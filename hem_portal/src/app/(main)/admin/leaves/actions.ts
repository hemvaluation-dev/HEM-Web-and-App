'use server'

import type { ActionResult } from '@/lib/api/errors'

import { revalidatePath } from 'next/cache'
import { authenticate } from '@/lib/auth/session'
import { ApiError, actionError, requireUuid } from '@/lib/api/errors'
import { canManageLeaves, nextLeaveStatus } from '@/lib/leaves/policy'

export async function getAllLeaves() {
  const { supabase, profile } = await authenticate()
  if (!canManageLeaves(profile)) throw new ApiError(403, 'FORBIDDEN', 'You do not have permission to view leave requests.')
  
  const { data: leaves, error } = await supabase
    .from('leaves')
    .select(`
      *,
      user:user_id ( full_name, email, department, state )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leaves:', error)
    return []
  }

  return leaves
}

export async function updateLeaveStatus(leaveId: string, requestedStatus: string): Promise<ActionResult> {
  try {
  requireUuid(leaveId, 'leaveId')
  const { supabase, user, profile } = await authenticate()
  if (!canManageLeaves(profile)) throw new ApiError(403, 'FORBIDDEN', 'You do not have permission to review leave requests.')
  const { data: leave, error: readError } = await supabase.from('leaves').select('user_id, status').eq('id', leaveId).single()
  if (readError || !leave) throw new ApiError(404, 'NOT_FOUND', 'This leave request could not be found.')
  const targetStatus = nextLeaveStatus(leave.status, requestedStatus, profile, leave.user_id === user.id)
  const { data, error } = await supabase
    .from('leaves')
    .update({ status: targetStatus })
    .eq('id', leaveId)
    .eq('status', leave.status)
    .select('id').maybeSingle()

  if (error) {
    throw new Error('Leave update failed')
  }
  if (!data) throw new ApiError(409, 'CONFLICT', 'This request changed while you were reviewing it. Refresh and try again.')

  revalidatePath('/admin/leaves')
  revalidatePath('/dashboard/leaves')
  return { success: true }
  } catch (error) { return actionError(error) }
}
