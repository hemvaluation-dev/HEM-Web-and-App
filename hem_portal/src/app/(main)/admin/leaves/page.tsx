import { getAllLeaves } from './actions'
import { CalendarDays, Clock } from 'lucide-react'
import LeaveActionButtons from './LeaveActionButtons'
import StateFilter from '@/components/StateFilter'

export const dynamic = 'force-dynamic'

export default async function AdminLeavesPage({ searchParams }: { searchParams?: Promise<{ state?: string }> }) {
  const params = await searchParams;
  const stateFilter = params?.state || '';
  
  let leaves = await getAllLeaves()
  
  if (stateFilter) {
    leaves = leaves.filter((l: any) => l.user?.state === stateFilter)
  }

  return (
    <div className="space-y-6 text-on-surface">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight mb-2">Leave Management</h1>
          <p className="text-on-surface-variant">Review and approve agent leave requests.</p>
        </div>
        <div>
          <StateFilter />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border-base shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-border-base bg-surface-container-low flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand-dark" />
            Pending & Past Requests
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border-base">
                <th className="px-8 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Employee</th>
                <th className="px-8 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Dates</th>
                <th className="px-8 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Reason</th>
                <th className="px-8 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {leaves.map((l: any) => (
                <tr key={l.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-label-md text-label-md text-on-surface font-bold">
                      {l.user?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-caption text-on-surface-variant mt-1">{l.user?.department || 'General'} Dept.</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 font-body-md text-on-surface">
                      <Clock className="w-4 h-4 text-brand-dark" />
                      {new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5 font-body-md text-body-md text-on-surface-variant max-w-xs truncate" title={l.reason}>
                    {l.reason}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <LeaveActionButtons leaveId={l.id} currentStatus={l.status} />
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-on-surface-variant font-body-md">
                    No leave requests found.
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
