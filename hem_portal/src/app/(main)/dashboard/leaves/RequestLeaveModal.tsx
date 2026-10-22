'use client'

import { useRouter } from 'next/navigation'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { submitLeaveRequest } from './actions'

export default function RequestLeaveModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await submitLeaveRequest(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
      setIsOpen(false)
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-on-primary font-bold rounded-lg transition-all duration-200 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Request Leave
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border-base flex justify-between items-center bg-surface-container-low">
              <h2 className="text-xl font-bold text-on-surface">New Leave Request</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-surface-hover rounded-full transition-colors text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-danger-bg text-danger-text rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-on-surface">Start Date</label>
                  <input 
                    name="start_date" 
                    type="date"
                    required 
                    className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-on-surface">End Date</label>
                  <input 
                    name="end_date" 
                    type="date"
                    required 
                    className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-on-surface">Reason</label>
                <textarea 
                  name="reason" 
                  required 
                  rows={4}
                  className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary resize-none"
                  placeholder="Please describe the reason for your leave..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border-base mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 text-on-surface-variant font-bold hover:bg-surface-hover rounded-lg transition-colors border border-border-base"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
