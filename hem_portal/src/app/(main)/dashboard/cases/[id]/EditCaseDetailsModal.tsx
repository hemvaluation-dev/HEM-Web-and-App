'use client'

import { useState } from 'react'
import { Edit2, Loader2, X } from 'lucide-react'
import { updateCaseDetails } from './actions'
import { INDIAN_STATES } from '@/utils/constants'
import { useRouter } from 'next/navigation'

export default function EditCaseDetailsModal({ caseData }: { caseData: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await updateCaseDetails(caseData.id, formData)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
          router.refresh()
        }, 1200)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Format deadline for datetime-local input
  let defaultDeadline = ''
  if (caseData.deadline_date) {
    try {
      const d = new Date(caseData.deadline_date)
      // subtract timezone offset to get local time for the input
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      defaultDeadline = local.toISOString().slice(0, 16)
    } catch (e) {}
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary/10 text-brand-dark hover:bg-primary/20 text-sm font-bold rounded-xl transition-colors"
      >
        <Edit2 className="w-4 h-4" />
        Edit Details
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-xl rounded-[32px] shadow-2xl border border-line overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-line flex justify-between items-center bg-surface-container-lowest shrink-0">
              <h2 className="text-2xl font-semibold text-on-surface">Edit Case Details</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-on-surface-variant hover:text-danger hover:bg-danger/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Applicant Name</label>
                  <input 
                    type="text" 
                    name="applicant_name" 
                    required 
                    defaultValue={caseData.applicant_name}
                    className="w-full bg-surface-container-low border border-line rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Contact Number</label>
                  <input 
                    type="tel" 
                    name="phone_number" 
                    defaultValue={caseData.phone_number}
                    className="w-full bg-surface-container-low border border-line rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Property Address</label>
                <textarea 
                  name="address" 
                  required 
                  rows={2}
                  defaultValue={caseData.address}
                  className="w-full bg-surface-container-low border border-line rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:border-primary outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">State</label>
                <select 
                  name="state" 
                  required
                  defaultValue={caseData.state || ''}
                  className="w-full bg-surface-container-low border border-line rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:border-primary outline-none transition-all"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Property Type</label>
                  <select 
                    name="property_type" 
                    defaultValue={caseData.property_type || ''}
                    className="w-full bg-surface-container-low border border-line rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:border-primary outline-none transition-all"
                  >
                    <option value="">Not set yet</option>
                    <option value="Residential">Residential Property</option>
                    <option value="Commercial">Commercial Asset</option>
                    <option value="Industrial">Industrial Facility</option>
                    <option value="Vacant Land">Vacant Land Parcel</option>
                    <option value="Agricultural">Agricultural Land</option>
                    <option value="Mixed">Mixed-Use Complex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Case Type</label>
                  <input
                    type="text"
                    name="case_type"
                    defaultValue={caseData.case_type || ''}
                    placeholder="e.g. New Case, Remake, Re-valuation"
                    className="w-full bg-surface-container-low border border-line rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Initiation Date</label>
                  <input 
                    type="datetime-local" 
                    name="deadline_date"
                    defaultValue={defaultDeadline}
                    className="w-full bg-surface-container-low border border-line rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl">
                  <p className="text-danger text-xs font-semibold">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-success/10 border border-success/20 rounded-xl">
                  <p className="text-success text-xs font-semibold">✓ Case details updated successfully</p>
                </div>
              )}

              <div className="pt-4 border-t border-line flex gap-3 justify-end shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading || success}
                  className="bg-primary hover:bg-primary-hover text-on-primary font-bold px-6 py-2 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? '✓ Saved' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
