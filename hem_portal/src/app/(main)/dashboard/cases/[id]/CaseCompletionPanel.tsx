'use client'

import { useRouter } from 'next/navigation'

import { permissions, type Profile } from '@/lib/auth/permissions'
import { normalizeCaseStatus } from '@/lib/cases/status'
import { useState } from 'react'
import { Loader2, UserCheck, UserPlus } from 'lucide-react'
import { updateCaseStatus, reassignCaseValuator } from './actions'

type TeamMember = { id: string; full_name?: string | null; email?: string | null; role?: string | null; level?: string | null }

interface Props {
  caseId: string
  currentStatus: string
  profile: Profile
  revision: number
  valuators?: TeamMember[]
  currentValuator?: TeamMember | null
  currentUserId?: string
  caseCreatorId?: string
}

export default function CaseCompletionPanel({ caseId, currentStatus, profile, revision, valuators = [], currentValuator, currentUserId, caseCreatorId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [valuatorChoice, setValuatorChoice] = useState<{ current?: string; value: string } | null>(null)
  const selectedValuator = valuatorChoice && valuatorChoice.current === currentValuator?.id ? valuatorChoice.value : currentValuator?.id || ''
  const [reassigningValuator, setReassigningValuator] = useState(false)

  const normalizedStatus = normalizeCaseStatus(currentStatus)
  const { valuation } = permissions(profile)
  const isCaseCreator = Boolean(currentUserId && caseCreatorId && currentUserId === caseCreatorId)

  async function handleStatusChange(newStatus: string) {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const result = await updateCaseStatus(caseId, newStatus, revision)
      if (result.error) setError(result.error)
      else router.refresh()
    } catch { setError('The request failed. Please try again.') }
    finally { setLoading(false) }
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

      {normalizedStatus === 'field_visit_done' && <div className="ui-panel p-5 text-sm">Field inspection submitted. Review the data, then open the Report tab to generate and save the report before completing the case.</div>}
      {['report_drafted', 'in_review', 'reviewed'].includes(normalizedStatus) && valuation && (
        <div className="ui-panel p-5 space-y-3">
          <h3 className="font-bold text-on-surface">Ready to complete</h3>
          <p className="text-sm text-on-surface-variant">Verify the saved report, then mark this case completed. Senior approval is no longer required.</p>
          <p className="text-sm text-warning">Completed cases and all related files are permanently deleted after 30 days. Download any records you need before then.</p>
          <button className="ui-button ui-button-primary" disabled={loading} onClick={() => {
            if (window.confirm('Complete this case? It becomes read-only and will be permanently deleted with all its files after 30 days.')) void handleStatusChange('completed')
          }}>{loading ? 'Completing…' : 'Mark case completed'}</button>
          <button className="ui-button ml-2" disabled={loading} onClick={() => handleStatusChange('field_visit_done')}>Revise data and report</button>
        </div>
      )}
      {normalizedStatus === 'completed' && <div className="ui-panel p-5 text-sm">Case completed. This case and all related files will be permanently deleted 30 days after completion.</div>}
    </div>
  )
}
