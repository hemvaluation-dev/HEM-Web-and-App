import { serializeCsv } from '@/lib/exports/csv'
import { NextResponse } from 'next/server'
import { withApi } from '@/lib/api/route'

export const GET = withApi(async (req, { supabase }) => {


  // Fetch all attendance logs joined with user profiles
  const { data: logs, error } = await supabase
    .from('attendance')
    .select(`
      *,
      user:user_id (full_name, email, role, department, state)
    `)
    .order('date', { ascending: false })
    .order('check_in_time', { ascending: false })

  if (error) {
    return new NextResponse('Failed to fetch attendance logs', { status: 500 })
  }

  const headers = [
    'Log ID',
    'Employee Name',
    'Email',
    'Role',
    'Department',
    'State',
    'Date',
    'Check-In Time',
    'Check-Out Time',
    'Total Hours',
    'Check-In Location (Lat/Lng)'
  ]

  const rows = (logs || []).map((log) => {
    let durText = ''
    if (log.check_in_time && log.check_out_time) {
      const ms = new Date(log.check_out_time).getTime() - new Date(log.check_in_time).getTime()
      if (ms > 0) {
        durText = (ms / (1000 * 60 * 60)).toFixed(2)
      }
    }
    
    let loc = ''
    if (log.check_in_location) {
      loc = `${log.check_in_location.latitude ?? log.check_in_location.lat},${log.check_in_location.longitude ?? log.check_in_location.lng}`
    }

    return [
      log.id || '',
      (log.user?.full_name || ''),
      (log.user?.email || ''),
      log.user?.role || '',
      (log.user?.department || ''),
      (log.user?.state || ''),
      log.date || '',
      log.check_in_time ? new Date(log.check_in_time).toISOString() : '',
      log.check_out_time ? new Date(log.check_out_time).toISOString() : '',
      durText,
      loc
    ]
  })

  const csvContent = serializeCsv(headers, rows)

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="attendance_timesheets_${new Date().toISOString().split('T')[0]}.csv"`,
    }
  })
}, { roles: ['owner'] })
