'use client'

import { Sun, Moon, Search, ChevronRight, WifiOff } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { permissions, type Profile } from '@/lib/auth/permissions'
import HemLogo from './HemLogo'

const subscribe = (callback: () => void) => { window.addEventListener('online', callback); window.addEventListener('offline', callback); return () => { window.removeEventListener('online', callback); window.removeEventListener('offline', callback) } }
const mountedSubscribe = () => () => {}

export default function Header({ profile }: { profile: Profile }) {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(mountedSubscribe, () => true, () => false)
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true)
  const pathname = usePathname()
  const { administration } = permissions(profile)
  const labels: Record<string, string> = { dashboard: 'Overview', admin: 'Workspace', cases: 'Cases', team: 'Team directory', users: 'User access', attendance: 'Attendance', leaves: 'Leave requests', applications: 'Applications', settings: 'Settings', location: 'Location', documents: 'Documents', photos: 'Photos', media: 'Media', 'data-review': 'Data review', report: 'Report', pending: 'Pending cases' }
  const parts = pathname.split('/').filter(Boolean)
  const last = parts.at(-1) || 'dashboard'
  const page = pathname === '/admin/dashboard' ? 'Analytics' : labels[last] || 'Case details'
  return <header className="app-header sticky top-0 z-30 h-[76px] shrink-0 flex items-center justify-between gap-4 px-5 lg:px-8 bg-surface/95 backdrop-blur border-b border-line">
    <div className="flex items-center gap-3 text-xs pl-12 lg:pl-0"><span className="lg:hidden w-7 h-7 rounded-md bg-paper-2 border border-line p-0.5"><HemLogo className="w-6 h-6" /></span><span className="hidden sm:inline text-muted">Workspace</span><ChevronRight size={13} className="hidden sm:block text-muted" /><span className="font-semibold">{page}</span></div>
    <form action={administration ? '/admin/cases' : '/dashboard/cases'} className="hidden md:flex relative max-w-xs flex-1 ml-auto"><Search size={15} className="absolute left-3 top-3 text-muted" /><input name="search" aria-label="Search cases" placeholder="Search cases by name or reference…" className="w-full bg-paper-2 border border-line rounded-lg py-2.5 pl-9 pr-3 text-xs" /></form>
    <div className="flex items-center gap-3">
      {!online && <span role="status" className="flex items-center gap-1.5 text-warning text-xs"><WifiOff size={15} />Offline</span>}
      {mounted && <button aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="p-2 text-muted hover:text-ink rounded-lg hover:bg-paper-2">{resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>}
      <span className="h-7 border-l border-line" />
      <Link href="/settings" className="flex items-center gap-2.5" aria-label="Account settings"><span className="w-9 h-9 bg-primary/10 text-brand-dark grid place-items-center rounded-full font-semibold">{(profile.full_name || profile.email || 'U').slice(0, 1).toUpperCase()}</span><span className="hidden xl:block"><span className="block text-xs font-semibold">{profile.full_name || 'My account'}</span><span className="block text-[11px] text-muted mt-0.5">{profile.department || 'HEM Associates'}{profile.level ? ` · ${profile.level}` : ''}</span></span></Link>
    </div>
  </header>
}
