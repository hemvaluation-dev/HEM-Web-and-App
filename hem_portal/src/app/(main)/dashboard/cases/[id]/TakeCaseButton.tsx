'use client'

import { useState } from 'react'
import { UserPlus, Loader2, CheckCircle2 } from 'lucide-react'
import { takeCase } from '../../actions'
import { useRouter } from 'next/navigation'

export default function TakeCaseButton({ caseId }: { caseId: string }) {
  const [loading, setLoading] = useState(false)
  const [taken, setTaken] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleTake() {
    setLoading(true)
    setError('')
    try {
      const res = await takeCase(caseId)
      if (res.error) {
        setError(res.error)
      } else {
        setTaken(true)
        router.refresh()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (taken) {
    return (
      <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-xl border border-green-200 dark:border-green-800">
        <CheckCircle2 className="w-5 h-5" />
        You have been assigned as the Report Valuator for this case.
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleTake}
        disabled={loading}
        className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary hover:opacity-90 text-on-primary transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
        Take This Case — Assign Me as Report Valuator
      </button>
      {error && (
        <p className="text-danger text-xs font-semibold mt-2">{error}</p>
      )}
    </div>
  )
}
