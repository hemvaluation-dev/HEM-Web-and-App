'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: String(formData.get('email') || '').trim(),
    password: String(formData.get('password') || ''),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: 'Unable to sign in. Check your email and password, then try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
