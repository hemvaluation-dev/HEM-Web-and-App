import { getCases } from '../actions'
import { FileText, CheckCircle, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PendingCasesPage() {
  const allCases = await getCases()
  const pendingCases = allCases.filter((c: any) => c.status !== 'completed' && c.status !== 'delivered')

  return (
    <>
      <div className="flex justify-between items-end mb-10 mt-4">
        <div>
          <nav className="flex text-label-sm font-label-sm text-brand-dark mb-3 gap-2 items-center tracking-widest uppercase">
            <Link href="/dashboard" className="hover:text-primary-hover transition-colors font-semibold">Portal</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-semibold text-on-surface-variant">REVIEW PENDING</span>
          </nav>
          <h2 className="font-headline-lg text-2xl text-on-surface tracking-tight font-semibold flex items-center gap-4">
            Pending Cases
            <span className="text-sm px-4 py-1 rounded-full font-bold bg-warning-bg text-warning">
              {pendingCases.length} ACTIVE
            </span>
          </h2>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border-base shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 p-4 space-y-2">
          {pendingCases.map((c: any) => (
            <Link href={`/dashboard/cases/${c.id}`} key={c.id} className="block group">
              <div className="p-4 rounded-xl border border-transparent hover:border-border-base hover:bg-surface-hover hover:shadow-sm transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-warning-bg text-warning">
                    <Clock className="w-5 h-5"/>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface group-hover:text-brand-dark transition-colors text-lg">{c.applicant_name}</p>
                    <p className="text-sm text-on-surface-variant flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs bg-surface-dim px-2 py-0.5 rounded-md">{c.application_number}</span>
                      • {c.case_type || c.property_type || 'Residential'}
                      • Status: {c.status.toUpperCase().replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-outline opacity-100 group-hover:translate-x-1 transition-all"/>
              </div>
            </Link>
          ))}
          {pendingCases.length === 0 && (
            <div className="p-10 text-center text-on-surface-variant font-bold">
              You have no pending cases!
            </div>
          )}
        </div>
      </div>
    </>
  )
}
