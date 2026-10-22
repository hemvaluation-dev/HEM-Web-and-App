import { getCases } from './actions'
import { getAllAgents, getAllCases, getAllClients, getAllCreators } from '../admin/actions'
import { authenticate } from '@/lib/auth/session'
import { permissions } from '@/lib/auth/permissions'
import { filterCases, caseMonthOptions } from '@/lib/cases/filters'
import { ArrowUpRight, ArrowRight, Building2, CheckCircle2, Clock3, ClipboardCheck, Download, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import StateFilter from '@/components/StateFilter'
import CaseFilters from '@/components/CaseFilters'
import SearchFilter from '@/components/SearchFilter'
import StatusBadge from '@/components/ui/StatusBadge'
import { caseStage } from '@/lib/cases/status'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<{ search?: string; state?: string; agent?: string; assigner?: string; bank?: string; from?: string; to?: string; month?: string; status?: string }> }) {
  const params = await searchParams;
  const { profile } = await authenticate()
  const { administration: isAdmin } = permissions(profile)
  const canExport = ['owner', 'admin'].includes(profile.role || '')
  const [allCases, agents, clients, creators] = await Promise.all([getCases(), isAdmin ? getAllAgents() : Promise.resolve([]), isAdmin ? getAllClients() : Promise.resolve([]), isAdmin ? getAllCreators() : Promise.resolve([])])
  const cases = filterCases(allCases, params || {})
  const completed = cases.filter((c: any) => caseStage(c.status) === 'Completed').length
  const review = cases.filter((c: any) => ['field_visit_done', 'report_drafted', 'in_review'].includes(c.status)).length
  const unassigned = cases.filter((c: any) => !c.assigned_to && caseStage(c.status) !== 'Completed').length
  const active = cases.length - completed
  const now = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setUTCDate(now.getUTCDate() - (6 - i))
    const iso = date.toISOString().slice(0, 10)
    return { iso, label: date.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' }), count: cases.filter((c: any) => c.created_at?.startsWith(iso)).length }
  })
  const maximum = Math.max(...days.map(day => day.count), 1)
  const caseList = isAdmin ? '/admin/cases' : '/dashboard/cases'
  const stats = [
    { label: 'Total cases', value: cases.length, detail: 'Across the selected filters', icon: Building2, color: 'text-brand-dark' },
    { label: 'Active cases', value: active, detail: 'Field work and reviews in progress', icon: Clock3, color: 'text-warning' },
    { label: 'Awaiting review', value: review, detail: 'Submitted for assessment', icon: ClipboardCheck, color: 'text-brand-dark' },
    { label: 'Completed', value: completed, detail: 'Completed or delivered', icon: CheckCircle2, color: 'text-success' },
  ]
  return <div className="space-y-7">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="ui-kicker mb-2">Workspace overview</p><h1 className="font-semibold">Your operations, at a glance.</h1><p className="text-sm text-muted mt-2">Track valuations, review progress, and keep work moving.</p></div>
      <div className="flex gap-2">{canExport && <a href={`/api/export-mis?${new URLSearchParams(params as Record<string, string>).toString()}`} className="ui-button"><Download size={15} />Export MIS</a>}<Link href={caseList} className="ui-button ui-button-primary">Open case manager <ArrowUpRight size={16} /></Link></div>
    </div>
    <div className="flex flex-wrap items-center gap-3 py-1"><SlidersHorizontal size={16} className="text-muted" /><span className="text-xs font-medium text-muted mr-1">Filter workspace</span><StateFilter multiple />{<CaseFilters months={caseMonthOptions(allCases)} agents={agents.map((a: any) => ({ id: a.id, label: a.full_name || a.email }))} creators={creators.map((a: any) => ({ id: a.id, label: a.full_name || a.email }))} banks={clients.map((a: any) => ({ id: a.id, label: a.name }))} />}</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{stats.map(stat => <div key={stat.label} className="ui-panel p-5"><div className="flex justify-between items-center"><p className="text-xs font-medium text-muted">{stat.label}</p><stat.icon size={18} className={stat.color} /></div><p className="text-3xl font-semibold tracking-tight tabular-nums mt-4">{stat.value.toLocaleString('en-IN')}</p><p className="text-[11px] text-muted mt-2">{stat.detail}</p></div>)}</div>
    <div className="grid xl:grid-cols-[1.8fr_1fr] gap-5">
      <section className="ui-panel p-6"><div className="flex justify-between gap-4"><div><h2 className="font-semibold">Case activity</h2><p className="text-xs text-muted mt-1">New cases over the last seven days · UTC</p></div><span className="text-xs text-muted">{days.reduce((sum, day) => sum + day.count, 0)} cases</span></div>
        <div className="h-48 grid grid-cols-7 gap-4 items-end mt-7" role="img" aria-label={days.map(day => `${day.iso}: ${day.count} cases`).join(', ')}>{days.map((day, index) => <div key={day.iso} className="h-full flex flex-col items-center justify-end gap-2"><span className="text-[11px] text-muted tabular-nums">{day.count}</span><div className={`w-full max-w-12 rounded-t-md ${index === 6 ? 'bg-primary' : 'bg-primary/20'}`} style={{ height: `${day.count / maximum * 130}px`, minHeight: day.count ? 4 : 0 }} /><span className="w-full border-t border-line pt-2 text-center text-[11px] text-muted">{day.label}</span></div>)}</div>
      </section>
      <section className="ui-panel p-6 flex flex-col"><h2 className="font-semibold">Needs attention</h2><p className="text-xs text-muted mt-1">A clear next step for your team.</p><div className="divide-y divide-line mt-5 flex-1">{[{ name: 'Unassigned cases', value: unassigned, detail: 'Allocate a field agent', href: isAdmin ? '/admin/cases?status=unassigned' : caseList }, { name: 'Reviews in progress', value: review, detail: 'Check submitted field data', href: caseList }, { name: 'Open cases', value: active, detail: 'Track ongoing valuations', href: isAdmin ? '/admin/cases?status=active' : '/dashboard/pending' }].map(item => <Link key={item.name} href={item.href} className="group flex gap-3 items-center py-4"><span className="bg-paper-2 rounded-lg w-10 h-10 flex items-center justify-center font-semibold tabular-nums">{item.value}</span><span className="flex-1"><span className="block text-xs font-semibold group-hover:text-brand-dark">{item.name}</span><span className="block text-[11px] text-muted mt-1">{item.detail}</span></span><ArrowRight size={15} className="text-muted group-hover:text-brand-dark" /></Link>)}</div></section>
    </div>
    <section className="ui-panel overflow-hidden"><div className="p-5 flex flex-wrap justify-between gap-4 items-center border-b border-line"><div><h2 className="font-semibold">Recent cases</h2><p className="text-xs text-muted mt-1">The latest activity in your workspace.</p></div><SearchFilter placeholder="Search recent cases…" /></div><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>{['Case reference', 'Applicant / property', 'Assigned agent', 'Created', 'Status', ''].map((label, i) => <th key={i} className="px-5 py-3 text-muted font-medium">{label}</th>)}</tr></thead><tbody className="divide-y divide-line">{cases.slice(0, 12).map((c: any) => <tr key={c.id} className="hover:bg-surface-hover"><td className="px-5 py-4"><Link href={`/dashboard/cases/${c.id}`} className="text-xs font-semibold text-brand-dark">{c.application_number || c.id.slice(0, 8).toUpperCase()}</Link><p className="text-[11px] text-muted mt-1">{c.client?.name || 'No lender assigned'}</p></td><td className="px-5 py-4"><p className="text-xs font-medium">{c.applicant_name || 'Untitled case'}</p><p className="text-[11px] text-muted mt-1 max-w-[240px] truncate">{c.address || c.case_type || c.property_type || 'Property details pending'}</p></td><td className="px-5 py-4 text-xs text-muted">{c.assigned_to_user?.full_name || c.assigned_to_user?.email || 'Unassigned'}</td><td className="px-5 py-4 text-xs text-muted whitespace-nowrap">{c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '—'}</td><td className="px-5 py-4"><StatusBadge status={c.status} /></td><td className="px-5 py-4"><Link href={`/dashboard/cases/${c.id}`} aria-label={`Open case ${c.application_number || c.applicant_name}`} className="ui-button !p-2"><ArrowUpRight size={15} /></Link></td></tr>)}{cases.length === 0 && <tr><td colSpan={6} className="py-14 text-center"><Building2 className="mx-auto text-muted mb-3" size={28} /><p className="font-medium text-sm">No cases to show</p><p className="text-xs text-muted mt-2">Try adjusting the filters, or open case management to get started.</p></td></tr>}</tbody></table></div><div className="px-5 py-4 flex justify-between text-xs border-t border-line"><span className="text-muted">Showing {Math.min(cases.length, 12)} of {cases.length} cases</span><Link href={caseList} className="text-brand-dark font-medium inline-flex items-center gap-2">View all cases <ArrowRight size={14} /></Link></div></section>
  </div>
}
