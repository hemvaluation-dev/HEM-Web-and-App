import { cache } from 'react'
import { createClient as createTokenClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { ApiError } from '@/lib/api/errors'
import type { Profile } from './permissions'

/** Verify each credential with Auth; never trust cookie contents or cache across users. */
async function verifySession(request?: Request) {
  const authorization = request?.headers.get('authorization')
  const match = authorization?.match(/^Bearer ([^\s]+)$/i)
  if (authorization !== undefined && authorization !== null && !match) {
    throw new ApiError(401, 'INVALID_AUTHORIZATION', 'Supply a valid bearer token.')
  }
  const token = match?.[1]
  const supabase = token ? createTokenClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } }
  ) : await createClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) throw new ApiError(401, 'UNAUTHENTICATED', 'Sign in to continue.')
  const { data: profile, error: profileError } = await supabase.from('users')
    .select('role, level, department, full_name, email, is_active').eq('id', user.id).single()
  if (profileError || !profile) throw new ApiError(403, 'PROFILE_REQUIRED', 'Your account needs workspace access. Contact your administrator.')
  if (profile.is_active === false) throw new ApiError(403, 'ACCOUNT_DISABLED', 'Your account is inactive. Contact your administrator.')
  return { supabase, user, profile: profile as Profile }
}

// React cache is scoped to one server render, never shared between users.
const cookieSession = cache(() => verifySession())
export function authenticate(request?: Request) {
  return request ? verifySession(request) : cookieSession()
}
