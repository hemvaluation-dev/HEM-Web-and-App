import { filterCases, caseMonthOptions } from '@/lib/cases/filters'
import { getCases } from '../actions'
import { getAllAgents, getAllClients, getAllReviewers, getAllCreators } from '@/app/(main)/admin/actions'
import { authenticate } from '@/lib/auth/session'
import { Building2, ChevronRight, FileText, MapPin, Calendar, Clock, CheckCircle, Search } from 'lucide-react'
import Link from 'next/link'
import CreateCaseModal from '@/app/(main)/admin/cases/CreateCaseModal'
import SearchFilter from '@/components/SearchFilter'
import ClientDate from '@/components/ClientDate'

import CaseFilters from '@/components/CaseFilters'

export const dynamic = 'force-dynamic'

export default async function CasesListPage({ searchParams }: { searchParams?: Promise<{ search?: string; agent?: string; assigner?: string; bank?: string; from?: string; to?: string; month?: string; status?: string }> }) {
  const params = await searchParams
  const [allCases, agents, clients, creators] = await Promise.all([getCases(), getAllAgents(), getAllClients(), getAllCreators()])
  const cases = filterCases(allCases, params || {})

  return (
    <div className="space-y-6 pt-2 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted dark:text-muted mb-1">
            <span>Operations</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink dark:text-white">Case Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink dark:text-white tracking-tight flex items-center gap-3">
            All Evaluations
            <span className="text-xs bg-paper-2 dark:bg-paper-2 border border-line dark:border-line text-muted dark:text-muted px-2.5 py-1 rounded-lg font-semibold">
              {cases.length} Total
            </span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full">
          <CaseFilters months={caseMonthOptions(allCases)}
            agents={agents?.map((a: any) => ({ id: a.id, label: a.full_name || a.email })) || []}
            creators={creators?.map((c: any) => ({ id: c.id, label: c.full_name || c.email })) || []}
            banks={clients?.map((b: any) => ({ id: b.id, label: b.name })) || []}
          />
          <SearchFilter placeholder="Search evaluations..." />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cases.map((c: any) => {
          const isCompleted = c.status === 'completed' || c.status === 'delivered';
          const isPending = c.status === 'in_review' || c.status === 'pending_review' || c.status === 'submitted' || c.status === 'field_visit_done';
          const isInProgress = ['in_progress', 'location_captured', 'photos_uploaded', 'data_drafted'].includes(c.status);
          
          return (
            <Link href={`/dashboard/cases/${c.id}`} key={c.id} className="group block">
              <div className="bg-surface dark:bg-surface rounded-xl border border-line dark:border-line shadow-sm hover:border-primary dark:hover:border-primary transition-all duration-200 overflow-hidden flex flex-col justify-between h-full">
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isCompleted ? 'bg-success/10 text-success dark:text-brand-dark' : 'bg-paper-2 dark:bg-paper-2 text-brand-dark dark:text-brand-dark'}`}>
                        {isCompleted ? <CheckCircle className="w-4 h-4"/> : <Building2 className="w-4 h-4"/>}
                      </div>
                      <div>
                        <p className="font-mono text-[11px] font-bold text-muted dark:text-muted mb-0.5">#{c.application_number || c.id.slice(0, 6)}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          isCompleted ? 'bg-success/10 dark:bg-primary/15 text-success dark:text-brand-dark' :
                          isPending ? 'bg-warning/10 text-warning' :
                          isInProgress ? 'bg-indigo-500/10 text-brand-dark' :
                          'bg-paper-2 dark:bg-paper-2 text-ink dark:text-white border border-line dark:border-line'
                        }`}>
                          {(() => {
                            if (isCompleted || isPending || c.status === 'assigned') {
                              return c.status.replace('_', ' ')
                            }
                            const hasLoc = Array.isArray(c.case_location) ? c.case_location.length > 0 : !!c.case_location
                            const hasDocs = Array.isArray(c.case_documents) ? c.case_documents.length > 0 : !!c.case_documents
                            const hasPhotos = Array.isArray(c.case_photos) ? c.case_photos.length > 0 : !!c.case_photos
                            if (!hasLoc && !hasDocs && !hasPhotos) {
                              if (c.status === 'in_progress') return 'In Progress'
                              return c.status.replace('_', ' ')
                            }
                            const parts = []
                            if (hasLoc) parts.push('Location')
                            if (hasDocs) parts.push('Document')
                            if (hasPhotos) parts.push('Photo')
                            return parts.join(' + ') + ' Done'
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-lg font-bold text-ink dark:text-white group-hover:text-brand-dark dark:group-hover:text-brand-dark transition-colors truncate">
                      {c.applicant_name}
                    </h3>
                    {c.client?.name && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-primary/10 dark:bg-primary/10 text-brand-dark dark:text-brand-dark border border-primary/20 shrink-0">
                        {c.client.name}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-line dark:border-line/60">
                    <div className="flex items-center gap-2.5 text-xs text-muted dark:text-muted">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="font-medium text-ink dark:text-white">{c.case_type || c.property_type || 'Residential Evaluation'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-muted dark:text-muted">
                      <Calendar className="w-3.5 h-3.5 text-warning" />
                      <span className="text-warning font-bold">Initiated: <ClientDate date={c.deadline_date || c.created_at} format="datetime" /></span>
                    </div>
                    {c.submitted_at && (
                      <div className="flex items-center gap-2.5 text-xs text-muted dark:text-muted">
                        <CheckCircle className="w-3.5 h-3.5 text-success" />
                        <span className="text-success font-bold">Submitted: <ClientDate date={c.submitted_at} format="datetime" /></span>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-start gap-2.5 text-xs text-muted dark:text-muted">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{c.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-paper-2/60 dark:bg-paper-2 border-t border-line dark:border-line flex justify-between items-center group-hover:bg-primary/5 dark:group-hover:bg-primary/10 transition-colors">
                  <span className="text-xs font-semibold text-ink dark:text-white group-hover:text-brand-dark dark:group-hover:text-brand-dark">Inspect Records</span>
                  <ChevronRight className="w-4 h-4 text-muted dark:text-muted group-hover:text-brand-dark dark:group-hover:text-brand-dark group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          )
        })}

        {cases.length === 0 && (
          <div className="col-span-full py-16 text-center bg-surface dark:bg-surface rounded-xl border border-line dark:border-line">
            <h3 className="text-base font-bold text-ink dark:text-white mb-1">No Cases Found</h3>
            <p className="text-xs text-muted dark:text-muted">There are currently no evaluations logged in the directory.</p>
          </div>
        )}
      </div>
    </div>
  )
}
