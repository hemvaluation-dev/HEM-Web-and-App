'use server'

import { editableEvidence } from '@/lib/cases/evidence'
import { objectPath } from '@/lib/reports/storage'

import { getDirectory, getClients, getCaseSummaries } from '@/lib/cases/data'
import { findTemplate } from '@/lib/report-engine/templates'
import { authorizeAction } from '@/lib/auth/actions'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAllCases() {
  const accessError = await authorizeAction('administration')
  if (accessError) throw new Error(accessError)
  return getCaseSummaries()
}

export async function getAllAgents() {
  const users = await getDirectory()
  return users.filter(user => user.role === 'field_agent')
}

export async function getAllReviewers() {
  const users = await getDirectory()
  return users.filter(user => ['reviewer', 'manager', 'lead', 'owner', 'admin'].includes(user.role) || ['L3', 'L4', 'L5'].includes(user.level))
}

export async function getAllValuators() {
  const users = await getDirectory()
  return users.filter(user => user.role !== 'field_agent' && (['valuator', 'staff', 'editor', 'analyst', 'reviewer', 'lead', 'manager', 'owner', 'admin'].includes(user.role) || ['L2', 'L3', 'L4', 'L5'].includes(user.level)))
}

export async function getAllUsers() {
  const accessError = await authorizeAction('administration')
  if (accessError) throw new Error(accessError)
  const supabase = await createClient()
  
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return users
}

export async function assignCase(caseId: string, agentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: caseRecord } = await supabase.from('cases').select('created_by, status').eq('id', caseId).single()
  if (!caseRecord || caseRecord.created_by !== user.id) {
    return { error: 'Permission denied: Only the case creator can assign or reassign this case.' }
  }

  const { error } = await supabase
    .from('cases')
    .update({ assigned_to: agentId, status: ['new', 'draft', 'created'].includes(caseRecord.status) ? 'assigned' : caseRecord.status })
    .eq('id', caseId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/cases')
  return { success: true }
}

export async function assignReviewer(caseId: string, reviewerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: caseRecord } = await supabase.from('cases').select('created_by, status').eq('id', caseId).single()
  if (!caseRecord || caseRecord.created_by !== user.id) {
    return { error: 'Permission denied: Only the case creator can assign or reassign this case.' }
  }

  const { error } = await supabase
    .from('cases')
    .update({ reviewer_id: reviewerId })
    .eq('id', caseId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/cases')
  revalidatePath(`/dashboard/cases/${caseId}`)
  return { success: true }
}

export async function assignValuator(caseId: string, valuatorId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: caseRecord } = await supabase.from('cases').select('created_by, status').eq('id', caseId).single()
  if (!caseRecord || caseRecord.created_by !== user.id) {
    return { error: 'Permission denied: Only the case creator can assign or reassign this case.' }
  }

  const { error } = await supabase
    .from('cases')
    .update({ valuator_id: valuatorId })
    .eq('id', caseId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/cases')
  revalidatePath(`/dashboard/cases/${caseId}`)
  return { success: true }
}

export async function createAgent(formData: FormData) {
  const accessError = await authorizeAction('owner')
  if (accessError) return { error: accessError }
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const role = formData.get('role') as string
  const department = formData.get('department') as string
  const level = formData.get('level') as string
  const reporting_manager = formData.get('reporting_manager') as string
  const state = formData.get('state') as string
  
  if (!email || !password) return { error: 'Email and password are required' }

  if (role?.toLowerCase() === 'owner' || level === 'L5' || level?.toLowerCase() === 'owner' || level === 'All') {
    return { error: 'Creation of Senior Management accounts is restricted.' }
  }

  // Create an admin client using the service role key to bypass RLS and create users directly
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  if (!serviceRoleKey) {
    return { error: 'Server configuration error: Missing service role key.' }
  }

  const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Create the user in auth.users
  const { error: authError, data } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      phone,
      address,
      role,
      department,
      level,
      reporting_manager,
      state
    }
  })

  if (authError) {
    console.error('Error creating user auth record:', authError)
    return { error: authError.message }
  }

  if (data?.user) {
    const { error: dbError } = await adminClient.from('users').upsert({
      id: data.user.id,
      email,
      full_name: full_name || email.split('@')[0],
      phone: phone || null,
      address: address || null,
      role: role || 'field_agent',
      department: department || 'Field Operations',
      level: level || 'L1',
      reporting_manager: reporting_manager || null,
      state: state || null,
      is_active: true,
      auth_id: data.user.id
    })

    if (dbError) {
      console.error('Error inserting public user record:', dbError)
    }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function getAllClients() { return getClients() }

export async function renameClientBank(id: string, name: string) {
  const accessError = await authorizeAction('owner')
  if (accessError) return { error: accessError }
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { error: 'Choose a valid institution.' }
  }
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 150) {
    return { error: 'Enter an institution name between 1 and 150 characters.' }
  }
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  // Change only the display name: template slugs and case references are stable.
  const { data, error } = await adminClient.from('clients')
    .update({ name: name.trim() }).eq('id', id)
    .select('id,name,template_name').single()
  if (error || !data) return { error: 'The institution could not be renamed. Refresh and try again.' }
  revalidatePath('/', 'layout')
  return { success: true, client: data }
}

