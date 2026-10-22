const test = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('./load.cjs')

test('case export emits all twelve columns including application number and joined client name', async () => {
  const supabase = { from: () => ({ select: () => ({ order: async () => ({ data: [{
    id: 'case-1', application_number: 'APP-001', applicant_name: 'A, B',
    client: { name: 'Lender "One"' }, status: 'assigned', created_at: '2026-09-25T00:00:00Z',
  }], error: null }) }) }) }
  const { GET } = load('src/app/api/export-cases/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/api/route': { withApi: handler => request => handler(request, { supabase }) },
  })
  const response = await GET(new Request('http://localhost/api/export-cases'))
  const csv = await response.text()
  assert.equal(response.status, 200)
  assert.match(csv, /"case-1","APP-001","A, B"/)
  assert.match(csv, /"Lender ""One"""/)
  assert.equal(csv.split('\r\n')[0].split(',').length, 12)
})

test('a concurrent case edit is reported as a conflict, never a successful status update', async () => {
  const calls = []
  const { updateCaseStatus } = load('src/app/(main)/dashboard/cases/[id]/actions.ts', {
    'next/cache': { revalidatePath: () => assert.fail('Conflicts must not revalidate as successful writes') },
    '@/lib/auth/actions': { authorizeCase: async () => ({
      profile: { role: 'owner' }, record: { status: 'in_review', revision: 7 },
      supabase: { rpc: async (name, args) => {
        calls.push([name, args]); return { error: { code: '40001', message: 'This case changed. Refresh before continuing' } }
      } },
    }) },
  })
  const result = await updateCaseStatus('case-id', 'completed', 7)
  assert.match(result.error, /changed/)
  assert.deepEqual(calls, [['transition_case', { p_case_id: 'case-id', p_status: 'completed', p_expected_revision: 7 }]])
  calls.length = 0
  assert.match((await updateCaseStatus('case-id', 'completed', 6)).error, /changed/)
  assert.equal(calls.length, 0)

})

test('case authorization rejects unrelated field agents before any write', async () => {
  const { authorizeCase } = load('src/lib/auth/actions.ts', {
    '@/lib/auth/session': { authenticate: async () => ({
      user: { id: 'agent-one' }, profile: { role: 'field_agent' },
      supabase: { from: () => ({ select: () => ({ eq: () => ({ single: async () => ({
        data: { assigned_to: 'agent-two', created_by: 'owner', status: 'assigned' }, error: null,
      }) }) }) }) },
    }) },
  })
  await assert.rejects(authorizeCase('a304f198-2a59-4fae-bb4e-d8f1ba617295'), { status: 403 })
})

test('locked case evidence cannot upload or delete through portal actions', async () => {
  const supabase = {
    rpc: async () => ({ data: false, error: null }),
    from: () => assert.fail('Locked case must not mutate attachment records'),
    storage: { from: () => assert.fail('Locked case must not mutate stored files') },
  }
  const { uploadEvidence, deleteEvidence } = load('src/lib/cases/evidence.ts', {
    '@/lib/auth/actions': { authorizeCase: async () => ({ supabase }) },
    'next/cache': { revalidatePath: () => assert.fail('A denied write must not revalidate') },
  })
  const form = new FormData()
  form.set('caseId', 'case-id')
  form.set('photoType', 'Exterior')
  form.set('file', new File(['test'], 'test.png', { type: 'image/png' }))
  assert.match((await uploadEvidence(form, 'photos')).error, /locked/)
  assert.match((await deleteEvidence('photo-id', 'case-id', 'photos')).error, /locked/)
})

test('report generation rejects a photo ID from another case before loading or saving it', async () => {
  const { ApiError } = load('src/lib/api/errors.ts')
  const calls = []
  const supabase = { from: table => ({ select: () => ({ eq: (key, value) => ({ in: async (idKey, ids) => {
    calls.push({ table, key, value, ids }); return { data: [], error: null }
  } }) }) }) }
  const { POST } = load('src/app/api/generate-template-report/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/api/route': { ApiError, withApi: handler => request => handler(request, { supabase }) },
    '@/lib/reports/persistence': { reportCase: async () => ({ id: 'authorized-case', revision: 1 }), persistReport: () => assert.fail('Must not persist another case’s photo') },
    '@/lib/report-engine/templates': { findTemplate: () => ({ id: 'veritas', photoCount: 1, fields: [] }) },
    '@/lib/report-engine/report': { generateReport: () => assert.fail('Must not render unauthorized evidence') },
    '@/lib/reports/storage': { signFiles: () => assert.fail('Must not sign unauthorized evidence') },
  })
  const form = new FormData()
  form.set('case_id', 'authorized-case'); form.set('revision', '1')
  form.set('report_id', 'veritas'); form.set('data_json', '{}'); form.set('photo_id_0', 'another-case-photo')
  await assert.rejects(() => POST(new Request('http://localhost/api/generate-template-report', { method: 'POST', body: form })), /does not belong/)
  assert.deepEqual(calls, [{ table: 'case_photos', key: 'case_id', value: 'authorized-case', ids: ['another-case-photo'] }])
})
