import { serializeCsv } from '@/lib/exports/csv'
import { NextResponse } from 'next/server'
import { withApi } from '@/lib/api/route'

export const GET = withApi(async (req, { supabase }) => {


  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return new NextResponse('Failed to fetch team', { status: 500 })
  }

  const headers = [
    'User ID',
    'Full Name',
    'Email',
    'Phone',
    'Role',
    'Level',
    'Department',
    'State',
    'Status',
    'Created At'
  ]

  const rows = (users || []).map(u => [
    u.id || '',
    (u.full_name || ''),
    (u.email || ''),
    (u.phone || ''),
    u.role || '',
    u.level || '',
    (u.department || ''),
    (u.state || ''),
    u.is_active !== false ? 'ACTIVE' : 'INACTIVE',
    u.created_at ? new Date(u.created_at).toISOString() : ''
  ])

  const csvContent = serializeCsv(headers, rows)

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="team_directory_${new Date().toISOString().split('T')[0]}.csv"`,
    }
  })
}, { roles: ['owner'] })
