const test = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('./load.cjs')

test('data review sends only changed fields and caps the Supabase write', async () => {
  let request, signal
  const supabase = { rpc(name, payload) {
    request = { name, payload }
    return { abortSignal(value) {
      signal = value
      return Promise.resolve({ data: { revision: 3 }, error: null })
    } }
  } }
  const { updateDataReview } = load('src/app/(main)/dashboard/cases/[id]/data-review/actions.ts', {
    '@/lib/auth/actions': { authorizeCase: async () => ({ supabase }) },
    '@/lib/api/errors': { actionError: error => ({ error: String(error) }) },
    'next/cache': { revalidatePath() {} },
  })
  const result = await updateDataReview('case-id', {
    applicant_name: 'QA New', phone_number: '9990001112',
    land_measurements_east: 30, land_measurements_west: 30,
    land_measurements_north: 40, land_measurements_south: 40,
    land_rate: 9000,
  }, 2, ['applicant_name'])
  assert.deepEqual(result, { success: true, error: undefined, revision: 3 })
  assert.equal(request.name, 'save_case_data')
  assert.deepEqual(request.payload.p_data, { applicant_name: 'QA New' })
  assert.equal(request.payload.p_expected_revision, 2)
  assert.equal(signal.aborted, false)
})

test('HTTP 409 from a stale save is shown as a refresh conflict', async () => {
  const supabase = { rpc() { return { abortSignal() { return Promise.resolve({ data: null, error: { message: 'Conflict' }, status: 409 }) } } } }
  const { updateDataReview } = load('src/app/(main)/dashboard/cases/[id]/data-review/actions.ts', {
    '@/lib/auth/actions': { authorizeCase: async () => ({ supabase }) },
    '@/lib/api/errors': { actionError: error => ({ error: String(error) }) },
    'next/cache': { revalidatePath() {} },
  })
  const result = await updateDataReview('case-id', { applicant_name: 'New' }, 1, ['applicant_name'])
  assert.match(result.error, /Refresh before saving/)
})
