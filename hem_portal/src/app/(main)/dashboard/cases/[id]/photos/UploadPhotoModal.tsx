'use client'

import { useRouter } from 'next/navigation'

import { useState } from 'react'
import { Plus, X, Upload, Loader2 } from 'lucide-react'
import { photoTypes } from '@/lib/reports/photo-types'
import { uploadPhoto } from './actions'

export default function UploadPhotoModal({ caseId }: { caseId: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    formData.append('caseId', caseId)
    
    try {
      const res = await uploadPhoto(formData)
      if (res.error) {
        setError(res.error)
      } else {
        router.refresh()
        setIsOpen(false)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Upload Photo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-foreground">Upload Photo</h2>
                <p className="text-sm text-muted">Add a new property photo</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-foreground transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-danger-bg dark:bg-red-900/20 text-brand-red p-3 rounded-lg text-sm border border-red-100 dark:border-red-900/50">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Photo Type</label>
                  <select 
                    name="photoType" 
                    required
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:bg-card focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                  >
                    <option value="">Select type...</option>
                    {photoTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Image File</label>
                  <input 
                    type="file" 
                    name="file" 
                    required 
                    accept="image/*"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:bg-card focus:ring-2 focus:ring-brand-blue outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-muted dark:text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 min-w-[120px]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
