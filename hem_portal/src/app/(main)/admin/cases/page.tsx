import { filterCases, caseMonthOptions } from '@/lib/cases/filters'
import { getAllCases, getAllAgents, getAllClients, getAllReviewers, getAllValuators, getAllCreators } from '../actions'
import { ArrowUpRight, Download, Building2, ChevronDown } from 'lucide-react'
import CreateCaseModal from './CreateCaseModal'
import DeleteCaseButton from './DeleteCaseButton'
import SearchFilter from '@/components/SearchFilter'
import StateFilter from '@/components/StateFilter'
import CaseFilters from '@/components/CaseFilters'
import AssignmentForm from '@/components/AssignmentForm'
import StatusBadge from '@/components/ui/StatusBadge'
import { authenticate } from '@/lib/auth/session'
import { permissions } from '@/lib/auth/permissions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminCasesPage({ searchParams }: { searchParams?: Promise<{ status?: string; search?: string; state?: string; agent?: string; assigner?: string; bank?: string; from?: string; to?: string; month?: string }> }) {
  const { user, profile } = await authenticate()
  const currentUserId = user.id
  const isOwner = permissions(profile).owner

  const params = await searchParams;
  const currentFilter = params?.status || 'all';
  const [cases, agents, clients, reviewers, valuators, creators] = await Promise.all([getAllCases(), getAllAgents(), getAllClients(), getAllReviewers(), getAllValuators(), getAllCreators()])

  const activeCount = cases?.filter((c: any) => !['completed', 'delivered'].includes(c.status) && c.assigned_to).length || 0;
  const completedCount = cases?.filter((c: any) => ['completed', 'delivered'].includes(c.status)).length || 0;
  const unassignedCount = cases?.filter((c: any) => !c.assigned_to && !['completed', 'delivered'].includes(c.status)).length || 0;

  const filteredCases = filterCases(cases || [], params || {})

  const tabs = [{ id: 'all', label: 'All cases', count: cases.length }, { id: 'active', label: 'In progress', count: activeCount }, { id: 'unassigned', label: 'Unassigned', count: unassignedCount }, { id: 'completed', label: 'Completed', count: completedCount }]
  const filterHref = (status: string) => { const query = new URLSearchParams(params as Record<string, string>); query.set('status', status); return `/admin/cases?${query}` }
  return <div className="space-y-6">
    <div className="flex flex-wrap justify-between gap-4 items-center"><div><p className="ui-kicker mb-2">Valuation operations</p><h1 className="font-semibold">Case management</h1><p className="text-sm text-muted mt-2">Assign your team, track inspections, and move cases to completion.</p></div><div className="flex gap-3 items-center">{isOwner && <a href={`/api/export-cases?${new URLSearchParams(params as Record<string, string>)}`} className="ui-button"><Download size={15} />Export</a>}<CreateCaseModal agents={agents} clients={clients} reviewers={reviewers} /></div></div>
    <section className="ui-panel overflow-hidden">
      <nav aria-label="Case status filters" className="flex gap-1 px-4 border-b border-line overflow-x-auto">{tabs.map(tab => <Link key={tab.id} href={filterHref(tab.id)} aria-current={currentFilter === tab.id ? 'page' : undefined} className={`flex items-center gap-2 px-4 py-4 whitespace-nowrap text-xs border-b-2 ${currentFilter === tab.id ? 'border-primary text-brand-dark font-semibold' : 'border-transparent text-muted hover:text-ink'}`}>{tab.label}<span className="bg-paper-2 text-muted px-1.5 py-0.5 rounded text-[10px]">{tab.count}</span></Link>)}</nav>
      <div className="flex flex-wrap gap-3 p-4 border-b border-line"><SearchFilter placeholder="Search name, reference, or address…" /><StateFilter multiple /><CaseFilters months={caseMonthOptions(cases)} agents={agents.map((a: any) => ({ id: a.id, label: a.full_name || a.email }))} creators={creators.map((a: any) => ({ id: a.id, label: a.full_name || a.email }))} banks={clients.map((b: any) => ({ id: b.id, label: b.name }))} /><span className="ml-auto self-center text-xs text-muted">{filteredCases.length} results</span></div>
      <div className="divide-y divide-line">{filteredCases.map((c: any) => <article key={c.id} className="p-5 hover:bg-surface-hover/50">
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr_auto] gap-4 items-center"><div><Link href={`/dashboard/cases/${c.id}`} className="text-sm font-semibold hover:text-brand-dark">{c.applicant_name || 'Untitled case'}</Link><p className="text-xs text-muted mt-1.5">{c.application_number || c.id.slice(0, 8)} · {c.case_type || c.property_type || 'Property valuation'}</p><p className="text-xs text-muted mt-1 max-w-md truncate">{c.address || 'Address pending'}</p></div><div><p className="text-[10px] uppercase tracking-wider text-muted mb-1.5">Lender / institution</p><p className="text-xs font-medium">{c.client?.name || 'Not assigned'}</p><p className="text-[11px] text-muted mt-1">{c.state || 'State not set'}</p></div><div><StatusBadge status={c.status} /><p className="text-[11px] text-muted mt-2">Created {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—'}</p></div><Link href={`/dashboard/cases/${c.id}`} className="ui-button">Open <ArrowUpRight size={15} /></Link></div>
        <details className="mt-4 rounded-lg border border-line"><summary className="flex items-center justify-between gap-4 px-3 py-2.5 text-xs text-muted"><span>Team assignments <span className="text-ink ml-2">{c.assigned_to_user?.full_name || c.assigned_to_user?.email || 'Field agent unassigned'}</span></span><ChevronDown size={15} /></summary><div className="grid md:grid-cols-3 gap-4 p-4 border-t border-line bg-paper-2/40">{[{ kind: 'agent' as const, title: 'Field agent', value: c.assigned_to, person: c.assigned_to_user, options: agents }, { kind: 'valuator' as const, title: 'Valuator', value: c.valuator_id, person: c.valuator_user, options: valuators }, { kind: 'reviewer' as const, title: 'Reviewer', value: c.reviewer_id, person: c.reviewer_user, options: reviewers }].map(item => <div key={item.kind}><p className="ui-kicker mb-2">{item.title}</p>{currentUserId === c.created_by ? <AssignmentForm caseId={c.id} kind={item.kind} current={item.value} options={item.options} /> : <p className="text-xs">{item.person?.full_name || item.person?.email || 'Unassigned'}</p>}</div>)}</div>{isOwner && <div className="px-4 pb-3"><DeleteCaseButton caseId={c.id} caseName={c.applicant_name || c.application_number || c.id} /></div>}</details>
      </article>)}{filteredCases.length === 0 && <div className="py-16 text-center"><Building2 size={30} className="text-muted mx-auto mb-3" /><h2 className="font-medium">No matching cases</h2><p className="text-xs text-muted mt-2">Adjust the filters or create a new valuation case.</p></div>}</div>
    </section>
  </div>
}
