import { getCase, getDirectory } from '@/lib/cases/data'
import { authenticate } from '@/lib/auth/session'
import { ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'
import CaseTabs from './CaseTabs'
import SeniorReviewPanel from './SeniorReviewPanel'
import StatusBadge from '@/components/ui/StatusBadge'
import { ReactNode } from 'react'

export default async function CaseDetailsLayout({ 
  children, 
  params 
}: { 
  children: ReactNode, 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const [caseData, directory, { user, profile }] = await Promise.all([getCase(id), getDirectory(), authenticate()])
  const reviewers = directory.filter(u => ['reviewer', 'manager', 'lead', 'owner', 'admin'].includes(u.role) || ['L3', 'L4', 'L5'].includes(u.level))
  const valuators = directory.filter(u => u.role !== 'field_agent' && (['valuator', 'staff', 'editor', 'analyst', 'lead', 'manager', 'owner', 'admin'].includes(u.role) || ['L2', 'L3', 'L4', 'L5'].includes(u.level)))

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/cases" aria-label="Back to cases" className="w-10 h-10 bg-surface border border-border-base rounded-xl flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-on-surface">{caseData.applicant_name}</h1>
            <span className="text-xs font-bold px-3 py-1 bg-surface-hover border border-border-base text-on-surface-variant rounded-full">
              {caseData.application_number}
            </span>
            <StatusBadge status={caseData.status} />
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-sm mt-1">
            <MapPin className="w-4 h-4 shrink-0 text-brand-dark" />
            <span>{caseData.address}</span>
          </div>
        </div>
      </div>

      <details className="mb-5 ui-panel"><summary className="px-4 py-3 text-xs font-medium">Team assignments & approvals</summary><div className="px-4 pb-4 space-y-3">
        <SeniorReviewPanel 
          caseId={id} 
          currentStatus={caseData.status} 
          profile={profile} revision={caseData.revision}
          reviewers={reviewers || []} 
          valuators={valuators || []}
          currentReviewer={caseData.reviewer} 
          currentValuator={caseData.valuator}
          currentUserId={user?.id || ''}
          caseCreatorId={caseData.created_by || ''}
        />
      </div></details>

      <CaseTabs caseId={id} />

      <div className="mt-6">
        {children}
      </div>
    </>
  )
}
