import { filterCases } from '@/lib/cases/filters'
import { serializeCsv } from '@/lib/exports/csv'
import { NextResponse } from 'next/server'
import { withApi } from '@/lib/api/route'

export const GET = withApi(async (req, { supabase }) => {


  const url = new URL(req.url)
  // Fetch all cases with joined relations for filtering
  const { data: cases, error } = await supabase
    .from('cases')
    .select(`
      *,
      assigned_to_user:assigned_to (email, full_name, state),
      valuator_user:valuator_id (email, full_name, role, level, state),
      reviewer_user:reviewer_id (email, full_name, role, level, state),
      client:client_id (name)
    `)
    .order('created_at', { ascending: true })

  if (error) {
    return new NextResponse('Failed to fetch cases', { status: 500 })
  }

  const filteredCases = filterCases(cases || [], Object.fromEntries(url.searchParams))


  const headers = [
    'Case ID',
    'Application Number',
    'Applicant Name',
    'Property Type',
    'Case Type',
    'Address',
    'City',
    'State',
    'Status',
    'Priority',
    'Client/Institution',
    'Created At'
  ]

  const rows = filteredCases.map(c => [
    c.id || '',
    c.application_number || '',
    (c.applicant_name || ''),
    (c.property_type || ''),
    (c.case_type || ''),
    (c.address || ''),
    (c.city || ''),
    (c.state || ''),
    c.status || '',
    c.priority || '',
    (c.client?.name || ''),
    c.created_at ? new Date(c.created_at).toISOString() : ''
  ])

  const csvContent = serializeCsv(headers, rows)

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="cases_export_${new Date().toISOString().split('T')[0]}.csv"`,
    }
  })
}, { roles: ['owner'] })
