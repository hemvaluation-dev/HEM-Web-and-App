export type CaseFilters = Partial<Record<'status' | 'search' | 'state' | 'agent' | 'assigner' | 'bank' | 'from' | 'to' | 'month', string>>

export const filterValues = (value?: string) => (value || '').split(',').map(s => s.trim()).filter(Boolean)
export function caseMonth(value?: string | null) {
  const time = Date.parse(value || '')
  return Number.isFinite(time) ? new Date(time + 330 * 60000).toISOString().slice(0, 7) : ''
}
export function caseMonthOptions(cases: { created_at?: string | null }[]) {
  return [...new Set(cases.map(c => caseMonth(c.created_at)).filter(Boolean))].sort().reverse().map(id => ({
    id, label: new Date(`${id}-01T00:00:00Z`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  }))
}

type FilterableCase = {
  id?: string; status?: string; state?: string; assigned_to?: string | null
  created_by?: string | null; client_id?: string | null; created_at?: string | null
  title?: string | null; applicant_name?: string | null; application_number?: string | null
  address?: string | null; assigned_to_user?: { state?: string | null } | null
  client?: { name?: string | null } | null
}

export function filterCases<T extends FilterableCase>(cases: T[], filters: CaseFilters): T[] {
  const search = filters.search?.trim().toLowerCase() || ''
  // Business dates are Indian calendar dates, independent of the server timezone.
  const from = filters.from ? Date.parse(`${filters.from}T00:00:00+05:30`) : -Infinity
  const to = filters.to ? Date.parse(`${filters.to}T23:59:59.999+05:30`) : Infinity
  const selected = Object.fromEntries(['status', 'state', 'agent', 'assigner', 'bank', 'month'].map(key => [key, filterValues(filters[key as keyof CaseFilters])]))
  return cases.filter(record => {
    const completed = ['completed', 'delivered'].includes(record.status || '')
    if (selected.status.length && !selected.status.some(status => status === 'all' ||
      (status === 'active' ? !completed && !!record.assigned_to : status === 'completed' ? completed : status === 'unassigned' ? !completed && !record.assigned_to : record.status === status))) return false
    if (selected.state.length && !selected.state.includes(record.state || '') && !selected.state.includes(record.assigned_to_user?.state || '')) return false
    if (selected.agent.length && !selected.agent.includes(record.assigned_to || '')) return false
    if (selected.assigner.length && !selected.assigner.includes(record.created_by || '')) return false
    if (selected.bank.length && !selected.bank.includes(record.client_id || '')) return false
    if (selected.month.length && !selected.month.includes(caseMonth(record.created_at))) return false
    if (filters.from || filters.to) {
      const created = Date.parse(record.created_at || '')
      if (!Number.isFinite(created) || Number.isNaN(from) || Number.isNaN(to) || created < from || created > to) return false
    }
    return !search || [record.title, record.applicant_name, record.application_number, record.client?.name, record.address, record.id]
      .some(value => value?.toLowerCase().includes(search))
  })
}
