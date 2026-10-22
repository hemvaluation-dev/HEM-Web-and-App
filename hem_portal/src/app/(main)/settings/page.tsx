import { createClient } from '@/utils/supabase/server'
import SettingsPageClient from './SettingsPageClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let clients: any[] = []
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data

    if (profile?.role === 'owner') {
      const { getAllClients } = await import('../admin/actions')
      clients = await getAllClients()
    }
  }

  return <SettingsPageClient profile={profile} initialClients={clients} />
}
