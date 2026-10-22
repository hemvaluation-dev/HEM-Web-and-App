'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect, useTransition } from 'react'
import { INDIAN_STATES } from '@/utils/constants'
import { MapPin } from 'lucide-react'
import MultiSelectFilter from './MultiSelectFilter'

export default function StateFilter({ className = '', multiple = false }: { className?: string; multiple?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selectedState, setSelectedState] = useState(searchParams?.get('state') || '')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setSelectedState(searchParams?.get('state') || '')
  }, [searchParams])

  const handleStateChange = (value: string) => {
    setSelectedState(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || '')
      if (value.trim()) {
        params.set('state', value.trim())
      } else {
        params.delete('state')
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  if (multiple) return <MultiSelectFilter name="state" label="States" options={INDIAN_STATES.map(id => ({ id, label: id }))} />
  return (
    <div className={`relative flex items-center bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl overflow-hidden shadow-sm ${className}`}>
      <div className="pl-3 pr-2 py-2 border-r border-line dark:border-line text-muted dark:text-muted bg-surface-container-low dark:bg-surface-hover">
        <MapPin className="w-4 h-4" />
      </div>
      <select
        aria-label="Filter by state"
        disabled={isPending}
        value={selectedState}
        onChange={(e) => handleStateChange(e.target.value)}
        className="w-full bg-transparent pl-3 pr-8 py-2 text-xs text-ink dark:text-white focus:outline-none appearance-none font-medium cursor-pointer"
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238E95A5' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
      >
        <option value="">All States</option>
        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  )
}
