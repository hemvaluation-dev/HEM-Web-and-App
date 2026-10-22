'use client'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import { assignCase, assignReviewer, assignValuator } from '@/app/(main)/admin/actions'

export default function AssignmentForm({ caseId, kind, current, options }: { caseId: string; kind: 'agent' | 'valuator' | 'reviewer'; current?: string; options: { id: string; full_name?: string; email?: string }[] }) {
  const router = useRouter()
  const [result, action, pending] = useActionState(async (_: { error?: string; success?: boolean } | null, form: FormData): Promise<{ error?: string; success?: boolean }> => {
    const id = String(form.get('assignee') || '')
    if (!id) return { error: 'Select a team member.' }
    try {
      const result = await ({ agent: assignCase, valuator: assignValuator, reviewer: assignReviewer }[kind])(caseId, id)
      if (!result.error) router.refresh()
      return result
    }
    catch { return { error: 'Assignment could not be saved. Try again.' } }
  }, null)
  return <form action={action} className="space-y-2"><div className="flex gap-2"><select aria-label={`Assign ${kind}`} name="assignee" defaultValue={current || ''} required className="min-w-0 flex-1 bg-surface border border-line rounded-lg text-xs px-2"><option value="" disabled>Select {kind}</option>{options.map(option => <option key={option.id} value={option.id}>{option.full_name || option.email}</option>)}</select><button disabled={pending} aria-label={`Save ${kind} assignment`} className="ui-button !p-2">{pending ? <Loader2 className="animate-spin" size={15} /> : <Check size={15} />}</button></div>{result?.error && <p role="alert" className="text-xs text-danger">{result.error}</p>}{result?.success && <p role="status" className="text-xs text-success">Assignment saved.</p>}</form>
}
