import { getAllUsers } from '../actions'
import { getAllLeaves } from '../leaves/actions'
import { getAllAttendance } from '../attendance/actions'
import { createClient } from '@/utils/supabase/server'
import { Users, Calendar, Clock, ChevronRight, Mail, Phone, ShieldCheck, Download } from 'lucide-react'
import LeaveActionButtons from '../leaves/LeaveActionButtons'
import CreateUserModal from '../users/CreateUserModal'
import EditUserModal from '../users/EditUserModal'
import SearchFilter from '@/components/SearchFilter'
import StateFilter from '@/components/StateFilter'

export const dynamic = 'force-dynamic'

export default async function AdminTeamPage({ searchParams }: { searchParams?: Promise<{ search?: string; state?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let isOwner = false
  if (user) {
    const { data: uData } = await supabase.from('users').select('role').eq('id', user.id).single()
    isOwner = uData?.role === 'owner'
  }

  const params = await searchParams
  const searchQuery = params?.search?.toLowerCase().trim() || ''
  const stateFilter = params?.state || ''

  const allUsers = await getAllUsers() || []
  // Filter out owner account as requested and apply search/state filter
  const users = allUsers.filter((u: any) => {
    if (u.role === 'owner') return false
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
  const leaves = await getAllLeaves()
  const allAttendance = await getAllAttendance()

  // Realtime attendance for today or latest
  const todayStr = new Date().toISOString().split('T')[0]
  const attendance = allAttendance.filter((a: any) => a.date === todayStr || !a.date).slice(0, 10)
  const displayAttendance = attendance.length > 0 ? attendance : allAttendance.slice(0, 5)

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted dark:text-muted mb-1">
            <span>Administration</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink dark:text-white">Team Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink dark:text-white tracking-tight">Team Hub</h1>
          <p className="text-muted dark:text-muted text-xs font-medium mt-1">
            Comprehensive team directory, role management, shift attendance, and leave tracking
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <StateFilter />
          <SearchFilter placeholder="Search member, email, dept..." />
          {isOwner && (
            <>
              <a href="/api/export-team" className="px-4 py-2 text-xs font-semibold rounded-xl bg-paper-2 dark:bg-paper-2 hover:bg-surface-hover dark:hover:bg-surface-hover text-ink dark:text-white border border-line dark:border-line transition-all flex items-center gap-2 shadow-sm">
                <Download className="w-3.5 h-3.5" />
                <span>Export Team</span>
              </a>
              <a href="/api/export-leaves" className="px-4 py-2 text-xs font-semibold rounded-xl bg-paper-2 dark:bg-paper-2 hover:bg-surface-hover dark:hover:bg-surface-hover text-ink dark:text-white border border-line dark:border-line transition-all flex items-center gap-2 shadow-sm">
                <Download className="w-3.5 h-3.5" />
                <span>Export Leaves</span>
              </a>
            </>
          )}
          <CreateUserModal managers={potentialManagers} />
        </div>
      </div>

      {/* Full-Width Section: User Directory & Management (All Users except Owner) */}
      <div className="bg-surface dark:bg-surface rounded-xl border border-line dark:border-line shadow-sm overflow-hidden">
        <div className="p-6 border-b border-line dark:border-line flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-dark dark:text-brand-dark" />
              <span>Team Directory & Management</span>
            </h2>
            <p className="text-xs text-muted dark:text-muted mt-0.5">
              Manage staff accounts, department assignments, and system access levels
            </p>
          </div>
          <span className="text-xs font-bold text-brand-dark dark:text-brand-dark bg-primary/10 dark:bg-primary/15 px-3 py-1 rounded-full border border-primary/20">
            {users.length} Active Members
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-line dark:border-line text-[11px] font-bold text-muted dark:text-muted uppercase tracking-wider">
                <th className="py-3.5 px-6">Member / Contact</th>
                <th className="py-3.5 px-6">Role & Level</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Account Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-line text-xs">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-surface-hover dark:hover:bg-surface-hover transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-primary/15 dark:bg-primary/15 text-brand-dark dark:text-brand-dark flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                        {u.full_name ? u.full_name[0].toUpperCase() : u.email[0].toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-ink dark:text-white text-sm truncate">{u.full_name || 'Unnamed Member'}</p>
                        <div className="flex items-center gap-1.5 text-muted dark:text-muted text-[11px] mt-0.5 truncate">
                          <Mail className="w-3 h-3 shrink-0" /> {u.email}
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-muted dark:text-muted text-[11px] mt-0.5 truncate">
                            <Phone className="w-3 h-3 shrink-0" /> {u.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-primary/15 text-brand-dark dark:text-brand-dark rounded-lg uppercase tracking-wider border border-primary/30">
                        {u.role.replace('_', ' ')}
                      </span>
                      {u.level && u.level !== 'All' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-paper-2 dark:bg-paper-2 text-ink dark:text-white border border-line dark:border-line rounded-md uppercase tracking-wider">
                          {u.level}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-muted dark:text-muted">
                    {u.department || 'General Operations'}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      u.is_active !== false ? 'bg-success/10 text-success dark:text-brand-dark border border-success/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'
                    }`}>
                      {u.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <EditUserModal user={u} managers={potentialManagers} />
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted dark:text-muted font-medium">
                    No team members cataloged yet. Click Add User above to invite staff.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 2: Attendance & Leaves Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Field Attendance */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-line dark:border-line p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-dark dark:text-brand-dark" />
              <span>Today's Field Attendance</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line dark:border-line">
                    <th className="py-3 text-xs font-semibold text-muted dark:text-muted uppercase tracking-wider">Officer</th>
                    <th className="py-3 text-xs font-semibold text-muted dark:text-muted uppercase tracking-wider">Status</th>
                    <th className="py-3 text-xs font-semibold text-muted dark:text-muted uppercase tracking-wider">Clock In</th>
                    <th className="py-3 text-xs font-semibold text-muted dark:text-muted uppercase tracking-wider">Clock Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line dark:divide-line">
                  {displayAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs font-medium text-muted dark:text-muted">
                        No attendance records logged today.
                      </td>
                    </tr>
                  ) : (
                    displayAttendance.map((a: any) => (
                      <tr key={a.id} className="hover:bg-surface-hover dark:hover:bg-surface-hover transition-colors">
                        <td className="py-4 text-xs font-bold text-ink dark:text-white">{a.user?.full_name || a.user?.email || a.user_id?.slice(0, 8)}</td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${!a.check_out_time ? 'bg-success/10 text-success dark:text-brand-dark border border-success/30' : 'bg-paper-2 dark:bg-paper-2 text-muted dark:text-muted border border-line dark:border-line'}`}>
                            {!a.check_out_time ? 'ON SHIFT' : 'COMPLETED'}
                          </span>
                        </td>
                        <td className="py-4 text-xs font-bold text-ink dark:text-white">{a.check_in_time ? new Date(a.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                        <td className="py-4 text-xs font-bold text-ink dark:text-white">{a.check_out_time ? new Date(a.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-warning font-semibold">Active Now</span>}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Leave Requests */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-line dark:border-line p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-warning" />
              <span>Leave Requests</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line dark:border-line">
                    <th className="py-3 text-xs font-semibold text-muted dark:text-muted uppercase tracking-wider">Member</th>
                    <th className="py-3 text-xs font-semibold text-muted dark:text-muted uppercase tracking-wider">Date</th>
                    <th className="py-3 text-xs font-semibold text-muted dark:text-muted uppercase tracking-wider">Reason</th>
                    <th className="py-3 text-xs font-semibold text-muted dark:text-muted uppercase tracking-wider">Status</th>
                    <th className="py-3 text-xs font-semibold text-muted dark:text-muted uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line dark:divide-line">
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs font-medium text-muted dark:text-muted">
                        No pending leave requests.
                      </td>
                    </tr>
                  ) : (
                    leaves.map((l: any) => (
                      <tr key={l.id} className="hover:bg-surface-hover dark:hover:bg-surface-hover transition-colors">
                        <td className="py-4 text-xs font-bold text-ink dark:text-white">{l.user?.email || 'Unknown'}</td>
                        <td className="py-4 text-xs font-medium text-muted dark:text-muted">{new Date(l.start_date).toLocaleDateString()}</td>
                        <td className="py-4 text-xs font-medium text-muted dark:text-muted max-w-[150px] truncate" title={l.reason}>{l.reason}</td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${l.status === 'approved' ? 'bg-success/10 text-success dark:text-brand-dark border border-success/30' : 'bg-warning/10 text-warning border border-warning/30'}`}>
                            {l.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <LeaveActionButtons leaveId={l.id} currentStatus={l.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
