import { createClient } from '@/utils/supabase/server'
import { MapPin, CheckCircle2, Circle, Camera, ClipboardList, Download, ListChecks } from 'lucide-react'
import Link from 'next/link'
import EditCaseDetailsModal from './EditCaseDetailsModal'
import { getCase } from '@/lib/cases/data'
import { authenticate } from '@/lib/auth/session'
import { permissions } from '@/lib/auth/permissions'
import TakeCaseButton from './TakeCaseButton'
import ClientDate from '@/components/ClientDate'
import CustomerResponseRemark from './CustomerResponseRemark'

export const dynamic = 'force-dynamic'

export default async function CaseSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const [caseData, { profile }, locationResult, docResult, photoResult] = await Promise.all([
    getCase(id), authenticate(),
    supabase.from('case_location').select('*').eq('case_id', id).maybeSingle(),
    supabase.from('case_documents').select('id').eq('case_id', id).not('document_type', 'in', '("Video Recording","Audio Recording")').limit(1),
    supabase.from('case_photos').select('id').eq('case_id', id).limit(1),
  ])
  const userRole = profile.role || 'field_agent'
  const locationData = locationResult.data
  const docData = docResult.data
  const photoData = photoResult.data
  const mergedReviewData = caseData.extracted_data || {}
  const reviewEntries = Object.entries(mergedReviewData).filter(([k, v]) => 
    !['id', 'case_id', 'created_at', 'updated_at'].includes(k) && v !== null && v !== ''
  )

  const isLocCompleted = !!locationData
  const isDocCompleted = docData && docData.length > 0
  const isPhotoCompleted = photoData && photoData.length > 0
  
  return (
    <>
      <div className="flex items-center justify-between mb-5"><div><h2 className="font-semibold">Case overview</h2><p className="text-xs text-muted mt-1">Applicant details, field evidence, and workflow progress.</p></div>{permissions(profile).senior && <a href={`/api/export-media?caseId=${id}`} className="ui-button"><Download size={15} />Download archive</a>}</div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-on-surface">
        
        {/* Left Column - Raw Data */}
        <div className="lg:col-span-8 space-y-5">
          <CustomerResponseRemark key={`${id}-${caseData.customer_response_remark || ''}`} caseId={id} initialValue={caseData.customer_response_remark ?? null} readOnly={userRole === 'field_agent' || ['completed', 'delivered'].includes(caseData.status)} reportDrafted={caseData.status === 'report_drafted'} />
          
          <div className="bg-surface rounded-xl border border-border-base p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-on-surface flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-brand-dark"/> Applicant Information
              </h2>
              {userRole !== 'field_agent' && (
                <EditCaseDetailsModal caseData={caseData} />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-surface-container-low p-6 rounded-xl border border-border-base/50">
              <div>
                <p className="text-[11px] text-on-surface-variant font-medium mb-1 uppercase tracking-wider">Applicant Name</p>
                <p className="font-medium text-sm">{caseData.applicant_name}</p>
              </div>
              <div>
                <p className="text-[11px] text-on-surface-variant font-medium mb-1 uppercase tracking-wider">Lender / Institution</p>
                <p className="font-medium text-sm">{caseData.client?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[11px] text-on-surface-variant font-medium mb-1 uppercase tracking-wider">Phone</p>
                <p className="font-medium text-sm">{caseData.phone_number}</p>
              </div>
              <div>
                <p className="text-[11px] text-on-surface-variant font-medium mb-1 uppercase tracking-wider">Property Type</p>
                <p className="font-medium text-sm">{caseData.property_type || <span className="text-on-surface-variant italic">Pending field evaluation</span>}</p>
              </div>
              {caseData.case_type && (
                <div>
                  <p className="text-[11px] text-on-surface-variant font-medium mb-1 uppercase tracking-wider">Case Type</p>
                  <p className="font-medium text-sm">{caseData.case_type}</p>
                </div>
              )}
              <div className="col-span-1 md:col-span-2">
                <p className="text-[11px] text-on-surface-variant font-medium mb-1 uppercase tracking-wider">Property Address</p>
                <p className="font-medium text-sm leading-relaxed">{caseData.address}</p>
              </div>
              <div>
                <p className="text-[11px] text-on-surface-variant font-medium mb-1 uppercase tracking-wider">Application Date</p>
                <p className="font-medium text-sm"><ClientDate date={caseData.created_at} format="datetime" /></p>
              </div>
              <div>
                <p className="text-[11px] text-on-surface-variant font-medium mb-1 uppercase tracking-wider">Initiation Date</p>
                <p className="font-medium text-sm">{caseData.deadline_date ? <ClientDate date={caseData.deadline_date} format="date" /> : 'N/A'}</p>
              </div>
              {caseData.submitted_at && (
                <div>
                  <p className="text-[11px] text-on-surface-variant font-medium mb-1 uppercase tracking-wider">Submitted Date</p>
                  <p className="font-medium text-sm"><ClientDate date={caseData.submitted_at} format="date" /></p>
                </div>
              )}
            </div>
            {!caseData.valuator_id && userRole !== 'field_agent' && ['submitted', 'field_visit_done'].includes(caseData.status) && (
              <div className="mt-4">
                <TakeCaseButton caseId={caseData.id} />
              </div>
            )}
          </div>

          <div className="bg-surface rounded-xl border border-border-base p-5 shadow-sm">
            <h2 className="text-base font-semibold text-on-surface mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-dark"/> Location Verification
            </h2>
            {locationData ? (
              <div className="bg-surface-container-low p-6 rounded-xl border border-border-base/50 flex gap-4 items-start">
                <div className="p-3 bg-primary/10 rounded-xl shrink-0 mt-1">
                  <MapPin className="w-6 h-6 text-brand-dark" />
                </div>
                <div>
                  <p className="font-medium text-sm text-on-surface mb-2">{locationData.address_from_gps}</p>
                  <div className="flex gap-4">
                     <p className="text-sm font-mono bg-surface-dim px-3 py-1 rounded-lg">Lat: {locationData.latitude}</p>
                     <p className="text-sm font-mono bg-surface-dim px-3 py-1 rounded-lg">Lng: {locationData.longitude}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface-hover p-5 rounded-xl text-center border border-dashed border-outline-variant">
                <p className="text-on-surface-variant font-bold">Location not captured yet.</p>
              </div>
            )}
          </div>

          <div className="bg-surface rounded-xl border border-border-base p-5 shadow-sm">
            <h2 className="text-base font-semibold text-on-surface mb-6 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-brand-dark"/> Field Data Review
            </h2>
            {reviewEntries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-low p-6 rounded-xl border border-border-base/50">
                {reviewEntries.map(([key, val]) => (
                  <div key={key} className="border-b border-border-base/30 pb-3 last:border-0 md:last:border-0">
                    <p className="text-xs text-on-surface-variant font-bold mb-1 uppercase tracking-wider">
                      {key.replaceAll('_', ' ')}
                    </p>
                    <div className="font-semibold text-base text-on-surface break-words">
                      {key === 'floor_wise_area' && Array.isArray(val) ? (
                        <div className="mt-2 space-y-2">
                          {val.map((floor: any, i: number) => (
                            <div key={i} className="flex flex-wrap gap-2 justify-between items-center bg-surface-hover p-2.5 rounded-lg border border-border-base/50 text-sm">
                              <span className="font-bold text-brand-dark">{floor.floor || `Floor ${i+1}`}</span>
                              <div className="flex gap-3 text-sm">
                                {floor.slabArea ? <span>Slab: {floor.slabArea}</span> : <span className="text-on-surface-variant">Slab: -</span>}
                                {floor.plinthArea ? <span>Plinth: {floor.plinthArea}</span> : <span className="text-on-surface-variant">Plinth: -</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : typeof val === 'object' ? (
                        JSON.stringify(val)
                      ) : (
                        String(val)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface-hover p-5 rounded-xl text-center border border-dashed border-outline-variant">
                <p className="text-on-surface-variant font-bold">Data review not completed yet by field agent.</p>
              </div>
            )}
          </div>

        </div>
        
        {/* Right Column - Media & Progress */}
        <div className="lg:col-span-4 space-y-5">
          
          <div className="bg-surface rounded-xl border border-border-base p-5 shadow-sm">
            <h2 className="text-base font-semibold text-on-surface mb-6">Workflow Progress</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-border-base/50">
                <div className="flex items-center gap-3">
                  {isLocCompleted ? <CheckCircle2 className="w-6 h-6 text-success"/> : <Circle className="w-6 h-6 text-muted"/>}
                  <span className="font-bold">Location Verification</span>
                </div>
                {isLocCompleted ? (
                  <span className="px-3 py-1 bg-success-bg text-success rounded-lg text-xs font-bold uppercase tracking-wide">Done</span>
                ) : (
                  <span className="px-3 py-1 bg-warning-bg text-warning rounded-lg text-xs font-bold uppercase tracking-wide">Pending</span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-border-base/50">
                <div className="flex items-center gap-3">
                  {isDocCompleted ? <CheckCircle2 className="w-6 h-6 text-success"/> : <Circle className="w-6 h-6 text-muted"/>}
                  <span className="font-bold">Documents Upload</span>
                </div>
                {isDocCompleted ? (
                  <span className="px-3 py-1 bg-success-bg text-success rounded-lg text-xs font-bold uppercase tracking-wide">Done</span>
                ) : (
                  <span className="px-3 py-1 bg-warning-bg text-warning rounded-lg text-xs font-bold uppercase tracking-wide">Pending</span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-border-base/50">
                <div className="flex items-center gap-3">
                  {isPhotoCompleted ? <CheckCircle2 className="w-6 h-6 text-success"/> : <Circle className="w-6 h-6 text-muted"/>}
                  <span className="font-bold">Photo Evidence</span>
                </div>
                {isPhotoCompleted ? (
                  <span className="px-3 py-1 bg-success-bg text-success rounded-lg text-xs font-bold uppercase tracking-wide">Done</span>
                ) : (
                  <span className="px-3 py-1 bg-warning-bg text-warning rounded-lg text-xs font-bold uppercase tracking-wide">Pending</span>
                )}
              </div>


            </div>
          </div>

          <div className="bg-primary text-on-primary rounded-xl p-5 shadow-md relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             <Camera className="w-8 h-8 mb-4 opacity-80"/>
             <h3 className="font-headline-sm text-2xl font-bold mb-2">Media Gallery</h3>
             <p className="text-white/80 font-medium mb-6">Review all captured photos and uploaded documents.</p>
             <Link 
               href={`/dashboard/cases/${id}/photos`}
               className="w-full py-3 bg-white text-blue-800 font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-sm flex items-center justify-center"
             >
               Open Gallery View
             </Link>
          </div>

        </div>
      </div>
    </>
  )
}
