import { filterCases } from '@/lib/cases/filters'
import { serializeCsv } from '@/lib/exports/csv'
import { NextResponse } from 'next/server'
import { withApi } from '@/lib/api/route'

export const GET = withApi(async (req, { supabase }) => {


  const url = new URL(req.url)
  // Fetch all cases with joined relations for filtering
  const { data: cases, error: casesError } = await supabase
    .from('cases')
    .select(`
      *,
      assigned_to_user:assigned_to (email, full_name, state),
      valuator_user:valuator_id (email, full_name, role, level, state),
      reviewer_user:reviewer_id (email, full_name, role, level, state),
      client:client_id (name)
    `)
    .order('created_at', { ascending: true })

  if (casesError) return new NextResponse('Failed to fetch cases', { status: 500 })
  const filteredCases = filterCases(cases || [], Object.fromEntries(url.searchParams))

  const [usersResult, clientsResult, locationsResult] = await Promise.all([
    supabase.from('users').select('id, full_name, email'),
    supabase.from('clients').select('id, name'),
    supabase.from('case_location').select('case_id, created_at, latitude, longitude'),
  ])
  if (usersResult.error || clientsResult.error || locationsResult.error) return new NextResponse('Failed to fetch export details', { status: 500 })
  const users = new Map((usersResult.data || []).map(user => [user.id, user]))
  const clients = new Map((clientsResult.data || []).map(client => [client.id, client]))
  const locations = new Map((locationsResult.data || []).map(location => [location.case_id, location]))

  const headers = [
    'S. NO.',
    'Date of Initiation',
    'Date of Visit',
    'Date of Report',
    'TAT',
    'ASSIGNED TO',
    'BANK',
    'Branch',
    'Applicant Name (Developer Name if project)',
    'Report Done By',
    'Report Type',
    'Case Type',
    'Case Status',
    'Application ID',
    'Latitude',
    'Longitude',
    'Branch Distance',
    'Land Area (sqft)',
    'Land Rate (Rs/sqft)',
    'Road Width',
    'Address of the property',
    'Customer Response Remark'
  ]

  const misData = filteredCases.map((c: any, index: number) => {
    const ext = c.extracted_data || {}
    const assignee = users.get(c.assigned_to)
    const valuator = users.get(c.valuator_id)
    const client = clients.get(c.client_id)
    const locationInfo = locations.get(c.id)

    // Calculate dates
    const initiationDate = ext.initiation_date || new Date(c.created_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')
    let visitDate = ext.visit_date
    if (!visitDate && locationInfo?.created_at) {
      visitDate = new Date(locationInfo.created_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')
    }
    visitDate = visitDate || ''

    let reportDate = ext.report_date
    if (!reportDate) {
      if (ext.submitted_at) {
        reportDate = new Date(ext.submitted_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')
      } else if (c.status === 'completed' || c.status === 'delivered') {
        reportDate = new Date(c.updated_at || c.created_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')
      }
    }
    reportDate = reportDate || ''

    let tatStr = 'Pending'
    if (ext.submitted_at) {
      const start = new Date(c.deadline_date || c.created_at).getTime()
      const end = new Date(ext.submitted_at).getTime()
      if (!isNaN(start) && !isNaN(end)) {
        const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24))
        tatStr = `${diffDays} days`
      }
    } else if (c.status === 'completed' || c.status === 'delivered') {
      const start = new Date(c.deadline_date || c.created_at).getTime()
      const end = new Date(c.updated_at || c.created_at).getTime()
      if (!isNaN(start) && !isNaN(end)) {
        const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24))
        tatStr = `${diffDays} days`
      }
    }

    let lat = ''
    let lng = ''
    if (locationInfo) {
      lat = locationInfo.latitude?.toString() || ''
      lng = locationInfo.longitude?.toString() || ''
    } else if (ext.gps_coordinates) {
      const parts = ext.gps_coordinates.split(',').map((p: string) => p.trim())
      if (parts.length >= 2) {
        lat = parts[0]
        lng = parts[1]
      } else {
        lat = ext.gps_coordinates
      }
    }

    return [
      (index + 1).toString(), // S. NO.
      initiationDate, // Date of Initiation
      visitDate, // Date of Visit
      reportDate, // Date of Report
      tatStr, // TAT
      assignee?.full_name || assignee?.email || '', // ASSIGNED TO
      client?.name || '', // BANK
      ext.branch || ext.city || c.address?.split(',')[0] || '', // Branch (previously empty header)
      (c.applicant_name || ''), // Applicant Name
      valuator?.full_name || valuator?.email || '', // Report Done By
      ext.type_property || c.property_type || '', // Report Type
      c.case_type || '', // Case Type
      (c.status || '').toUpperCase(), // Case Status
      (c.application_number || ''), // Application ID
      lat, // Latitude
      lng, // Longitude
      ext.dist_city_center || '', // Branch Distance
      ext.land_area || '', // Land Area (sqft)
      ext.land_rate || '', // Land Rate (Rs/sqft)
      ext.road_width || '', // Road Width
      (ext.property_address || c.address || ''), // Address of the property
      c.customer_response_remark ?? ''
    ]
  })

  const csvContent = serializeCsv(headers, misData)

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="MIS_${new Date().toISOString().split('T')[0]}.csv"`,
    }
  })
}, { roles: ['owner', 'admin'] })
