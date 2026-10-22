import { cache } from 'react'
import { authenticate } from '@/lib/auth/session'
import { permissions } from '@/lib/auth/permissions'
import { ApiError, requireUuid } from '@/lib/api/errors'

export const getCase = cache(async (id: string) => {
  requireUuid(id, 'caseId')
  const { supabase, user, profile } = await authenticate()
  const { data, error } = await supabase.from('cases').select(`*,
    client:client_id(name, template_name),
    reviewer:reviewer_id(id, full_name, email, role, level),
    valuator:valuator_id(id, full_name, email, role, level)`).eq('id', id).single()
  if (error || !data || (!permissions(profile).administration &&
    ![data.assigned_to, data.reviewer_id, data.valuator_id, data.created_by].includes(user.id))) {
    throw new ApiError(404, 'NOT_FOUND', 'This case is unavailable.')
  }
  return data
})

// These small lookup lists are shared across components in a single request.
export const getDirectory = cache(async () => {
  const { supabase } = await authenticate()
  const { data, error } = await supabase.from('users')
    .select('id, full_name, email, role, level, department, state, is_active')
    .eq('is_active', true).order('full_name')
  if (error) throw new Error('The team directory could not be loaded.')
  return data || []
})

export const getClients = cache(async () => {
  const { supabase } = await authenticate()
  const { data, error } = await supabase.from('clients').select('id, name, template_name').order('name')
  if (error) throw new Error('Lenders could not be loaded.')
  return data || []
})

/** Blank legacy columns must never replace newer field observations. */
export function mergeCaseData(extracted: Record<string, unknown> = {}, legacy: Record<string, unknown> = {}) {
  const metadata = new Set(['id', 'case_id', 'created_at', 'updated_at'])
  const result = Object.fromEntries(Object.entries(legacy).filter(([key, value]) => !metadata.has(key) && value !== null && value !== ''))
  return { ...result, ...extracted }
}

export type CaseSummary = {
  id: string; status: string; application_number: string; applicant_name: string; address: string; property_type: string; case_type: string; state: string;
  created_at: string; updated_at: string; deadline_date: string | null; submitted_at: string | null; completed_at: string | null;
  created_by: string | null; assigned_to: string | null; reviewer_id: string | null; valuator_id: string | null; client_id: string | null;
  assigned_to_user: { email: string; full_name: string; state: string } | null;
  valuator_user: { email: string; full_name: string; role: string; level: string; state: string } | null;
  reviewer_user: { email: string; full_name: string; role: string; level: string; state: string } | null;
  client: { name: string } | null;
}

export const getCaseSummaries = cache(async () => {
  const { supabase, profile, user } = await authenticate()
  const rows: CaseSummary[] = []
  for (let offset = 0; ; offset += 1000) {
    let query = supabase.from('cases').select(`id,application_number,applicant_name,address,property_type,case_type,state,
      status,created_at,updated_at,deadline_date,submitted_at,completed_at,created_by,assigned_to,reviewer_id,valuator_id,client_id,
      assigned_to_user:assigned_to(email,full_name,state),valuator_user:valuator_id(email,full_name,role,level,state),
      reviewer_user:reviewer_id(email,full_name,role,level,state),client:client_id(name)`)
    if (!permissions(profile).administration) query = query.or(`assigned_to.eq.${user.id},reviewer_id.eq.${user.id},valuator_id.eq.${user.id},created_by.eq.${user.id}`)
    const { data, error } = await query.order('created_at', { ascending: false }).order('id').range(offset, offset + 999).returns<CaseSummary[]>()
    if (error) throw new Error('Cases could not be loaded.')
    rows.push(...(data || []))
    if (!data || data.length < 1000) break
  }
  return rows
})
