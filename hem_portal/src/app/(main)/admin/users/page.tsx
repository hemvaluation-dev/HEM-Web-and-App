import { getAllUsers } from '../actions'
import { Users, Mail, Phone, MapPin, Building, ShieldCheck, Plus, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import CreateUserModal from './CreateUserModal'
import EditUserModal from './EditUserModal'
import SearchFilter from '@/components/SearchFilter'
import StateFilter from '@/components/StateFilter'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UsersPage({ searchParams }: { searchParams?: Promise<{ search?: string; state?: string }> }) {
  const params = await searchParams
  const searchQuery = params?.search?.toLowerCase().trim() || ''
  const stateFilter = params?.state || ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'owner') {
    return (
      <div className="bg-warning-bg rounded-xl border border-amber-200 p-12 text-center flex flex-col items-center shadow-sm">
        <ShieldAlert className="w-12 h-12 text-warning mb-4" />
        <h3 className="text-xl font-bold text-warning mb-2">Access Restricted</h3>
        <p className="text-warning">Only Senior Management can access the User Management dashboard.</p>
      </div>
    )
  }

  const allUsers = await getAllUsers() || []
  const users = allUsers.filter((u: any) => {
    if (stateFilter && u.state !== stateFilter) return false
    if (!searchQuery) return true
    return (
      u.full_name?.toLowerCase().includes(searchQuery) ||
      u.email?.toLowerCase().includes(searchQuery) ||
      u.role?.toLowerCase().includes(searchQuery) ||
      u.level?.toLowerCase().includes(searchQuery) ||
      u.department?.toLowerCase().includes(searchQuery)
    )
  })
  const potentialManagers = allUsers.filter((u: any) => u.level === 'L4' || u.level === 'L5' || u.role === 'owner' || u.role === 'lead' || u.role === 'manager' || u.department === 'Management')

  return (
    <div className="space-y-6 text-on-surface">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight mb-2">User Management</h1>
          <p className="text-on-surface-variant">Manage staff, agents, and system access.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <StateFilter />
          <SearchFilter placeholder="Search user, email, role..." />
          <CreateUserModal managers={potentialManagers} />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border-base shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-border-base bg-surface-container-low flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-dark" />
            All System Users
          </h3>
          <span className="text-caption font-bold text-brand-dark bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            {users.length} Total Users
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-base text-caption font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low">
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Role & Level</th>
                <th className="px-8 py-4">Department</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base font-body-sm">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-surface-hover transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-brand-dark flex items-center justify-center font-bold text-sm border border-primary/20">
                        {u.full_name ? u.full_name[0].toUpperCase() : u.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-body-md">{u.full_name || 'No Name'}</p>
                        <p className="text-on-surface-variant text-caption flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {u.email}
                        </p>
                        {u.phone && (
                          <p className="text-on-surface-variant text-caption flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {u.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-caption font-bold ${
                        u.role === 'owner' ? 'bg-primary/10 text-brand-dark' : 'bg-surface-container-low text-on-surface-variant border border-border-base'
                      }`}>
                        {u.role === 'owner' && <ShieldCheck className="w-3 h-3" />}
                        {u.role === 'owner' ? 'SENIOR MANAGEMENT' : u.role.replace('_', ' ').toUpperCase()}
                      </span>
                      {u.level && u.level !== 'All' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-primary text-white">
                          {u.level}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 font-body-md text-body-md text-on-surface-variant">
                    {u.department || 'General'}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-caption font-bold ${
                      u.is_active !== false ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-danger-text'
                    }`}>
                      {u.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <EditUserModal user={u} managers={potentialManagers} />
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-on-surface-variant font-body-md">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
