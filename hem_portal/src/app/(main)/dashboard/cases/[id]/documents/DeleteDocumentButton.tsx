'use client'

import { useRouter } from 'next/navigation'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteDocument } from './actions'

export default function DeleteDocumentButton({ documentId, caseId }: { documentId: string, caseId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this document?')) return
    setLoading(true)
    try {
      const result = await deleteDocument(documentId, caseId)
      if (result.error) alert(result.error)
      else router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="w-10 h-10 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-danger-bg dark:border-red-900/50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
      title="Delete document"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
