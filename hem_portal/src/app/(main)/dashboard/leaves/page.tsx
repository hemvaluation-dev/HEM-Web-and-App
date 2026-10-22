import { getMyLeaves } from './actions'
import { CalendarDays, Clock } from 'lucide-react'
import RequestLeaveModal from './RequestLeaveModal'
import WithdrawLeaveButton from './WithdrawLeaveButton'

export const dynamic = 'force-dynamic'

export default async function DashboardLeavesPage() {
  const leaves = await getMyLeaves()

  return (
    <div className="space-y-6 text-on-surface">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight mb-2">My Leaves</h1>
          <p className="text-on-surface-variant">Request time off and track your leave history.</p>
        </div>
        <RequestLeaveModal />
      </div>

      <div className="bg-surface rounded-xl border border-border-base shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-border-base bg-surface-container-low flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand-dark" />
            Leave History
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border-base">
                <th className="px-8 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Date Range</th>
                <th className="px-8 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Reason</th>
                <th className="px-8 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Submitted On</th>
                <th className="px-8 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {leaves.map((l: any) => {
                const isPending = l.status === 'pending' || l.status === 'pending_owner'
                return (
                <tr key={l.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 font-body-md text-on-surface font-bold">
                      <Clock className="w-4 h-4 text-brand-dark" />
                      {new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5 font-body-md text-body-md text-on-surface-variant max-w-xs truncate" title={l.reason}>
                    {l.reason}
                  </td>
                  <td className="px-8 py-5 font-body-md text-body-md text-on-surface-variant">
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 flex items-center gap-2">
                    <span className={`inline-flex px-3 py-1 rounded-full text-caption font-bold ${
                      l.status === 'approved' ? 'bg-success-bg text-success-text' : 
                      l.status === 'rejected' ? 'bg-danger-bg text-danger-text' : 
                      l.status === 'withdrawn' ? 'bg-surface-hover text-on-surface-variant' :
                      'bg-warning-bg text-warning-text'
                    }`}>
                      {l.status.toUpperCase()}
                    </span>
                    {isPending && <WithdrawLeaveButton leaveId={l.id} />}
                  </td>
                </tr>
              )})}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-on-surface-variant font-body-md">
                    You haven't made any leave requests yet.
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
