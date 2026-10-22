import { getCase } from '@/lib/cases/data'
import EditableDataReview from './EditableDataReview'

export default async function DataReviewTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const record = await getCase(id)
  return <EditableDataReview key={`${id}:${record.revision}`} caseId={id} revision={record.revision} status={record.status} initialData={record.extracted_data || {}} />
}
