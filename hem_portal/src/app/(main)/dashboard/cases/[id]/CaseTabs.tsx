'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, MapPin, Camera, ClipboardList, FileCheck2, Info, ListChecks, Video } from 'lucide-react'

export default function CaseTabs({ caseId }: { caseId: string }) {
  const pathname = usePathname()

  const tabs = [
    { name: 'Summary', href: `/dashboard/cases/${caseId}`, icon: Info },
    { name: 'Location', href: `/dashboard/cases/${caseId}/location`, icon: MapPin },
    { name: 'Documents', href: `/dashboard/cases/${caseId}/documents`, icon: FileText },
    { name: 'Media', href: `/dashboard/cases/${caseId}/media`, icon: Video },
    { name: 'Photos', href: `/dashboard/cases/${caseId}/photos`, icon: Camera },
    { name: 'Data review', href: `/dashboard/cases/${caseId}/data-review`, icon: ListChecks },
    { name: 'Report', href: `/dashboard/cases/${caseId}/report`, icon: FileCheck2 },
  ]

  return (
    <nav aria-label="Case sections" className="bg-surface rounded-xl border border-border-base p-2 flex items-center gap-2 overflow-x-auto shadow-sm transition-colors duration-300">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.name}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${isActive
                ? 'bg-primary/10 text-brand-dark font-bold shadow-sm'
                : 'text-on-surface hover:bg-surface-hover'
              }`}
          >
            <tab.icon className={`w-4 h-4 ${isActive ? 'text-brand-dark' : 'text-on-surface-variant'}`} />
            {tab.name}
          </Link>
        )
      })}
    </nav>
  )
}
