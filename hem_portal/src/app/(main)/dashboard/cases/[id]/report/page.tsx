import { signFiles } from '@/lib/reports/storage'
import { createClient } from '@/utils/supabase/server'
import { getCase } from '@/lib/cases/data'
import ReportGenerator from './ReportGenerator'

export default async function ReportTab({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const [caseData, photoResult, locationResult] = await Promise.all([
    getCase(id),
    supabase.from('case_photos').select('*').eq('case_id', id).order('created_at'),
    supabase.from('case_location').select('*').eq('case_id', id).maybeSingle(),
  ])
  const photos = await signFiles(supabase, photoResult.data || [], 'photos')
  const locationData = locationResult.data
  const mergedData = caseData.extracted_data || {}

  const { data: reports } = await supabase.from('case_reports').select('id, template_id, created_at').eq('case_id', id).order('created_at', { ascending: false })
  return (
    <>
    <section className="ui-panel p-5 mb-5"><h2 className="font-semibold">Saved reports</h2><div className="mt-3 space-y-2">{reports?.map(report => <a key={report.id} href={`/api/reports/${report.id}`} className="block text-sm text-brand-dark">{report.template_id} · {new Date(report.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} · Download</a>)}{!reports?.length && <p className="text-sm text-muted">Generate a report from saved field data or a submitted dossier.</p>}</div></section>
    {['in_progress', 'field_visit_done', 'report_drafted', 'submitted'].includes(caseData.status) ? (
    <ReportGenerator
      key={`${id}:${caseData.revision}`}
      caseId={id}
      caseData={caseData}
      mergedData={mergedData}
      photos={photos || []}
      locationData={locationData}
    />
    ) : <p className="ui-panel p-5 text-sm">Report generation is available from saved field data during inspection, and after field submission until senior review begins.</p>}
    </>
  )
}
