'use client'

import { LayoutDashboard, Users, Settings, Building2, LogOut, CalendarDays, Fingerprint, ChartNoAxesCombined, UserCheck, Menu, X, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut } from '@/app/(main)/dashboard/actions'
import { permissions } from '@/lib/auth/permissions'
import HemLogo from './HemLogo'

export default function Sidebar({ role, level, department }: { role: string; level?: string; department?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { owner, administration } = permissions({ role, level, department })
  const sections = [
    { title: 'Workspace', items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: administration ? 'Case management' : 'My cases', href: administration ? '/admin/cases' : '/dashboard/cases', icon: Building2 },
      ...(administration ? [{ name: 'Analytics', href: '/admin/dashboard', icon: ChartNoAxesCombined }] : []),
    ] },
    { title: 'People & operations', items: [
      ...(administration ? [
        { name: 'Team directory', href: '/admin/team', icon: UserCheck },
        { name: 'Attendance', href: '/admin/attendance', icon: Fingerprint },
      ] : []),
      { name: 'Leave requests', href: administration ? '/admin/leaves' : '/dashboard/leaves', icon: CalendarDays },
      ...(owner ? [{ name: 'User access', href: '/admin/users', icon: Users }] : []),
    ] },
  ]
  const active = (href: string) => href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(href + '/')
  return <>
    <div className="fixed top-4 left-4 z-[60] lg:hidden"><button type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="workspace-navigation" onClick={() => setOpen(!open)} className="ui-button !p-2"><Menu size={20} /></button></div>
    {open && <button aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />}
    <aside id="workspace-navigation" className={`app-sidebar fixed inset-y-0 left-0 z-50 w-[248px] flex flex-col bg-surface border-r border-line transition-transform lg:translate-x-0 ${open ? 'translate-x-0 visible' : '-translate-x-full invisible lg:visible'}`}>
      <div className="h-[76px] px-6 flex items-center gap-3 border-b border-line">
        <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3">
          <span className="w-10 h-10 shrink-0 rounded-lg bg-paper-2 border border-line grid place-items-center p-1"><HemLogo className="w-9 h-9" /></span>
          <span><strong className="block text-sm whitespace-nowrap tracking-tight">HEM <span className="font-normal text-muted">Associates</span></strong><span className="text-[10px] uppercase tracking-[.1em] text-muted">Valuation workspace</span></span>
        </Link>
        <button onClick={() => setOpen(false)} aria-label="Close navigation" className="lg:hidden"><X size={18} /></button>
      </div>
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto p-4 space-y-7 mt-4">
        {sections.map(section => <div key={section.title}>
          <p className="ui-kicker px-3 mb-3">{section.title}</p>
          <div className="space-y-1">{section.items.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={active(item.href) ? 'page' : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors ${active(item.href) ? 'bg-primary/10 text-brand-dark font-semibold' : 'text-muted hover:bg-paper-2 hover:text-ink'}`}><item.icon size={18} strokeWidth={1.7} />{item.name}</Link>)}</div>
        </div>)}
      </nav>
      <div className="mx-4 mb-4 rounded-lg bg-paper-2 border border-line p-4">
        <p className="text-xs font-semibold">Your workspace, connected.</p>
        <p className="text-xs text-muted leading-relaxed mt-1">Manage field work and reporting in one place.</p>
        <Link href="/settings" onClick={() => setOpen(false)} className="inline-flex gap-2 items-center text-xs text-brand-dark font-semibold mt-3">Workspace settings <ArrowUpRight size={13} /></Link>
      </div>
      <div className="p-4 border-t border-line space-y-1">
        <Link href="/settings" onClick={() => setOpen(false)} aria-current={active('/settings') ? 'page' : undefined} className="flex gap-3 px-3 py-2 text-muted hover:text-ink text-[13px]"><Settings size={18} />Settings</Link>
        <form action={signOut}><button className="flex w-full gap-3 px-3 py-2 text-muted hover:text-danger text-[13px]"><LogOut size={18} />Sign out</button></form>
      </div>
    </aside>
  </>
}
