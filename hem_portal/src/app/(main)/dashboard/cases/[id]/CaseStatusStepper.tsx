'use client'

import { Check, ChevronRight } from 'lucide-react'

const STEPS = [
  { key: 'new', label: 'New' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'Site Activity' },
  { key: 'field_visit_done', label: 'Field Visit Done' },
  { key: 'report_drafted', label: 'Report Drafted' },
  { key: 'delivered', label: 'Delivered (Completed)' }
]

export default function CaseStatusStepper({ currentStatus }: { caseId: string, currentStatus: string, userRole: string }) {

  // Normalize status
  let activeIndex = STEPS.findIndex(s => s.key === currentStatus.toLowerCase())
  if (currentStatus.toLowerCase() === 'created') activeIndex = 0
  if (['location_captured', 'photos_uploaded', 'data_drafted', 'in_progress'].includes(currentStatus.toLowerCase())) activeIndex = 2
  if (currentStatus.toLowerCase() === 'submitted') activeIndex = 3
  if (['pending_review','in_review','reviewed'].includes(currentStatus.toLowerCase())) activeIndex = 4
  if (currentStatus.toLowerCase() === 'completed' || currentStatus.toLowerCase() === 'delivered') activeIndex = 5
  if (activeIndex === -1) activeIndex = 0

  return (
    <div className="bg-surface rounded-xl border border-border-base p-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-on-surface text-base">Case Lifecycle Workflow</h3>
          <p className="text-xs text-on-surface-variant">Automated tracking of case progress</p>
        </div>
      </div>

      <div className="relative flex flex-wrap md:flex-nowrap items-center justify-between gap-2 md:gap-0 mt-6">
        {STEPS.map((step, idx) => {
          const isPassed = idx < activeIndex
          const isCurrent = idx === activeIndex

          return (
            <div key={step.key} className="flex items-center flex-1 min-w-[140px] md:min-w-0">
              <div
                className={`flex items-center gap-2.5 py-2 px-3 rounded-xl transition-all w-full text-left ${
                  isCurrent
                    ? 'bg-primary text-on-primary font-bold shadow-md scale-105'
                    : isPassed
                    ? 'bg-surface-container-high text-brand-dark font-bold'
                    : 'bg-surface-container-low text-on-surface-variant opacity-75'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isCurrent ? 'bg-on-primary text-blue-800' : isPassed ? 'bg-primary text-on-primary' : 'bg-border-base text-on-surface-variant'
                }`}>
                  {isPassed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span className="text-xs truncate">{step.label}</span>
              </div>

              {idx < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-border-base hidden md:block mx-1 flex-shrink-0" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
