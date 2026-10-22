'use client'

import { useRouter } from 'next/navigation'

import { useState } from 'react'
import { XCircle } from 'lucide-react'
import { withdrawLeaveRequest } from './actions'

export default function WithdrawLeaveButton({ leaveId }: { leaveId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleWithdraw() {
    if (!confirm('Are you sure you want to withdraw this leave request?')) return
    setLoading(true)
    const res = await withdrawLeaveRequest(leaveId)
    setLoading(false)
    if (res.error) {
      alert('Error: ' + res.error)
    } else {
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleWithdraw}
      disabled={loading}
      className="p-1.5 text-danger hover:bg-danger-bg rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1 font-label-sm text-label-sm font-bold ml-2"
      title="Withdraw Request"
    >
      <XCircle className="w-4 h-4" />
      Withdraw
    </button>
  )
}
