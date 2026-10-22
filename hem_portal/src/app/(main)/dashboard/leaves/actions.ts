'use server'

import type { ActionResult } from '@/lib/api/errors'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { validLeaveDates } from '@/lib/leaves/policy'
import { authenticate } from '@/lib/auth/session'
import { actionError, requireUuid } from '@/lib/api/errors'

export async function getMyLeaves() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: leaves, error } = await supabase
    .from('leaves')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching my leaves:', error)
    return []
  }

  return leaves
}

export async function submitLeaveRequest(formData: FormData): Promise<ActionResult> {
  try {
  const { supabase, user } = await authenticate()

  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const reason = formData.get('reason') as string

  if (!start_date || !end_date || !reason) {
    return { error: 'Please fill out all fields.' }
  }
  if (typeof start_date !== 'string' || typeof end_date !== 'string' || !validLeaveDates(start_date, end_date)) return { error: 'Enter valid dates with the end on or after the start.' }
  if (typeof reason !== 'string' || !reason.trim() || reason.trim().length > 2000) return { error: 'Enter a reason between 1 and 2,000 characters.' }

  const { error } = await supabase
    .from('leaves')
    .insert({
      user_id: user.id,
      start_date,
      end_date,
      reason: reason.trim(),
      status: 'pending'
    })

  if (error) {
    return { error: 'Your leave request could not be saved. Please try again.' }
  }

  revalidatePath('/dashboard/leaves')
  return { success: true }
  } catch (error) { return actionError(error) }
}

export async function withdrawLeaveRequest(leaveId: string): Promise<ActionResult> {
  try {
  requireUuid(leaveId, 'leaveId')
  const { supabase, user } = await authenticate()

  const { data, error } = await supabase
    .from('leaves')
    .update({ status: 'withdrawn' })
    .eq('id', leaveId)
    .eq('user_id', user.id)
    .in('status', ['pending', 'pending_owner'])
    .select('id').maybeSingle()

  if (error) {
    return { error: 'Your leave request could not be withdrawn. Please try again.' }
  }
  if (!data) return { error: 'Only your pending leave requests can be withdrawn. Refresh to see the latest status.' }

  revalidatePath('/dashboard/leaves')
  revalidatePath('/admin/leaves')
  return { success: true }
  } catch (error) { return actionError(error) }
}
