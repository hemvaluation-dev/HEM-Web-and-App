'use client'

import { useRouter } from 'next/navigation'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deletePhoto } from './actions'

export default function DeletePhotoButton({ photoId, caseId }: { photoId: string, caseId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this photo?')) return
    setLoading(true)
    try {
      const result = await deletePhoto(photoId, caseId)
      if (result.error) alert(result.error)
      else router.refresh()
    } catch (e) {
      console.error(e)
      alert('The photo could not be deleted. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
      title="Delete photo"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
