import { ShieldAlert } from 'lucide-react'
import { authenticate } from '@/lib/auth/session'
import { permissions } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await authenticate().catch(() => redirect('/login'))
  const hasAdminAccess = permissions(profile).administration

  if (!hasAdminAccess) {
    return (
      <div className="bg-warning-bg rounded-xl border border-amber-200 p-12 text-center flex flex-col items-center shadow-sm">
        <ShieldAlert className="w-12 h-12 text-warning mb-4" />
        <h3 className="text-xl font-bold text-warning mb-2">Access Restricted</h3>
        <p className="text-warning">You do not have Administrator privileges to view this area.</p>
      </div>
    )
  }

  return <>{children}</>
}
