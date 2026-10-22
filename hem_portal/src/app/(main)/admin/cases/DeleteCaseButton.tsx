'use client'

import { useRouter } from 'next/navigation'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteCaseAction } from '../actions'

export default function DeleteCaseButton({ caseId, caseName }: { caseId: string, caseName: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm(`Are you absolutely sure you want to completely delete case: ${caseName}?\n\nThis will permanently delete the case, all review data, location data, photos, and documents from both the database and cloud storage. This action cannot be undone.`)) {
      setIsDeleting(true)
      const res = await deleteCaseAction(caseId)
      if (res?.error) {
        alert(`Error deleting case: ${res.error}`)
        setIsDeleting(false)
      }
      if (!res?.error) router.refresh()
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      title="Permanently Delete Case"
      className="p-2.5 rounded-xl bg-danger/10 hover:bg-danger-solid text-danger hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
