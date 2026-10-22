'use server'

import type { ActionResult } from '@/lib/api/errors'

import { revalidatePath } from 'next/cache'
import { authorizeCase } from '@/lib/auth/actions'
import { actionError, ApiError, requireUuid } from '@/lib/api/errors'
import { nextCaseStatus } from '@/lib/cases/workflow'

export async function captureLocation(caseId: string, latitude: number, longitude: number, accuracy: number): Promise<ActionResult> {
  try {
    const { supabase } = await authorizeCase(caseId)
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180 ||
      !Number.isFinite(accuracy) || accuracy < 0) {
      return { error: 'Supply valid coordinates and location accuracy.' }
    }
    let mapping: { address?: Record<string, string> } | null = null
    try {
      const response = await supabase.functions.invoke('google-geocode', {
        body: { latitude, longitude, accuracy, action: 'capture' },
      })
      mapping = response.data
    } catch { /* GPS remains valid if the optional lookup cannot be reached. */ }
    // Address lookup is optional enrichment. A provider outage must not discard GPS.
    const addressData = mapping?.address || {}

    // 3. Upsert into database
    const payload = {
      case_id: caseId,
      latitude,
      longitude,
      accuracy,
      address_from_gps: addressData.formatted_address || "",
      city: addressData.city || "",
      state: addressData.state || "",
      pincode: addressData.pincode || "",
    }

    const { error: upsertError } = await supabase
      .from('case_location')
      .upsert(payload, { onConflict: 'case_id' })

    if (upsertError) throw new Error(upsertError.message)

    // A location recapture must never regress a drafted, approved, or completed report.
    const { error: statusError } = await supabase.from('cases').update({ status: 'in_progress' }).eq('id', caseId)
      .in('status', ['new', 'created', 'assigned', 'in_progress', 'location_captured', 'photos_uploaded', 'data_drafted'])
    if (statusError) return { error: 'Location saved, but case progress could not be updated. Refresh and try again.' }

    revalidatePath(`/dashboard/cases/${caseId}/location`)
    revalidatePath(`/dashboard/cases/${caseId}`)
    return { success: true }
  } catch (error: unknown) {
    return actionError(error)
  }
}

export async function updateCaseStatus(caseId: string, status: string, expectedRevision: number): Promise<ActionResult> {
  try {
  const { supabase, profile, record } = await authorizeCase(caseId)
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision !== record.revision) throw new ApiError(409, 'CONFLICT', 'This case changed. Refresh before continuing.')
  const next = nextCaseStatus(record.status, status, profile)
  if (next === record.status) return { success: true }
  const { error } = await supabase.rpc('transition_case', { p_case_id: caseId, p_status: next, p_expected_revision: record.revision })
  if (error) throw new ApiError(error.code === '40001' ? 409 : 400, 'WORKFLOW_ERROR', error.message)
  revalidatePath(`/dashboard/cases/${caseId}`)
  revalidatePath('/dashboard/cases')
  revalidatePath('/admin/cases')
  revalidatePath('/dashboard')
  revalidatePath('/admin/dashboard')
  revalidatePath('/dashboard/pending')
  return { success: true }
  } catch (error) { return actionError(error) }
}

async function reassignCaseMember(caseId: string, memberId: string, field: 'reviewer_id' | 'valuator_id'): Promise<ActionResult> {
  try {
    requireUuid(memberId, 'memberId')
    const { supabase, user, record } = await authorizeCase(caseId)
    if (record.created_by !== user.id) return { error: 'Only the case creator can assign or reassign this case.' }
    const { data: member, error: memberError } = await supabase.from('users')
      .select('role, level, is_active').eq('id', memberId).single()
    const roles = field === 'reviewer_id' ? ['reviewer', 'manager', 'lead', 'owner', 'admin'] : ['valuator', 'staff', 'editor', 'analyst', 'lead', 'manager', 'owner', 'admin']
    const levels = field === 'reviewer_id' ? ['L3', 'L4', 'L5'] : ['L2', 'L3', 'L4', 'L5']
    if (memberError || !member || member.is_active === false || (!roles.includes(member.role) && !levels.includes(member.level))) {
      return { error: 'Choose an active team member eligible for this assignment.' }
    }
    const { data, error } = await supabase.from('cases').update({ [field]: memberId })
      .eq('id', caseId).eq('created_by', user.id).select('id').maybeSingle()
    if (error || !data) return { error: 'The assignment could not be saved. Refresh and try again.' }
    revalidatePath(`/dashboard/cases/${caseId}`)
    revalidatePath('/dashboard/cases')
    revalidatePath('/admin/cases')
    return { success: true }
  } catch (error) { return actionError(error) }
}

export async function reassignCaseReviewer(caseId: string, reviewerId: string): Promise<ActionResult> {
  return reassignCaseMember(caseId, reviewerId, 'reviewer_id')
}

export async function reassignCaseValuator(caseId: string, valuatorId: string): Promise<ActionResult> {
  return reassignCaseMember(caseId, valuatorId, 'valuator_id')
}

export async function saveCustomerResponseRemark(caseId: string, value: string, previousValue: string): Promise<ActionResult> {
  try {
    const { supabase } = await authorizeCase(caseId)
    if (typeof value !== 'string' || value.trim().length > 2000 || typeof previousValue !== 'string') return { error: 'Enter a remark of at most 2000 characters.' }
    let query = supabase.from('cases').update({ customer_response_remark: value.trim() || null }).eq('id', caseId)
    query = previousValue === '' ? query.is('customer_response_remark', null) : query.eq('customer_response_remark', previousValue)
    const { data, error } = await query.select('id').maybeSingle()
    if (error) throw error
    if (!data) return { error: 'This remark was changed by another user. Refresh the case before saving.' }
    revalidatePath(`/dashboard/cases/${caseId}`)
    return { success: true }
  } catch (error) { return actionError(error) }
}

export async function updateCaseDetails(caseId: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await authorizeCase(caseId)
    
    const applicant_name = formData.get('applicant_name') as string
    const phone_number = formData.get('phone_number') as string
    const property_type = formData.get('property_type') as string
    const case_type = formData.get('case_type') as string
    const address = formData.get('address') as string
    const state = formData.get('state') as string
    const deadline_date = formData.get('deadline_date') as string

    if (!applicant_name || !address) {
      return { error: 'Missing required fields' }
    }

    const updates: any = {
      applicant_name,
      phone_number,
      property_type: property_type || null,
      case_type: case_type || null,
      address,
      state
    }

    if (deadline_date) {
      const tzString = deadline_date.includes('Z') || deadline_date.includes('+') ? deadline_date : `${deadline_date}+05:30`
      updates.deadline_date = new Date(tzString).toISOString()
    } else {
      updates.deadline_date = null
    }

    const { error } = await supabase
      .from('cases')
      .update(updates)
      .eq('id', caseId)

    if (error) throw error

    revalidatePath(`/dashboard/cases/${caseId}`)
    revalidatePath(`/dashboard/cases`)
    return { success: true }
  } catch (error: unknown) {
    return actionError(error)
  }
}
