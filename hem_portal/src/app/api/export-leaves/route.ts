import { serializeCsv } from '@/lib/exports/csv'
import { NextResponse } from 'next/server'
import { withApi } from '@/lib/api/route'

export const GET = withApi(async (req, { supabase }) => {


  const { data: leaves, error } = await supabase
    .from('leaves')
    .select(`
      *,
      user:user_id ( full_name, email, department, state )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return new NextResponse('Failed to fetch leaves', { status: 500 })
  }

  const headers = [
    'Leave ID',
    'Member Name',
    'Member Email',
    'Department',
    'Start Date',
    'End Date',
    'Reason',
    'Status',
    'Requested At'
  ]

  const rows = (leaves || []).map((l) => [
    l.id || '',
    (l.user?.full_name || ''),
    (l.user?.email || ''),
    (l.user?.department || ''),
    l.start_date || '',
    l.end_date || '',
    (l.reason || ''),
    l.status || '',
    l.created_at ? new Date(l.created_at).toISOString() : ''
  ])

  const csvContent = serializeCsv(headers, rows)

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leave_requests_${new Date().toISOString().split('T')[0]}.csv"`,
    }
  })
}, { roles: ['owner'] })