export async function createClientBank(name: string) {
  const accessError = await authorizeAction('administration')
  if (accessError) return { error: accessError }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  if (!name || !name.trim()) return { error: 'Bank name is required' }

  const template_name = findTemplate(name)?.id ?? name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_template'
  const { data, error } = await adminClient
    .from('clients')
    .insert({ name: name.trim(), template_name })
    .select()
    .single()

  if (error) return { error: error.message }
  return { success: true, client: data }
}

export async function deleteClientBank(id: string) {
  const accessError = await authorizeAction('administration')
  if (accessError) return { error: accessError }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Prevent deleting banks that are already in use by cases
  const { count, error: countError } = await adminClient
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', id)

  if (countError) return { error: countError.message }
  if (count && count > 0) return { error: 'Cannot delete this institution because it is already used in existing cases.' }

  const { error } = await adminClient.from('clients').delete().eq('id', id)
  if (error) return { error: error.message }
  
  return { success: true }
}

export async function createCase(formData: FormData) {
  const accessError = await authorizeAction('administration')
  if (accessError) return { error: accessError }
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const application_number = formData.get('application_number') as string
    const applicant_name = formData.get('applicant_name') as string
    const phone_number = formData.get('phone_number') as string
    const address = formData.get('address') as string
    const state = formData.get('state') as string
    const branch = formData.get('branch') as string
    const property_type = formData.get('property_type') as string
    const case_type = formData.get('case_type') as string
    const client_id = formData.get('client_id') as string
    let assigned_to = formData.get('assigned_to') as string | null
    let reviewer_id = formData.get('reviewer_id') as string | null
    const idempotency_key = formData.get('idempotency_key') as string | null
    
    if (assigned_to === 'unassigned') assigned_to = null
    if (reviewer_id === 'unassigned') reviewer_id = null

    const created_at = formData.get('created_at') as string
    const deadline_date = formData.get('deadline_date') as string
    const documents = formData.getAll('documents') as File[]

    if (!application_number || !applicant_name || !address || !client_id) {
      return { error: 'Missing required fields' }
    }

    // --- Idempotency check: if this exact submission was already processed, return the existing case ---
    if (idempotency_key) {
      const { data: existingCase } = await supabase
        .from('cases')
        .select('id')
        .eq('idempotency_key', idempotency_key)
        .maybeSingle()

      if (existingCase) {
        // Case was already created by a previous attempt — return success without creating a duplicate
        revalidatePath('/admin/cases')
        return { success: true }
      }
    }

    const caseData: any = {
      application_number,
      applicant_name,
      phone_number,
      address,
      property_type: property_type || null,
      case_type: case_type || null,
      client_id,
      assigned_to,
      reviewer_id,
      state,
      created_by: user.id,
      status: assigned_to ? 'assigned' : 'new',
      extracted_data: branch ? { branch } : {}
    }

    if (idempotency_key) {
      caseData.idempotency_key = idempotency_key
    }

    if (created_at) {
      // Append +05:30 if it doesn't already have timezone info to ensure IST
      const tzString = created_at.includes('Z') || created_at.includes('+') ? created_at : `${created_at}+05:30`
      caseData.created_at = new Date(tzString).toISOString()
    }
    if (deadline_date) {
      const tzString = deadline_date.includes('Z') || deadline_date.includes('+') ? deadline_date : `${deadline_date}+05:30`
      caseData.deadline_date = new Date(tzString).toISOString()
    }

    const { data: insertedCase, error } = await supabase
      .from('cases')
      .insert(caseData)
      .select('id')
      .single()

    if (error) {
      // Handle unique constraint violation on idempotency_key (race condition: two requests slipped past the check)
      if (error.code === '23505' && error.message?.includes('idempotency_key')) {
        revalidatePath('/admin/cases')
        const { data: existingCase } = await supabase.from('cases').select('id').eq('idempotency_key', idempotency_key).maybeSingle()
        return { success: true, caseId: existingCase?.id }
      }
      console.error('Error creating case:', error)
      return { error: error.message }
    }

    const caseId = insertedCase.id

    revalidatePath('/admin/cases')
    return { success: true, caseId }
  } catch (error: any) {
    console.error('Unhandled error in createCase:', error)
    return { error: error?.message || 'An unexpected server error occurred.' }
  }
}

