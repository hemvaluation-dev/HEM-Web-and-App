'use client'

import { useRouter } from 'next/navigation'

import { useState, useEffect, useRef } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { createCase, getAllClients, getAllReviewers, getAllAgents, generateDocumentUploadUrl, attachCaseDocumentRecord } from '../actions'
import { INDIAN_STATES } from '@/utils/constants'
import { createClient } from '@/utils/supabase/client'

export default function CreateCaseModal({ agents, clients, reviewers, sidebarMode, mobileNavMode }: { agents?: any[], clients?: any[], reviewers?: any[], sidebarMode?: boolean, mobileNavMode?: boolean }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [agentList, setAgentList] = useState<any[]>(agents || [])
  const [clientList, setClientList] = useState<any[]>(clients || [])
  const [reviewerList, setReviewerList] = useState<any[]>(reviewers || [])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const idempotencyKeyRef = useRef(crypto.randomUUID())

  useEffect(() => {
    if (isOpen) {
      getAllAgents().then(res => {
        if (res && res.length > 0) {
          setAgentList(res)
        }
      })
      getAllClients().then(res => {
        if (res && res.length > 0) {
          setClientList(res)
        }
      })
      getAllReviewers().then(res => {
        if (res && res.length > 0) {
          setReviewerList(res)
        }
      })
    } else {
      setAgentList(agents || [])
      setClientList(clients || [])
      setReviewerList(reviewers || [])
    }
  }, [isOpen, agents, clients, reviewers])

  // Reset idempotency key and submission state when modal opens fresh
  useEffect(() => {
    if (isOpen) {
      idempotencyKeyRef.current = crypto.randomUUID()
      setSubmitted(false)
      setError('')
    }
  }, [isOpen])

  async function handleSubmit(formData: FormData) {
    if (submitted) return // Prevent duplicate submissions
    setLoading(true)
    setSubmitted(true)
    setError('')
    
    const documents = formData.getAll('documents') as File[]
    formData.delete('documents')
    if (documents.some(file => file.size > 18 * 1024 * 1024)) {
      setError('Each document must be smaller than 18 MB.')
      setSubmitted(false)
      setLoading(false)
      return
    }
    
    // Attach the idempotency key
    formData.set('idempotency_key', idempotencyKeyRef.current)
    
    try {
      const res = await createCase(formData)
      if (res.error) {
        setError(res.error)
        setSubmitted(false) // Allow user to fix error and resubmit
      } else {
        const caseId = res.caseId
        if (caseId && documents && documents.length > 0) {
          const validDocs = documents.filter(f => f.size > 0)
          if (validDocs.length > 0) {
            const supabase = createClient()
            for (const file of validDocs) {
              const uploadInfo = await generateDocumentUploadUrl(caseId, file.name, file.size)
              if (uploadInfo.token && uploadInfo.path && uploadInfo.publicUrl) {
                const { error: uploadError } = await supabase.storage
                  .from('documents')
                  .uploadToSignedUrl(uploadInfo.path, uploadInfo.token, file)
                
                if (!uploadError) {
                  const attached = await attachCaseDocumentRecord(caseId, uploadInfo.publicUrl, file.name)
                  if (attached.error) {
                    await supabase.storage.from('documents').remove([uploadInfo.path])
                    console.error('Failed to attach uploaded document:', attached.error)
                  }
                } else {
                  console.error('Failed to upload document:', uploadError)
                }
              }
            }
          }
        }
        router.refresh()
        setIsOpen(false)
      }
    } catch (e: any) {
      let msg = e.message || 'Something went wrong'
      if (msg.toLowerCase().includes('unexpected response')) {
        msg = 'The server took too long to respond or the request was too large. Please try again.'
      }
      setError(msg)
      setSubmitted(false) // Allow user to try again
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={mobileNavMode
          ? "flex flex-col items-center justify-center p-1.5 rounded-xl transition-all text-brand-dark dark:text-brand-dark font-semibold"
          : sidebarMode 
          ? "w-full px-4 py-2 text-xs font-bold rounded-xl bg-primary dark:bg-primary hover:opacity-90 text-on-primary transition-all flex items-center justify-center gap-1.5 shadow-md"
          : "px-4 py-2 text-xs font-bold rounded-xl bg-primary dark:bg-primary hover:opacity-90 text-on-primary transition-all flex items-center gap-1.5 shadow-md"
        }
      >
        {mobileNavMode ? (
          <>
            <div className="w-8 h-8 rounded-full bg-primary/20 dark:bg-primary/20 flex items-center justify-center mb-0.5 border border-primary/30">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px]">Create</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 stroke-[3]" />
            Create Evaluation
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface dark:bg-surface border border-line dark:border-line rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line dark:border-line">
              <h2 className="text-base font-bold text-ink dark:text-white">Initiate New Evaluation Case</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted dark:text-muted hover:text-ink dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-hover dark:hover:bg-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={handleSubmit} className="overflow-y-auto p-6 space-y-5 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-muted dark:text-muted uppercase tracking-wider mb-1.5">Application Reference Number</label>
                  <input 
                    type="text" 
                    name="application_number" 
                    required 
                    placeholder="APP-2026-001"
                    className="w-full bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-primary dark:focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted dark:text-muted uppercase tracking-wider mb-1.5">Lender / Financial Institution</label>
                  <select 
                    name="client_id" 
                    required
                    value={selectedClientId}
                    onChange={e => setSelectedClientId(e.target.value)}
                    className="w-full bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-primary dark:focus:border-primary outline-none transition-all"
                  >
                    <option value="">Select lender / template...</option>
                    {clientList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-muted dark:text-muted uppercase tracking-wider mb-1.5">Applicant Name</label>
                  <input 
                    type="text" 
                    name="applicant_name" 
                    required 
                    placeholder="John Doe"
                    className="w-full bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-primary dark:focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted dark:text-muted uppercase tracking-wider mb-1.5">Contact Number</label>
                  <input 
                    type="tel" 
                    name="phone_number" 
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-primary dark:focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted dark:text-muted uppercase tracking-wider mb-1.5">Property Location Address</label>
                <textarea 
                  name="address" 
                  required 
                  rows={2}
                  placeholder="Street address, city"
                  className="w-full bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-primary dark:focus:border-primary outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted dark:text-muted uppercase tracking-wider mb-1.5">Branch</label>
                <input 
                  type="text" 
                  name="branch" 
                  required 
                  placeholder="e.g. RAJAHMUNDRY"
                  className="w-full bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-primary dark:focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted dark:text-muted uppercase tracking-wider mb-1.5">State</label>
                <select 
                  name="state" 
                  required
                  className="w-full bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-primary dark:focus:border-primary outline-none transition-all"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-muted dark:text-muted uppercase tracking-wider mb-1.5">Case Type</label>
                  <input
                    type="text"
                    name="case_type"
                    placeholder="e.g. New Case, Remake, Re-valuation"
                    className="w-full bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-primary dark:focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted dark:text-muted uppercase tracking-wider mb-1.5">Assign Field Officer (Data & Photos)</label>
                  <select 
                    name="assigned_to" 
                    className="w-full bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-primary dark:focus:border-primary outline-none transition-all"
                  >
                    <option value="unassigned">Keep Unassigned for now</option>
                    {agentList.map(a => (
                      <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-line/60 dark:border-line/60">
                <label className="block text-[11px] font-bold text-muted dark:text-muted uppercase tracking-wider mb-1.5">Initiation Date</label>
                <input 
                  type="datetime-local" 
                  name="deadline_date"
                  className="w-full bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-primary dark:focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="pt-2 border-t border-line/60 dark:border-line/60">
                <label className="block text-[11px] font-bold text-muted dark:text-muted uppercase tracking-wider mb-1.5">Initial Documents (Optional)</label>
                <input 
                  type="file" 
                  name="documents" 
                  multiple 
                  className="w-full bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl px-3.5 py-1.5 text-xs text-ink dark:text-white focus:border-primary dark:focus:border-primary outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-brand-dark hover:file:bg-primary/20"
                />
              </div>

              <div className="pt-2 border-t border-line/60 dark:border-line/60">
                <div>
                  <label className="block text-[11px] font-bold text-muted dark:text-muted uppercase tracking-wider mb-1.5">Assign Senior Reviewer (Final Approval)</label>
                  <select 
                    name="reviewer_id" 
                    className="w-full bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-primary dark:focus:border-primary outline-none transition-all"
                  >
                    <option value="unassigned">Keep Unassigned for now</option>
                    {reviewerList.map(r => (
                      <option key={r.id} value={r.id}>{r.full_name || r.email} ({r.role?.toUpperCase() || 'MANAGER'})</option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-muted dark:text-muted mt-2 italic">Report Valuator will be auto-assigned when someone takes the case after field data submission.</p>
              </div>

              {error && (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl">
                  <p className="text-danger text-xs font-semibold">{error}</p>
                </div>
              )}

              <div className="pt-4 border-t border-line dark:border-line flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted dark:text-muted hover:text-ink dark:hover:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading || submitted}
                  className="bg-primary dark:bg-primary hover:opacity-90 text-on-primary font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (submitted ? 'Submitted' : 'Initiate Evaluation')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
