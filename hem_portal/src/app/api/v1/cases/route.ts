import { NextResponse } from 'next/server'
import { ApiError, withApi } from '@/lib/api/route'
import { permissions } from '@/lib/auth/permissions'

export const GET = withApi(async (request, { supabase, user, profile }) => {
  const params = new URL(request.url).searchParams
  const page = Number(params.get('page') || 1)
  const pageSize = Number(params.get('pageSize') || 25)
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new ApiError(400, 'INVALID_PAGINATION', 'Use page >= 1 and pageSize between 1 and 100.')
  let query = supabase.from('cases').select('id, application_number, applicant_name, address, property_type, case_type, status, created_at, assigned_to, client:client_id(name)', { count: 'exact' })
  if (!permissions(profile).administration) query = query.or(`assigned_to.eq.${user.id},reviewer_id.eq.${user.id},valuator_id.eq.${user.id},created_by.eq.${user.id}`)
  const search = params.get('search')?.trim()
  if (search) {
    if (search.length > 120 || !/^[\p{L}\p{N} -]+$/u.test(search)) throw new ApiError(400, 'INVALID_SEARCH', 'Use up to 120 letters, numbers, spaces, or hyphens for search.')
    query = query.or(`applicant_name.ilike.%${search}%,application_number.ilike.%${search}%`)
  }
  const status = params.get('status')
  if (status) query = query.eq('status', status)
  const { data, count, error } = await query.order('created_at', { ascending: false }).order('id').range((page - 1) * pageSize, page * pageSize - 1)
  if (error) throw new ApiError(500, 'QUERY_FAILED', 'Cases could not be loaded.')
  return NextResponse.json({ data, pagination: { page, pageSize, total: count || 0, totalPages: Math.ceil((count || 0) / pageSize) } })
})
