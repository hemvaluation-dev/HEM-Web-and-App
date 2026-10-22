'use client'

import { useRouter } from 'next/navigation'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { updateLeaveStatus } from './actions'

export default function LeaveActionButtons({ leaveId, currentStatus }: { leaveId: string, currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleStatus(newStatus: string) {
    setLoading(true)
    setError('')
    try {
      const result = await updateLeaveStatus(leaveId, newStatus)
      if (result.error) setError(result.error)
      else router.refresh()
    } catch { setError('The request failed. Please try again.') }
    finally { setLoading(false) }
  }

  const isPending = currentStatus === 'pending' || currentStatus === 'pending_owner'

  if (!isPending) {
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
        currentStatus === 'approved' ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
      }`}>
        {currentStatus.toUpperCase()}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-3 justify-end">
      {error && <p role="alert" className="text-xs text-danger max-w-xs">{error}</p>}
      {currentStatus === 'pending_owner' && (
        <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-warning font-bold">
          Sr. Mgr Approved (Pending Senior Management)
        </span>
      )}
      <div className="flex gap-1.5">
        <button 
          onClick={() => handleStatus('approved')}
          disabled={loading}
          className="p-2 bg-success-bg text-success hover:bg-success/20 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          title="Approve / Sign-off"
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleStatus('rejected')}
          disabled={loading}
          className="p-2 bg-danger-bg text-danger hover:bg-danger/20 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          title="Reject"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
