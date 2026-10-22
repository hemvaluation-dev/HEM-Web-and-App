'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const current_password = formData.get('current_password') as string
  const new_password = formData.get('new_password') as string

  // Update public.users
  const { error: dbError } = await supabase
    .from('users')
    .update({ full_name, phone, address })
    .eq('id', user.id)

  if (dbError) {
    console.error('Error updating profile in DB:', dbError)
    return { error: 'Failed to update profile details.' }
  }

  // Update password in Auth if provided
  if (new_password) {
    if (!current_password) {
      return { error: 'You must provide your current password to set a new password.' }
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: current_password,
    })

    if (signInError) {
      return { error: 'Incorrect current password.' }
    }

    const { error: authError } = await supabase.auth.updateUser({
      password: new_password
    })
    
    if (authError) {
      console.error('Error updating password:', authError)
      return { error: 'Failed to update password. It might not meet complexity requirements.' }
    }
  }

  // Update user_metadata in Auth so session stays synced
  const { error: metaError } = await supabase.auth.updateUser({
    data: { full_name, phone, address }
  })
  
  if (metaError) {
    console.error('Error updating user_metadata:', metaError)
  }

  revalidatePath('/settings')
  return { success: true }
}
