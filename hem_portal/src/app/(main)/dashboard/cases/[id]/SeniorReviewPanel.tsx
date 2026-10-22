'use client'

import { useRouter } from 'next/navigation'

import { permissions, type Profile } from '@/lib/auth/permissions'
import { normalizeCaseStatus } from '@/lib/cases/status'
import { useState } from 'react'
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Loader2, RefreshCw, UserCheck, UserPlus } from 'lucide-react'
import { updateCaseStatus, reassignCaseReviewer, reassignCaseValuator } from './actions'

type TeamMember = { id: string; full_name?: string | null; email?: string | null; role?: string | null; level?: string | null }

interface Props {
  caseId: string
  currentStatus: string
  profile: Profile
  revision: number
  reviewers?: TeamMember[]
  valuators?: TeamMember[]
  currentReviewer?: TeamMember | null
  currentValuator?: TeamMember | null
  currentUserId?: string
  caseCreatorId?: string
}

export default function SeniorReviewPanel({ caseId, currentStatus, profile, revision, reviewers = [], valuators = [], currentReviewer, currentValuator, currentUserId, caseCreatorId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionType, setActionType] = useState<string | null>(null)
  const [reviewerChoice, setReviewerChoice] = useState<{ current?: string; value: string } | null>(null)
  const [valuatorChoice, setValuatorChoice] = useState<{ current?: string; value: string } | null>(null)
  const selectedReviewer = reviewerChoice && reviewerChoice.current === currentReviewer?.id ? reviewerChoice.value : currentReviewer?.id || ''
  const selectedValuator = valuatorChoice && valuatorChoice.current === currentValuator?.id ? valuatorChoice.value : currentValuator?.id || ''
  const [reassigning, setReassigning] = useState(false)
  const [reassigningValuator, setReassigningValuator] = useState(false)

  const normalizedStatus = normalizeCaseStatus(currentStatus)
  const { senior: isSeniorLevel, valuation } = permissions(profile)
  const isCaseCreator = Boolean(currentUserId && caseCreatorId && currentUserId === caseCreatorId)

  async function handleStatusChange(newStatus: string, actionName: string) {
    if (loading) return
    setLoading(true)
    setActionType(actionName)
    setError('')
    try {
      const result = await updateCaseStatus(caseId, newStatus, revision)
      if (result.error) setError(result.error)
      else router.refresh()
    } catch { setError('The request failed. Please try again.') }
    finally { setLoading(false); setActionType(null) }
  }

  async function handleReassign() {
    if (!selectedReviewer || reassigning) return
    setReassigning(true)
    setError('')
    try {
      const result = await reassignCaseReviewer(caseId, selectedReviewer)
      if (result.error) setError(result.error)
      else router.refresh()
    } catch { setError('The assignment failed. Please try again.') }
    finally { setReassigning(false) }
  }

  async function handleReassignValuator() {
    if (!selectedValuator || reassigningValuator) return
    setReassigningValuator(true)
    setError('')
    try {
      const result = await reassignCaseValuator(caseId, selectedValuator)
      if (result.error) setError(result.error)
      else router.refresh()
    } catch { setError('The assignment failed. Please try again.') }
    finally { setReassigningValuator(false) }
  }

  return (
    <div className="space-y-4 mb-6">
      {error && <p role="alert" className="p-3 rounded-lg bg-danger-bg text-danger text-sm">{error}</p>}
      {/* Report Valuator Assignment Card */}
      <div className="bg-surface rounded-xl border border-border-base p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-500/15 text-success rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-on-surface text-sm">Report Valuator Assignment</h4>
              {currentValuator ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-success/15 text-success uppercase">Assigned</span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-warning/15 text-warning uppercase">Unassigned</span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {currentValuator ? (
                <>Assigned to <strong className="text-on-surface">{currentValuator.full_name || currentValuator.email}</strong> ({currentValuator.role?.toUpperCase() || 'VALUATOR'} • {currentValuator.level || 'L2'})</>
              ) : (
                'Select a Report Valuator to evaluate the site data and photos.'
              )}
            </p>
          </div>
        </div>

        {isCaseCreator ? (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedValuator}
              onChange={(e) => setValuatorChoice({ current: currentValuator?.id, value: e.target.value })}
              className="flex-1 md:w-64 bg-surface-hover border border-border-base text-xs font-semibold text-on-surface rounded-xl px-3.5 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="" disabled>Select Report Valuator...</option>
              {valuators.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.full_name || v.email} ({v.role?.toUpperCase() || 'VALUATOR'})
                </option>
              ))}
            </select>
            <button
              onClick={handleReassignValuator}
              disabled={reassigningValuator || !selectedValuator || selectedValuator === currentValuator?.id}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0"
            >
              {reassigningValuator ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              {currentValuator ? 'Reassign' : 'Assign Valuator'}
            </button>
          </div>
        ) : (
          <div className="px-3.5 py-2 bg-surface-hover rounded-xl border border-border-base text-xs font-semibold text-on-surface-variant">
            Only the case creator can assign or reassign valuators
          </div>
        )}
      </div>

      {/* Senior Reviewer / Manager Assignment Card */}
      <div className="bg-surface rounded-xl border border-border-base p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-indigo-500/15 text-brand-dark rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-on-surface text-sm">Senior Manager / Reviewer Assignment</h4>
              {currentReviewer ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-success/15 text-success uppercase">Assigned</span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-warning/15 text-warning uppercase">Unassigned</span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {currentReviewer ? (
                <>Assigned to <strong className="text-on-surface">{currentReviewer.full_name || currentReviewer.email}</strong> ({currentReviewer.role?.toUpperCase() || 'MANAGER'} • {currentReviewer.level || 'L4'})</>
              ) : (
                'Select a Manager or Senior Manager to review and approve this valuation case.'
              )}
            </p>
          </div>
        </div>

        {isCaseCreator ? (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedReviewer}
              onChange={(e) => setReviewerChoice({ current: currentReviewer?.id, value: e.target.value })}
              className="flex-1 md:w-64 bg-surface-hover border border-border-base text-xs font-semibold text-on-surface rounded-xl px-3.5 py-2 focus:outline-none focus:border-primary transition-colors"
            >
              <option value="" disabled>Select Manager / Reviewer...</option>
              {reviewers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.full_name || r.email} ({r.role?.toUpperCase() || 'MANAGER'})
                </option>
              ))}
            </select>
            <button
              onClick={handleReassign}
              disabled={reassigning || !selectedReviewer || selectedReviewer === currentReviewer?.id}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0"
            >
              {reassigning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              {currentReviewer ? 'Reassign' : 'Assign Reviewer'}
            </button>
          </div>
        ) : (
          <div className="px-3.5 py-2 bg-surface-hover rounded-xl border border-border-base text-xs font-semibold text-on-surface-variant">
            Only the case creator can assign or reassign reviewers
          </div>
        )}
      </div>

      {normalizedStatus === 'field_visit_done' && <div className="ui-panel p-5 text-sm">Field inspection submitted. Review the data, then open the Report tab to generate and save a draft for senior review.</div>}
      {/* Review Actions Banner (only when in reviewable stages) */}
      {normalizedStatus === 'report_drafted' && valuation && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/20 text-brand-dark rounded-xl mt-0.5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-lg">Ready for Senior Level Review</h3>
                <p className="text-sm text-on-surface-variant mt-1 max-w-xl">
                  The site data has been finalized. Pass this case to senior managers and reviewers for manual verification before final delivery.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleStatusChange('in_review', 'submit')}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-sm disabled:opacity-50 shrink-0"
            >
              {loading && actionType === 'submit' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Pass to Senior Review
            </button>
          </div>
        </div>
      )}

      {(normalizedStatus === 'in_review' || normalizedStatus === 'pending_review') && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 text-warning rounded-xl mt-0.5">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-on-surface text-lg">Under Senior Manual Review</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-warning">Action Required</span>
                </div>
                <p className="text-sm text-on-surface-variant mt-1 max-w-xl">
                  This case has been submitted to the senior leadership level. Please inspect the case data, location data, and documents manually.
                </p>
              </div>
            </div>

            {isSeniorLevel ? (
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                <button
                  onClick={() => handleStatusChange('report_drafted', 'revision')}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-surface-hover text-on-surface border border-border-base font-bold text-sm rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {loading && actionType === 'revision' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-warning" />
                  )}
                  Request Revisions
                </button>
                <button
                  onClick={() => handleStatusChange('reviewed', 'approve')}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {loading && actionType === 'approve' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Approve & Mark Reviewed
                </button>
              </div>
            ) : (
              <div className="px-4 py-2 bg-surface/80 rounded-xl border border-amber-500/20 text-xs font-semibold text-warning">
                Waiting for Senior Manager / Lead approval
              </div>
            )}
          </div>
        </div>
      )}

      {normalizedStatus === 'reviewed' && isSeniorLevel && <button className="ui-button ui-button-primary" disabled={loading} onClick={() => handleStatusChange('completed', 'complete')}>Mark delivered and complete</button>}
      {normalizedStatus === 'reviewed' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-success rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-on-surface text-sm">Senior Manual Review Completed</h4>
              <p className="text-xs text-on-surface-variant">The report has been verified and approved by senior leadership.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
