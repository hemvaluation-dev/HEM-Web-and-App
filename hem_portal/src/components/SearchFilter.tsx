'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

export default function SearchFilter({ 
  placeholder = 'Search...', 
  paramName = 'search', 
  className = '' 
}: { 
  placeholder?: string; 
  paramName?: string; 
  className?: string;
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams?.get(paramName) || '')
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchParamsRef = useRef(searchParams)

  useEffect(() => {
    searchParamsRef.current = searchParams
  }, [searchParams])

  useEffect(() => {
    const currentParam = searchParams?.get(paramName) || ''
    setQuery(prev => prev.trim() !== currentParam ? currentParam : prev)
  }, [searchParams, paramName])

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }, [])

  const handleSearch = (value: string) => {
    setQuery(value)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current?.toString() || '')
      if (value.trim()) {
        params.set(paramName, value.trim())
      } else {
        params.delete(paramName)
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, 300)
  }

  return (
    <div className={`relative max-w-sm w-full sm:w-64 ${className}`}>
      <Search className="w-4 h-4 text-muted dark:text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full pl-10 pr-8 py-2 bg-paper-2 dark:bg-paper-2 border border-line dark:border-line rounded-xl text-xs text-ink dark:text-white focus:outline-none focus:border-primary dark:focus:border-primary transition-colors shadow-sm"
      />
      {query && (
        <button
          onClick={() => handleSearch('')}
          type="button"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink dark:hover:text-white transition-colors p-0.5"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
