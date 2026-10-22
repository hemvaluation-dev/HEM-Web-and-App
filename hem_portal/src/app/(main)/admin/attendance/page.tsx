import { getAllAttendance } from './actions'
import { createClient } from '@/utils/supabase/server'
import { MapPin, Clock, Fingerprint, ChevronRight, Download, CheckCircle, Search, UserCheck, Timer, ShieldCheck, ArrowUpRight } from 'lucide-react'
import SearchFilter from '@/components/SearchFilter'
import StateFilter from '@/components/StateFilter'

export const dynamic = 'force-dynamic'

export default async function AdminAttendancePage({ searchParams }: { searchParams?: Promise<{ search?: string; state?: string }> }) {
  const params = await searchParams
  const searchQuery = params?.search?.toLowerCase().trim() || ''
  const stateFilter = params?.state || ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let isOwner = false
  if (user) {
    const { data: uData } = await supabase.from('users').select('role').eq('id', user.id).single()
    isOwner = uData?.role === 'owner'
  }

  const allAttendance = await getAllAttendance()
  let attendance = allAttendance.filter((r: any) => {
    if (stateFilter && r.user?.state !== stateFilter) return false
    
    if (!searchQuery) return true
    return (
      r.user?.full_name?.toLowerCase().includes(searchQuery) ||
      r.user?.email?.toLowerCase().includes(searchQuery) ||
      r.date?.toLowerCase().includes(searchQuery)
    )
  })

  const totalLogs = attendance.length
  const activeNow = attendance.filter((r: any) => !r.check_out_time).length
  const completedShifts = totalLogs - activeNow

  // Compute average duration of completed shifts
  let totalDurMs = 0
  let completedCount = 0
  attendance.forEach((r: any) => {
    if (r.check_in_time && r.check_out_time) {
      const ms = new Date(r.check_out_time).getTime() - new Date(r.check_in_time).getTime()
      if (ms > 0) {
        totalDurMs += ms
        completedCount++
      }
    }
  })
  const avgHours = completedCount > 0 ? (totalDurMs / completedCount / (1000 * 60 * 60)).toFixed(1) : '8.0'

  return (
    <div className="space-y-6 pt-2 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted dark:text-muted mb-1">
            <span>Operations</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink dark:text-white">Field Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink dark:text-white tracking-tight flex items-center gap-3">
            Time & Attendance Suite
            <span className="text-xs bg-paper-2 dark:bg-paper-2 border border-line dark:border-line text-muted dark:text-muted px-2.5 py-1 rounded-lg font-semibold">
              Attendance records
            </span>
          </h1>
        </div>
        {isOwner && (
          <a href="/api/export-attendance" className="px-4 py-2 text-xs font-semibold rounded-xl bg-paper-2 dark:bg-paper-2 hover:bg-surface-hover dark:hover:bg-surface-hover text-ink dark:text-white border border-line dark:border-line transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm">
            <Download className="w-3.5 h-3.5" />
            <span>Export Timesheets</span>
          </a>
        )}
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface dark:bg-surface p-5 rounded-xl border border-line dark:border-line shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted dark:text-muted">Total Shift Logs</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-ink dark:text-white">{totalLogs}</span>
            <span className="text-xs font-semibold text-success dark:text-brand-dark bg-success/10 dark:bg-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> All Time
            </span>
          </div>
        </div>

        <div className="bg-surface dark:bg-surface p-5 rounded-xl border border-line dark:border-line shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted dark:text-muted">Active On Shift Now</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-ink dark:text-white">{activeNow}</span>
            <span className="text-xs font-semibold text-success dark:text-brand-dark flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success-solid dark:bg-primary animate-pulse" /> Live Field Officers
            </span>
          </div>
        </div>

        <div className="bg-surface dark:bg-surface p-5 rounded-xl border border-line dark:border-line shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted dark:text-muted">Completed Shifts</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-ink dark:text-white">{completedShifts}</span>
            <span className="text-xs font-semibold text-muted dark:text-muted flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-success dark:text-brand-dark" /> Checked Out
            </span>
          </div>
        </div>

        <div className="bg-surface dark:bg-surface p-5 rounded-xl border border-line dark:border-line shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted dark:text-muted">Avg Shift Duration</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-ink dark:text-white">{avgHours}h</span>
            <span className="text-xs font-semibold text-muted dark:text-muted flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" /> Standard 8h
            </span>
          </div>
        </div>
      </div>
      <div className="bg-surface dark:bg-surface rounded-xl border border-line dark:border-line shadow-sm overflow-hidden">
        {/* Table Search Header */}
        <div className="p-4 border-b border-line dark:border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <StateFilter />
            <SearchFilter placeholder="Filter by officer name or email..." />
          </div>
          <span className="text-xs font-medium text-muted dark:text-muted">
            Showing {attendance.length} attendance records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-line dark:border-line text-[11px] font-semibold text-muted dark:text-muted">
                <th className="py-3.5 px-6 font-semibold">Shift Date</th>
                <th className="py-3.5 px-6 font-semibold">Field Officer</th>
                <th className="py-3.5 px-6 font-semibold">Check-In Time</th>
                <th className="py-3.5 px-6 font-semibold">Check-Out Time</th>
                <th className="py-3.5 px-6 font-semibold">Total Duration</th>
                <th className="py-3.5 px-6 font-semibold">GPS Coordinate</th>
                <th className="py-3.5 px-6 font-semibold text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-line text-xs">
              {attendance.map((record: any) => {
                const checkInDt = record.check_in_time ? new Date(record.check_in_time) : null
                const checkOutDt = record.check_out_time ? new Date(record.check_out_time) : null
                
                let durText = 'N/A'
                if (checkInDt) {
                  const endMs = checkOutDt ? checkOutDt.getTime() : new Date().getTime()
                  const diffMin = Math.max(Math.floor((endMs - checkInDt.getTime()) / (1000 * 60)), 0)
                  const hrs = Math.floor(diffMin / 60)
                  const mins = diffMin % 60
                  durText = `${hrs}h ${mins}m`
                }

                return (
                  <tr key={record.id} className="hover:bg-surface-hover dark:hover:bg-surface-hover transition-colors">
                    <td className="py-4 px-6 font-bold text-ink dark:text-white">
                      {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/15 dark:bg-primary/15 text-brand-dark dark:text-brand-dark font-bold text-xs flex items-center justify-center">
                          {(record.user?.full_name?.[0] || record.user?.email?.[0] || 'O').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-ink dark:text-white">
                            {record.user?.full_name || 'Officer'}
                          </p>
                          <p className="text-[11px] text-muted dark:text-muted">{record.user?.email || 'Field Division'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {checkInDt ? (
                        <div className="flex items-center gap-1.5 font-bold text-ink dark:text-white">
                          <Clock className="w-3.5 h-3.5 text-success dark:text-brand-dark" />
                          {checkInDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ) : (
                        <span className="text-muted dark:text-muted">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {checkOutDt ? (
                        <div className="flex items-center gap-1.5 font-bold text-ink dark:text-white">
                          <Clock className="w-3.5 h-3.5 text-muted dark:text-muted" />
                          {checkOutDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-warning-solid animate-ping" /> Active Shift
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-semibold text-ink dark:text-white">
                      {durText}
                    </td>
                    <td className="py-4 px-6">
                      {record.check_in_location ? (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${record.check_in_location.latitude || record.check_in_location.lat},${record.check_in_location.longitude || record.check_in_location.lng}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-brand-dark dark:text-brand-dark font-bold hover:underline"
                        >
                          <MapPin className="w-3.5 h-3.5" /> GPS Verified
                        </a>
                      ) : (
                        <span className="text-muted dark:text-muted">Manual Entry</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                        !record.check_out_time
                          ? 'bg-success/10 dark:bg-primary/15 text-success dark:text-brand-dark border-success/30 dark:border-primary/30 '
                          : 'bg-paper-2 dark:bg-paper-2 text-muted dark:text-muted border-line dark:border-line'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {!record.check_out_time ? 'ON SHIFT' : 'COMPLETED'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted dark:text-muted font-medium">
                    No attendance records found.
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
