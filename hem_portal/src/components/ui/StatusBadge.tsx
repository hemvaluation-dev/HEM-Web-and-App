import { caseStage } from '@/lib/cases/status'

export default function StatusBadge({ status }: { status?: string | null }) {
  const label = caseStage(status)
  const color = label === 'Completed' ? 'text-success bg-success/10' : label === 'In review' ? 'text-brand-dark bg-primary/10' : label === 'Inspection' ? 'text-warning bg-warning/10' : 'text-muted bg-paper-2'
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap ${color}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{label}</span>
}
