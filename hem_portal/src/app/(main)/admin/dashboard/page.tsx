import { filterCases, caseMonthOptions } from '@/lib/cases/filters'
import { getAllCases, getAllAgents, getCaseSubmissionStats, getAllClients, getAllCreators } from '../actions'
import { getAllAttendance } from '../attendance/actions'
import { createClient } from '@/utils/supabase/server'
import CaseFilters from '@/components/CaseFilters'
import StateFilter from '@/components/StateFilter'
import { 
  Activity, Briefcase, CheckCircle, Clock, Users, TrendingUp, BarChart3, 
  PieChart, ShieldCheck, MapPin, ArrowUpRight, Zap, Award, Calendar, AlertTriangle, Download,
  Camera, FileText, Navigation, UserCheck, Eye, Send, Search
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard({ searchParams }: { searchParams?: Promise<{ state?: string; agent?: string; assigner?: string; bank?: string; from?: string; to?: string; month?: string; status?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let isOwner = false
  if (user) {
    const { data: uData } = await supabase.from('users').select('role').eq('id', user.id).single()
    isOwner = uData?.role === 'owner'
  }
  const allCases = await getAllCases() || []
  const cases = filterCases(allCases, params || {})
  const agents = await getAllAgents() || []
  const clients = await getAllClients() || []
  const creators = await getAllCreators() || []
  const attendance = await getAllAttendance() || []
  const submissionStats = await getCaseSubmissionStats(cases.map(c => c.id))

  // Core KPI Calculations
  const totalCases = cases.length
  const completedCases = cases.filter((c: any) => ['completed', 'delivered'].includes(c.status)).length
  const activeCases = totalCases - completedCases
  const completionRate = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0
  const unassignedCases = cases.filter((c: any) => !c.assigned_to && !['completed', 'delivered'].includes(c.status)).length

  // Turnaround Time (TAT) Calculation
  let totalTatDays = 0
  let completedTatCount = 0
  cases.forEach((c: any) => {
    let tatDays: number | null = null;
    if (c.submitted_at) {
      const start = new Date(c.deadline_date || c.created_at).getTime();
      const end = new Date(c.submitted_at).getTime();
      if (!isNaN(start) && !isNaN(end)) {
        tatDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
      }
    } else if (c.status === 'completed' || c.status === 'delivered') {
      const start = new Date(c.deadline_date || c.created_at).getTime();
      const end = new Date(c.updated_at || c.created_at).getTime();
      if (!isNaN(start) && !isNaN(end)) {
        tatDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
      }
    }
    if (tatDays !== null) {
      totalTatDays += tatDays;
      completedTatCount++;
    }
  })
  const avgTatDays = completedTatCount > 0 ? Math.round(totalTatDays / completedTatCount).toString() : '0'

  // 6-Stage Granular Pipeline
  const stages = [
    {
      key: 'new_unassigned',
      label: 'New / Unassigned',
      icon: AlertTriangle,
      color: 'amber',
      bgClass: 'bg-amber-500',
      textClass: 'text-warning',
      bgLight: 'bg-amber-500/10',
      borderClass: 'border-amber-500/20',
      count: cases.filter((c: any) => 
        ['new', 'pending', 'unassigned'].includes(c.status) || 
        (!c.assigned_to && !['completed', 'delivered'].includes(c.status))
      ).length,
    },
    {
      key: 'assigned',
      label: 'Assigned (Site Visit Pending)',
      icon: UserCheck,
      color: 'blue',
      bgClass: 'bg-blue-500',
      textClass: 'text-brand-dark',
      bgLight: 'bg-blue-500/10',
      borderClass: 'border-blue-500/20',
      count: cases.filter((c: any) => 
        c.status === 'assigned' && c.assigned_to
      ).length,
    },
    {
      key: 'in_progress',
      label: 'Site Activity In Progress',
      icon: Activity,
      color: 'indigo',
      bgClass: 'bg-indigo-500',
      textClass: 'text-brand-dark',
      bgLight: 'bg-indigo-500/10',
      borderClass: 'border-indigo-500/20',
      count: cases.filter((c: any) => 
        ['in_progress', 'location_captured', 'photos_uploaded', 'data_drafted'].includes(c.status) && c.assigned_to
      ).length,
    },
    {
      key: 'submitted',
      label: 'Photos / Data Submitted',
      icon: Send,
      color: 'purple',
      bgClass: 'bg-purple-500',
      textClass: 'text-brand-dark',
      bgLight: 'bg-purple-500/10',
      borderClass: 'border-purple-500/20',
      count: cases.filter((c: any) => 
        ['submitted', 'field_visit_done', 'site_inspected', 'site_inspection_completed'].includes(c.status)
      ).length,
    },
    {
      key: 'under_review',
      label: 'Under Review',
      icon: Eye,
      color: 'cyan',
      bgClass: 'bg-cyan-500',
      textClass: 'text-cyan-500',
      bgLight: 'bg-cyan-500/10',
      borderClass: 'border-cyan-500/20',
      count: cases.filter((c: any) => 
        ['in_review', 'pending_review', 'under_review'].includes(c.status)
      ).length,
    },
    {
      key: 'completed',
      label: 'Completed / Delivered',
      icon: CheckCircle,
      color: 'emerald',
      bgClass: 'bg-emerald-500 dark:bg-primary',
      textClass: 'text-success dark:text-brand-dark',
      bgLight: 'bg-emerald-500/10 dark:bg-primary/10',
      borderClass: 'border-emerald-500/20 dark:border-primary/20',
      count: completedCases,
    },
  ]

  // Property Type Breakdown
  const propertyTypes: Record<string, number> = {}
  cases.forEach((c: any) => {
    const type = c.property_type || 'Unspecified'
    propertyTypes[type] = (propertyTypes[type] || 0) + 1
  })
  const topPropertyTypes = Object.entries(propertyTypes).sort((a, b) => b[1] - a[1])

  // Active Field Attendance Today
  const todayStr = new Date().toISOString().split('T')[0]
  const checkedInToday = attendance.filter((a: any) => (a.date === todayStr || !a.date) && !a.check_out_time).length

  // Agent Performance Leaderboard
  const agentPerformance = agents.map((agent: any) => {
    const assignedCases = cases.filter((c: any) => c.assigned_to === agent.id)
    const completed = assignedCases.filter((c: any) => c.status === 'completed' || c.status === 'delivered').length
    const active = assignedCases.length - completed
    const efficiency = assignedCases.length > 0 ? Math.round((completed / assignedCases.length) * 100) : 0
    return {
      ...agent,
      totalAssigned: assignedCases.length,
      completed,
      active,
      efficiency
    }
  }).sort((a, b) => b.completed - a.completed)

  return (
    <div className="space-y-8 text-on-surface pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <StateFilter multiple />
        <CaseFilters months={caseMonthOptions(allCases)}
          agents={agents?.map((a: any) => ({ id: a.id, label: a.full_name || a.email })) || []}
          creators={creators?.map((c: any) => ({ id: c.id, label: c.full_name || c.email })) || []}
          banks={clients?.map((b: any) => ({ id: b.id, label: b.name })) || []}
        />
        {isOwner && (
          <a href={`/api/export-mis?${new URLSearchParams(params as any).toString()}`} className="px-4 py-2 text-xs font-semibold rounded-xl bg-paper-2 dark:bg-paper-2 hover:bg-surface-hover dark:hover:bg-surface-hover text-ink dark:text-white border border-line dark:border-line transition-all flex items-center gap-2 shadow-sm h-10">
            <Download className="w-3.5 h-3.5" />
            <span>Download MIS (CSV)</span>
          </a>
        )}
      </div>

      {/* Primary KPI Grid (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-surface dark:bg-surface p-5 rounded-xl border border-line dark:border-line shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted dark:text-muted uppercase tracking-wider">Total Volume</span>
            <div className="w-8 h-8 bg-primary/15 text-brand-dark dark:text-brand-dark rounded-xl flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-semibold text-ink dark:text-white">{totalCases}</span>
            <p className="text-[11px] text-muted dark:text-muted mt-1 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-brand-dark dark:text-brand-dark" /> 100% cataloged
            </p>
          </div>
        </div>

        <div className="bg-surface dark:bg-surface p-5 rounded-xl border border-line dark:border-line shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted dark:text-muted uppercase tracking-wider">Active Queue</span>
            <div className="w-8 h-8 bg-amber-500/15 text-warning rounded-xl flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-semibold text-ink dark:text-white">{activeCases}</span>
            <p className="text-[11px] text-warning mt-1 font-semibold">
              {unassignedCases} unassigned / new
            </p>
          </div>
        </div>

        <div className="bg-surface dark:bg-surface p-5 rounded-xl border border-line dark:border-line shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted dark:text-muted uppercase tracking-wider">Completion Rate</span>
            <div className="w-8 h-8 bg-primary/15 text-brand-dark dark:text-brand-dark rounded-xl flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-semibold text-ink dark:text-white">{completionRate}%</span>
            <p className="text-[11px] text-muted dark:text-muted mt-1 font-medium">
              Of assigned cases
            </p>
          </div>
        </div>

        <div className="bg-surface dark:bg-surface p-5 rounded-xl border border-line dark:border-line shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted dark:text-muted uppercase tracking-wider">Average TAT</span>
            <div className="w-8 h-8 bg-blue-500/15 text-brand-dark rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-semibold text-ink dark:text-white">{avgTatDays} days</span>
            <p className="text-[11px] text-brand-dark mt-1 font-medium flex items-center gap-1">
              Turnaround velocity
            </p>
          </div>
        </div>

        <div className="bg-surface dark:bg-surface p-5 rounded-xl border border-line dark:border-line shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted dark:text-muted uppercase tracking-wider">Field Agents</span>
            <div className="w-8 h-8 bg-purple-500/15 text-brand-dark rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-semibold text-ink dark:text-white">{agents.length}</span>
            <p className="text-[11px] text-brand-dark mt-1 font-medium">
              {checkedInToday} active on site
            </p>
          </div>
        </div>

        <div className="bg-surface dark:bg-surface p-5 rounded-xl border border-line dark:border-line shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted dark:text-muted uppercase tracking-wider">Active Field Agents</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-ink dark:text-white">{agents.length}</span>
            <span className="text-[11px] font-semibold text-muted dark:text-muted flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Realtime
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: 6-Stage Pipeline Funnel & Submission Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Case Lifecycle Funnel — 6 Stages */}
        <div className="lg:col-span-7 bg-surface dark:bg-surface rounded-xl border border-line dark:border-line p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-ink dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-dark dark:text-brand-dark" />
                Live Stage-Wise Progress
              </h2>
              <p className="text-xs text-muted dark:text-muted mt-0.5">Real-time status progression across all workflow stages</p>
            </div>
            <span className="text-xs font-bold text-brand-dark dark:text-brand-dark bg-primary/10 dark:bg-primary/15 px-3 py-1 rounded-full">
              {totalCases} Total
            </span>
          </div>

          <div className="space-y-3.5">
            {stages.map((stage) => {
              const StageIcon = stage.icon
              const percentage = totalCases > 0 ? Math.round((stage.count / totalCases) * 100) : 0
              return (
                <div key={stage.key}>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-ink dark:text-white flex items-center gap-2">
                      <StageIcon className={`w-3.5 h-3.5 ${stage.textClass}`} />
                      {stage.label}
                    </span>
                    <span className="text-muted dark:text-muted flex items-center gap-2">
                      <span className={`font-bold ${stage.textClass}`}>{stage.count}</span>
                      <span className="text-[10px]">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-paper-2 dark:bg-paper-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stage.bgClass} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 1)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Stage Summary Tags */}
          <div className="mt-5 pt-4 border-t border-line dark:border-line grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
            {stages.map((stage) => (
              <div key={stage.key} className={`p-2 rounded-lg ${stage.bgLight} border ${stage.borderClass}`}>
                <p className={`text-[9px] font-bold ${stage.textClass} uppercase leading-tight`}>{stage.label.split(' ')[0]}</p>
                <p className="text-sm font-semibold text-ink dark:text-white mt-0.5">{stage.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Submission Progress & Property Type Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Submission Progress Card */}
          <div className="bg-surface dark:bg-surface rounded-xl border border-line dark:border-line p-6 shadow-sm">
            <h2 className="text-base font-bold text-ink dark:text-white flex items-center gap-2 mb-4">
              <Send className="w-4 h-4 text-brand-dark dark:text-brand-dark" />
              Field Submission Progress
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-paper-2 dark:bg-paper-2 border border-line dark:border-line text-center">
                <div className="w-8 h-8 bg-blue-500/15 text-brand-dark rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Navigation className="w-4 h-4" />
                </div>
                <p className="text-lg font-semibold text-ink dark:text-white">{submissionStats.casesWithLocation}</p>
                <p className="text-[10px] font-bold text-muted dark:text-muted uppercase mt-0.5">GPS Captured</p>
              </div>
              <div className="p-3 rounded-xl bg-paper-2 dark:bg-paper-2 border border-line dark:border-line text-center">
                <div className="w-8 h-8 bg-purple-500/15 text-brand-dark rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Camera className="w-4 h-4" />
                </div>
                <p className="text-lg font-semibold text-ink dark:text-white">{submissionStats.casesWithPhotos}</p>
                <p className="text-[10px] font-bold text-muted dark:text-muted uppercase mt-0.5">Photos Uploaded</p>
              </div>
              <div className="p-3 rounded-xl bg-paper-2 dark:bg-paper-2 border border-line dark:border-line text-center">
                <div className="w-8 h-8 bg-emerald-500/15 text-success dark:text-brand-dark rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-4 h-4" />
                </div>
                <p className="text-lg font-semibold text-ink dark:text-white">{submissionStats.casesWithFieldData}</p>
                <p className="text-[10px] font-bold text-muted dark:text-muted uppercase mt-0.5">Field Data</p>
              </div>
            </div>
          </div>

          {/* Property Type Breakdown */}
          <div className="bg-surface dark:bg-surface rounded-xl border border-line dark:border-line p-6 shadow-sm">
            <h2 className="text-base font-bold text-ink dark:text-white flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-brand-dark dark:text-brand-dark" />
              Property Type Matrix
            </h2>
            <div className="space-y-3">
              {topPropertyTypes.map(([type, count]) => {
                const percentage = totalCases > 0 ? Math.round((count / totalCases) * 100) : 0
                return (
                  <div key={type} className="flex items-center justify-between p-3 rounded-xl bg-paper-2 dark:bg-paper-2 border border-line dark:border-line">
                    <span className="text-xs font-bold text-ink dark:text-white">{type}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-surface dark:bg-surface h-2 rounded-full overflow-hidden">
                        <div className="bg-primary dark:bg-primary h-full rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-xs font-bold text-muted dark:text-muted w-12 text-right">{count} ({percentage}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Agent Productivity & Efficiency Leaderboard */}
      <div className="bg-surface dark:bg-surface rounded-xl border border-line dark:border-line p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-ink dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-dark dark:text-brand-dark" />
              Workforce Performance & Efficiency Leaderboard
            </h2>
            <p className="text-xs text-muted dark:text-muted mt-0.5">Ranked field surveyors and reviewers by valuation turnaround speed and completion score</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-line dark:border-line text-[11px] font-bold text-muted dark:text-muted uppercase tracking-wider">
                <th className="pb-3 px-3">Rank / Officer</th>
                <th className="pb-3 px-3">Tier</th>
                <th className="pb-3 px-3 text-center">Assigned Cases</th>
                <th className="pb-3 px-3 text-center">Active Queue</th>
                <th className="pb-3 px-3 text-center">Completed Reports</th>
                <th className="pb-3 px-3 text-right">Efficiency Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-line">
              {agentPerformance.map((agent: any, index: number) => (
                <tr key={agent.id} className="hover:bg-surface-hover dark:hover:bg-surface-hover transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 dark:bg-primary/15 text-brand-dark dark:text-brand-dark font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-ink dark:text-white text-sm">{agent.full_name || agent.email.split('@')[0]}</p>
                        <p className="text-[11px] text-muted dark:text-muted truncate max-w-[180px]">{agent.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-xs font-semibold bg-paper-2 dark:bg-paper-2 border border-line dark:border-line px-2.5 py-1 rounded-lg text-ink dark:text-white uppercase">
                      {agent.role || 'Field Agent'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-ink dark:text-white">
                    {agent.totalAssigned}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${agent.active > 3 ? 'bg-amber-500/15 text-warning' : 'text-muted dark:text-muted'}`}>
                      {agent.active}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-brand-dark dark:text-brand-dark">
                    {agent.completed}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-paper-2 dark:bg-paper-2 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div className="bg-primary dark:bg-primary h-full rounded-full" style={{ width: `${agent.efficiency}%` }} />
                      </div>
                      <span className="font-bold text-xs text-ink dark:text-white">{agent.efficiency}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {agentPerformance.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted dark:text-muted text-sm">
                    No agents cataloged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-surface dark:bg-surface rounded-xl border border-line dark:border-line shadow-sm overflow-hidden mt-6">
        {/* Table Search Header */}
        <div className="p-4 border-b border-line dark:border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted dark:text-muted" />
            <input 
              type="text" 
              placeholder="Search evaluations..." 
              className="w-full pl-10 pr-4 py-2 bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl text-xs text-ink dark:text-white focus:outline-none focus:border-primary dark:focus:border-primary transition-colors"
            />
          </div>
          <Link href="/dashboard/cases" className="text-xs font-semibold text-brand-dark dark:text-brand-dark hover:underline self-end sm:self-auto">
            View All Records →
          </Link>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-line dark:border-line text-[11px] font-semibold text-muted dark:text-muted">
                <th className="py-3.5 px-6 font-semibold">Evaluation ID</th>
                <th className="py-3.5 px-6 font-semibold">Initiation & Submitted Date</th>
                <th className="py-3.5 px-6 font-semibold">TAT</th>
                <th className="py-3.5 px-6 font-semibold">Branch</th>
                <th className="py-3.5 px-6 font-semibold">Agent Name</th>
                <th className="py-3.5 px-6 font-semibold">Lender / Institution</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold">Applicant</th>
                <th className="py-3.5 px-6 font-semibold text-right">Property / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-line text-xs">
              {cases.slice(0, 50).map((c: any) => {
                const simplifiedStatus = ['completed', 'delivered', 'submitted', 'field_visit_done', 'site_inspected', 'site_inspection_completed', 'in_review', 'pending_review', 'under_review'].includes(c.status) ? 'Submitted' : ['in_progress', 'location_captured', 'photos_uploaded', 'data_drafted', 'document_uploaded', 'documents_uploaded', 'document_processing'].includes(c.status) ? 'Inspection' : 'Assigned';
                return (
                <tr key={c.id} className="hover:bg-surface-hover dark:hover:bg-surface-hover transition-colors group">
                  <td className="py-4 px-6 font-mono font-bold text-ink dark:text-white">
                    #{c.application_number || c.id.slice(0, 6)}
                  </td>
                  <td className="py-4 px-6 text-muted dark:text-muted">
                    <div className="font-semibold text-ink dark:text-white">
                      Initiated: {c.deadline_date ? new Date(c.deadline_date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date(c.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {c.submitted_at && (
                      <div className="text-[10px] text-success mt-1 font-bold">
                        Submitted: {new Date(c.submitted_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-muted dark:text-muted font-semibold">
                    {(() => {
                      let tatStr = 'Pending';
                      if (c.submitted_at) {
                        const start = new Date(c.deadline_date || c.created_at).getTime();
                        const end = new Date(c.submitted_at).getTime();
                        if (!isNaN(start) && !isNaN(end)) {
                          const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
                          tatStr = `${diffDays} days`;
                        }
                      } else if (c.status === 'completed' || c.status === 'delivered') {
                        const start = new Date(c.deadline_date || c.created_at).getTime();
                        const end = new Date(c.updated_at || c.created_at).getTime();
                        if (!isNaN(start) && !isNaN(end)) {
                          const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
                          tatStr = `${diffDays} days`;
                        }
                      }
                      return <span className={tatStr !== 'Pending' ? (tatStr.startsWith('-') ? "text-rose-500 font-bold" : "text-success font-bold") : ""}>{tatStr}</span>;
                    })()}
                  </td>
                  <td className="py-4 px-6 text-muted dark:text-muted">
                    {c.state || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-muted dark:text-muted font-medium">
                    {c.assigned_to_user ? (c.assigned_to_user.full_name || c.assigned_to_user.email) : 'Unassigned'}
                  </td>
                  <td className="py-4 px-6 text-muted dark:text-muted font-medium">
                    {clients?.find((b: any) => b.id === c.client_id)?.name || 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    {simplifiedStatus === 'Submitted' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 dark:bg-primary/10 text-success dark:text-brand-dark font-bold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Submitted
                      </span>
                    ) : simplifiedStatus === 'Inspection' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-warning font-bold">
                        <Activity className="w-3.5 h-3.5" />
                        Inspection
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-paper-2 dark:bg-paper-2 text-muted dark:text-muted font-bold border border-line dark:border-line">
                        <UserCheck className="w-3.5 h-3.5" />
                        Assigned
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-ink dark:text-white line-clamp-1">{c.applicant_name || 'N/A'}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link href={`/dashboard/cases/${c.id}`} className="opacity-100 transition-opacity text-[11px] font-bold text-ink dark:text-white bg-paper-2 dark:bg-paper-2 border border-line dark:border-line px-3 py-1.5 rounded-lg hover:bg-surface-hover dark:hover:bg-surface-hover">
                      View Details
                    </Link>
                  </td>
                </tr>
              )})}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted dark:text-muted text-sm">
                    No evaluations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
