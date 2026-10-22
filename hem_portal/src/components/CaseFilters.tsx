'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import MultiSelectFilter from './MultiSelectFilter'

type Option = { id: string; label: string }
export default function CaseFilters({ agents = [], creators = [], banks = [], months = [], className = '' }: {
  agents?: Option[]; creators?: Option[]; banks?: Option[]; months?: Option[]; className?: string
}) {
  const router = useRouter(), pathname = usePathname(), params = useSearchParams()
  const [pending, startTransition] = useTransition()
  function dateChanged(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    startTransition(() => router.replace(`${pathname}?${next}`, { scroll: false }))
  }
  return <div className={`flex flex-wrap items-center gap-2 ${className}`}>
    {!!agents.length && <MultiSelectFilter name="agent" label="Field persons" options={agents} />}
    {!!creators.length && <MultiSelectFilter name="assigner" label="Assigners" options={creators} />}
    {!!banks.length && <MultiSelectFilter name="bank" label="Institutions" options={banks} />}
    <MultiSelectFilter name="status" label="Case status" options={[{ id: 'active', label: 'Active' }, { id: 'completed', label: 'Completed' }, { id: 'unassigned', label: 'Unassigned' }]} />
    <MultiSelectFilter name="month" label="Months" options={months} />
    {['from', 'to'].map(key => <label key={key} className="ui-button text-xs gap-2">
      <span>{key === 'from' ? 'From' : 'To'}</span>
      <input type="date" aria-label={`Created ${key} date`} value={params.get(key) || ''} disabled={pending}
        onChange={e => dateChanged(key, e.target.value)} className="bg-transparent text-ink text-xs" />
    </label>)}
  </div>
}
