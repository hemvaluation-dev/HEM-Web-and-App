export type Profile = {
  role?: string | null
  level?: string | null
  department?: string | null
  full_name?: string | null
  email?: string | null
}

export function permissions(profile: Profile) {
  const owner = profile.role === 'owner' || profile.level === 'L5'
  const administration = owner || (profile.role !== 'field_agent' && ( ['manager', 'lead', 'admin'].includes(profile.role || '') ||
    ['L3', 'L4'].includes(profile.level || '') ||
    ['HR/Admin', 'Accounts', 'Valuation'].includes(profile.department || '')))
  const senior = owner || ['admin', 'manager', 'lead', 'reviewer'].includes(profile.role || '')
  const valuation = profile.role !== 'field_agent' && (administration || ['valuator', 'staff', 'editor', 'analyst', 'reviewer'].includes(profile.role || ''))
  return { owner, administration, senior, valuation }
}
