'use client'

import { useRouter } from 'next/navigation'

import { useState } from 'react'
import { Plus, X, Loader2, Upload } from 'lucide-react'
import { uploadDocument } from './actions'

export default function UploadDocumentModal({ caseId }: { caseId: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    formData.append('caseId', caseId)
    
    try {
      const res = await uploadDocument(formData)
      if (res.error) {
        setError(res.error)
      } else {
        router.refresh()
        setIsOpen(false)
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-foreground hover:opacity-90 text-background font-medium px-4 py-2 rounded-xl text-sm transition-opacity shadow-sm flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Upload Document
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-card-foreground">Upload Document</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-muted dark:hover:text-muted transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-muted dark:text-muted uppercase tracking-wider mb-2">Document Type</label>
                <select 
                  name="documentType" 
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:bg-card focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                >
                  <option value="">Select type...</option>
                  <option value="Sale Deed">Sale Deed</option>
                  <option value="Property Tax Receipt">Property Tax Receipt</option>
                  <option value="Building Plan">Building Plan</option>
                  <option value="Layout Plan">Layout Plan</option>
                  <option value="Aadhaar Card">Aadhaar Card / ID</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted dark:text-muted uppercase tracking-wider mb-2">File</label>
                <input 
                  type="file" 
                  name="file" 
                  required 
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:bg-card focus:ring-2 focus:ring-brand-blue outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20 cursor-pointer"
                />
              </div>

              {error && (
                <div className="p-3 bg-brand-red/10 border border-brand-red/20 rounded-xl">
                  <p className="text-brand-red text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-muted dark:text-muted hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
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
