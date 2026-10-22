'use server'

import { createClient } from '@/utils/supabase/server'

export async function getAllAttendance() {
  const supabase = await createClient()
  
  const { data: attendance, error } = await supabase
    .from('attendance')
    .select(`
      *,
      user:user_id ( full_name, email, department, state )
    `)
    .order('date', { ascending: false })
    .order('check_in_time', { ascending: false })

  if (error) {
    console.error('Error fetching attendance:', error)
    return []
  }

  return attendance
}
