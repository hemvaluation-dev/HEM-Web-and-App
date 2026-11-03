const test = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('./load.cjs')
const { initiationTimestamp, initiationLocalTime } = load('src/lib/cases/initiation.ts')
test('initiation form defaults to IST even when the UTC day differs', () => {
  assert.equal(initiationLocalTime(new Date('2026-11-02T20:15:00Z')), '2026-11-03T01:45')
})
test('initiation stores local IST and explicit timezones without changing the instant', () => {
  assert.equal(initiationTimestamp('2026-11-03T10:30'), '2026-11-03T05:00:00.000Z')
  assert.equal(initiationTimestamp('2026-11-03T05:00:00Z'), '2026-11-03T05:00:00.000Z')
  assert.equal(initiationTimestamp('2026-11-03T00:00:00-05:00'), '2026-11-03T05:00:00.000Z')
})
test('invalid initiation dates produce actionable validation errors', () => {
  for (const value of ['invalid','2026-02-30T12:00','2026-11-03T25:00']) assert.throws(() => initiationTimestamp(value), /valid initiation/)
})
test('retrying initiation returns the existing case ID so documents can attach without another case', async () => {
  const { createCase } = load('src/app/(main)/admin/actions.ts', {
    '@/lib/cases/evidence': {}, '@/lib/reports/storage': {}, '@/lib/cases/data': {},
    '@/lib/report-engine/templates': {}, '@/lib/auth/actions': { authorizeAction: async () => null },
    'next/cache': { revalidatePath: () => {} },
    '@/utils/supabase/server': { createClient: async () => ({
      auth: { getUser: async () => ({ data: { user: { id: 'operator' } } }) },
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 'existing-case' } }) }) }), insert: () => assert.fail('Duplicate case insert') }),
    }) },
  })
  const form = new FormData()
  for (const [key,value] of Object.entries({application_number:'QA',applicant_name:'QA',address:'QA',client_id:'client',idempotency_key:'retry'})) form.set(key,value)
  assert.deepEqual(await createCase(form), { success: true, caseId: 'existing-case' })
})
