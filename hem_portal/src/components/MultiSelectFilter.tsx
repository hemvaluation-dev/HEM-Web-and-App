'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { filterValues } from '@/lib/cases/filters'

export default function MultiSelectFilter({ name, label, options }: { name: string; label: string; options: { id: string; label: string }[] }) {
  const params = useSearchParams(), pathname = usePathname(), router = useRouter()
  const value = params.get(name) || ''
  const [draft, setDraft] = useState({ value, selected: filterValues(value) })
  const selected = draft.value === value ? draft.selected : filterValues(value)
  const setSelected = (next: string[] | ((previous: string[]) => string[])) => setDraft({ value, selected: typeof next === 'function' ? next(selected) : next })
  const [pending, startTransition] = useTransition()
  const details = useRef<HTMLDetailsElement>(null)
  function apply() {
    const next = new URLSearchParams(params.toString())
    if (selected.length) next.set(name, selected.join(',')); else next.delete(name)
    next.delete('page')
    startTransition(() => router.replace(`${pathname}?${next}`, { scroll: false }))
    if (details.current) details.current.open = false
  }
  return <details ref={details} className="relative" onKeyDown={e => { if (e.key === 'Escape' && details.current) details.current.open = false }}>
    <summary className="ui-button text-xs list-none">{label}{filterValues(value).length ? ` (${filterValues(value).length})` : ': All'} <span aria-hidden>▾</span></summary>
    <div className="absolute z-40 mt-2 w-64 rounded-xl border border-line bg-surface text-ink p-3 shadow-xl">
      <fieldset disabled={pending}><legend className="text-sm font-semibold mb-2">{label}</legend>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {options.map(option => <label key={option.id} className="flex gap-2 items-center p-2 rounded hover:bg-paper-2 text-xs cursor-pointer">
            <input type="checkbox" checked={selected.includes(option.id)} onChange={e => setSelected(previous => e.target.checked ? [...previous, option.id] : previous.filter(id => id !== option.id))} />{option.label}
          </label>)}
          {!options.length && <p className="text-xs text-muted">No options available.</p>}
        </div>
        <div className="flex justify-between mt-3"><button type="button" className="ui-button text-xs" onClick={() => setSelected([])}>Clear</button><button type="button" className="ui-button ui-button-primary text-xs" onClick={apply}>Apply</button></div>
      </fieldset>
    </div>
  </details>
}