export async function generateDocumentUploadUrl(caseId: string, fileName: string, fileSize: number) {
  const supabaseAdmin = await editableEvidence(caseId)
  if (!Number.isSafeInteger(fileSize) || fileSize < 1 || fileSize > 18 * 1024 * 1024) {
    return { error: 'Choose a document smaller than 18 MB.' }
  }
  const fileExt = fileName.split('.').pop()?.toLowerCase()
  if (!fileExt || !['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(fileExt)) return { error: 'Unsupported document type.' }
  const path = `${caseId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

  const { data, error } = await supabaseAdmin.storage
    .from('documents')
    .createSignedUploadUrl(path)
    
  if (error) {
    console.error('Error generating signed upload URL:', error)
    return { error: error.message }
  }
  
  return { 
    signedUrl: data.signedUrl, 
    path, 
    token: data.token,
    publicUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${path}`
  }
}

export async function attachCaseDocumentRecord(caseId: string, fileUrl: string, fileName: string) {
  const supabaseAdmin = await editableEvidence(caseId)
  if (!objectPath(fileUrl, 'documents').startsWith(`${caseId}/`)) return { error: 'The document belongs to another case.' }
  const { error } = await supabaseAdmin.from('case_documents').insert({
    case_id: caseId,
    document_type: 'Other',
    file_url: fileUrl,
    file_name: fileName,
    extracted_data: {}
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateUser(formData: FormData) {
  const accessError = await authorizeAction('owner')
  if (accessError) return { error: accessError }
  const id = formData.get('id') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const role = formData.get('role') as string
  const department = formData.get('department') as string
  const level = formData.get('level') as string
  const reporting_manager = formData.get('reporting_manager') as string
  const is_active = formData.get('is_active') === 'true'
  const state = formData.get('state') as string
  
  if (!id) return { error: 'User ID is required' }

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  if (!serviceRoleKey) {
    return { error: 'Server configuration error: Missing service role key.' }
  }

  const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Verify target user's current status
  const { data: targetUser } = await adminClient.from('users').select('role, level').eq('id', id).single()
  const isTargetOwner = targetUser?.role === 'owner' || targetUser?.level === 'L5'
  const isAssigningOwner = role?.toLowerCase() === 'owner' || level === 'L5' || level?.toLowerCase() === 'owner' || level === 'All'

  if (isTargetOwner) {
    if (!isAssigningOwner) {
      return { error: 'Cannot demote a Senior Management account.' }
    }
  } else {
    if (isAssigningOwner) {
      return { error: 'Assigning the Senior Management role is restricted.' }
    }
  }

  // Update auth metadata (and password if provided)
  const updatePayload: any = {
    user_metadata: {
      full_name,
      phone,
      address,
      role,
      department,
      level,
      reporting_manager,
      state
    }
  }

  if (password) {
    updatePayload.password = password
  }
  
  // Suspend user if is_active is false
  updatePayload.ban_duration = is_active ? 'none' : '876000h' // 100 years ban
  
  const { error: authError } = await adminClient.auth.admin.updateUserById(id, updatePayload)

  if (authError) {
    console.error('Error updating user auth record:', authError)
    return { error: authError.message }
  }

  // Update public.users table as well
  const { error: dbError } = await adminClient
    .from('users')
    .update({
      full_name,
      phone,
      address,
      role,
      department,
      level,
      reporting_manager,
      state,
      is_active
    })
    .eq('id', id)
    
  if (dbError) {
    console.error('Error updating public user record:', dbError)
    return { error: dbError.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function deleteUserAction(id: string) {
  const accessError = await authorizeAction('owner')
  if (accessError) return { error: accessError }
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  if (!serviceRoleKey) {
    return { error: 'Server configuration error: Missing service role key.' }
  }

  const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Check if user is an owner
  const { data: targetUser } = await adminClient.from('users').select('role').eq('id', id).single()
  if (targetUser?.role === 'owner') {
    return { error: 'Cannot delete owner accounts.' }
  }

  // Unassign cases first to avoid FK constraint violations
  await adminClient.from('cases').update({ assigned_to: null }).eq('assigned_to', id)

  // Delete from public.users
  await adminClient.from('users').delete().eq('id', id)
  
  // Delete from auth
  const { error } = await adminClient.auth.admin.deleteUser(id)
  if (error) {
    console.error('Error deleting user:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function deleteCaseAction(caseId: string) {
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Ensure owner
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'owner') return { error: 'Forbidden' }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // 1. Get all photos associated with the case
  const { data: photos } = await adminClient.from('case_photos').select('file_url').eq('case_id', caseId)
  if (photos && photos.length > 0) {
    const photoPaths = photos.map(p => p.file_url.split('/photos/')[1]).filter(Boolean)
    if (photoPaths.length > 0) {
      const { error: storageError } = await adminClient.storage.from('photos').remove(photoPaths)
      if (storageError) return { error: `Could not remove case photos: ${storageError.message}` }
    }
  }

  // 2. Get all documents associated with the case
  const { data: docs } = await adminClient.from('case_documents').select('file_url').eq('case_id', caseId)
  if (docs && docs.length > 0) {
    const docPaths = docs.map(d => d.file_url.split('/documents/')[1]).filter(Boolean)
    if (docPaths.length > 0) {
      const { error: storageError } = await adminClient.storage.from('documents').remove(docPaths)
      if (storageError) return { error: `Could not remove case documents: ${storageError.message}` }
    }
  }

  // Generated reports also occupy Storage; their rows cascade when the case is deleted.
  const { data: reports, error: reportsError } = await adminClient.from('case_reports').select('storage_path').eq('case_id', caseId)
  if (reportsError) return { error: reportsError.message }
  const reportPaths = (reports || []).map(r => r.storage_path).filter(Boolean)
  if (reportPaths.length) {
    const { error: storageError } = await adminClient.storage.from('reports').remove(reportPaths)
    if (storageError) return { error: `Could not remove case reports: ${storageError.message}` }
  }

  // Delete case row (this cascades to its metadata rows via FKs).
  const { error } = await adminClient.from('cases').delete().eq('id', caseId)
  if (error) {
    console.error('Error deleting case:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/cases')
  revalidatePath('/admin/cases')
  return { success: true }
}

export async function getCaseSubmissionStats(caseIds?: string[]) {
  const accessError = await authorizeAction('administration')
  if (accessError) throw new Error(accessError)
  const supabase = await createClient()

  // Count distinct cases that have photos uploaded
  const { data: photoCases } = await supabase
    .from('case_photos')
    .select('case_id')

  // Count distinct cases that have field data
  const { data: fieldDataCases } = await supabase
    .from('case_field_data')
    .select('case_id')

  // Count distinct cases that have location data
  const { data: locationCases } = await supabase
    .from('case_location')
    .select('case_id')

  const selected = caseIds ? new Set(caseIds) : null
  const countSelected = (rows: { case_id: string }[] | null) => new Set((rows || []).map(r => r.case_id).filter(id => !selected || selected.has(id))).size
  const uniquePhotoCases = countSelected(photoCases)
  const uniqueFieldDataCases = countSelected(fieldDataCases)
  const uniqueLocationCases = countSelected(locationCases)

  return {
    casesWithPhotos: uniquePhotoCases,
    casesWithFieldData: uniqueFieldDataCases,
    casesWithLocation: uniqueLocationCases,
  }
}

export async function getAllCreators() {
  const [users, cases] = await Promise.all([getDirectory(), getCaseSummaries()])
  const ids = new Set(cases.map(c => c.created_by))
  return users.filter(user => ids.has(user.id))
}
