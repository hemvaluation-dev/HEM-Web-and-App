import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { authenticate } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await authenticate().catch(() => redirect('/login'))
  const userData = profile

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Sidebar role={profile.role || 'field_agent'} level={userData?.level || undefined} department={userData?.department || undefined} />
      <div className="app-frame flex-1 lg:ml-[248px] flex flex-col min-w-0">
        <Header profile={profile} />
        <main id="main-content" tabIndex={-1} className="app-content flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
