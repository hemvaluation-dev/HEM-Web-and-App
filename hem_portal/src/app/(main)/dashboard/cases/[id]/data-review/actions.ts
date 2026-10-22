'use server'
import { calculateMeasurements } from '@/lib/valuation/measurements'
import { revalidatePath } from 'next/cache'
import { authorizeCase } from '@/lib/auth/actions'
import { actionError } from '@/lib/api/errors'

export async function updateDataReview(caseId: string, updatedData: Record<string, unknown>, revision: number, changedKeys: string[]) {
  try {
    const { supabase } = await authorizeCase(caseId)
    if (!changedKeys.length) return { error: 'There are no changes to save.' }
    const calculated = calculateMeasurements(updatedData)
    const changes = Object.fromEntries(changedKeys.filter(key => Object.hasOwn(calculated, key)).map(key => [key, calculated[key]]))
    if (!Object.keys(changes).length) return { error: 'There are no changes to save.' }
    const { data, error, status } = await supabase.rpc('save_case_data', {
      p_case_id: caseId, p_data: changes, p_expected_revision: revision, p_submit: false,
    }).abortSignal(AbortSignal.timeout(20000))
    if (error || status === 409) return { error: error?.code === '40001' || status === 409
      ? 'This case changed. Refresh before saving your edits.' : error?.message || 'Changes could not be saved.' }
    revalidatePath(`/dashboard/cases/${caseId}`, 'layout')
    return { success: true as const, error: undefined, revision: data.revision }
  } catch (error) { return actionError(error) }
}
