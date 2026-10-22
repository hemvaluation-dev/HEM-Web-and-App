'use server'

import { createClient } from '@/utils/supabase/server'
import { authenticate } from '@/lib/api/route'
import { getCaseSummaries } from '@/lib/cases/data'
import { redirect } from 'next/navigation'

export async function signOut() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Error during sign out:', error)
  }
  redirect('/login')
}

export async function getCases() { return getCaseSummaries() }

export async function takeCase(caseId: string) {
  const { supabase } = await authenticate()
  const { error } = await supabase.rpc('claim_case', { p_case_id: caseId })
  if (error) return { error: error.message }

  const { revalidatePath } = await import('next/cache')
  revalidatePath(`/dashboard/cases/${caseId}`)
  revalidatePath('/dashboard/pending')
  revalidatePath('/admin/cases')
  return { success: true }
}
