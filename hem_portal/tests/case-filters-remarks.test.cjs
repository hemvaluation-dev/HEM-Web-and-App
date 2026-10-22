const test = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('./load.cjs')
const { filterCases, caseMonthOptions } = load('src/lib/cases/filters.ts')

test('filters OR selected values, AND dimensions, and use Indian calendar months', () => {
  const rows = [
    { id: 'one', state: 'AP', assigned_to: 'a', client_id: 'x', status: 'assigned', created_at: '2026-09-30T18:30:00Z' },
    { id: 'two', state: 'TS', assigned_to: 'b', client_id: 'y', status: 'completed', created_at: '2026-11-02T00:00:00Z' },
    { id: 'three', state: 'AP', assigned_to: 'c', client_id: 'x', status: 'assigned', created_at: '2026-09-30T18:29:59Z' },
    { id: 'four', state: 'AP', assigned_to: 'a', client_id: 'x', status: 'assigned', created_at: '2025-10-01T00:00:00Z' },
  ]
  assert.deepEqual(filterCases(rows, { state: 'AP,TS', agent: 'a,b', bank: 'x,y', status: 'active,completed', month: '2026-10,2026-11' }).map(r => r.id), ['one', 'two'])
  assert.deepEqual(filterCases(rows, { month: '2026-10,2026-11', to: '2026-10-31' }).map(r => r.id), ['one'])
  assert.deepEqual(filterCases(rows, { month: '2025-10' }).map(r => r.id), ['four'])
  assert.equal(filterCases(rows, {}).length, 4)
  assert.deepEqual(caseMonthOptions(rows).map(o => o.id), ['2026-11', '2026-10', '2026-09', '2025-10'])
})

test('MIS includes the customer response and emits an empty cell for an unset remark', async () => {
  const cases = [
    { id: '1', created_at: '2026-10-01T00:00:00Z', customer_response_remark: 'Customer requested a call, tomorrow' },
    { id: '2', created_at: '2026-10-02T00:00:00Z', customer_response_remark: null },
  ]
  const supabase = { from: table => ({ select: () => table === 'cases' ? { order: async () => ({ data: cases, error: null }) } : Promise.resolve({ data: [], error: null }) }) }
  const { GET } = load('src/app/api/export-mis/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/api/route': { withApi: handler => req => handler(req, { supabase }) },
  })
  const response = await GET(new Request('http://localhost/api/export-mis?month=2026-10'))
  const lines = (await response.text()).split('\r\n')
  assert.ok(lines[0].endsWith('"Customer Response Remark"'))
  assert.ok(lines[1].endsWith('"Customer requested a call, tomorrow"'))
  assert.ok(lines[2].endsWith(',""'))
})

test('remark saves are scoped to the authorized case and detect concurrent edits', async () => {
  let found = true
  const mutations = []
  const query = { eq: () => query, is: () => query, select: () => query, maybeSingle: async () => ({ data: found ? { id: 'case' } : null, error: null }) }
  const { saveCustomerResponseRemark } = load('src/app/(main)/dashboard/cases/[id]/actions.ts', {
    '@/lib/auth/actions': { authorizeCase: async id => {
      assert.equal(id, 'case')
      return { supabase: { from: table => { assert.equal(table, 'cases'); return { update: data => { mutations.push(data); return query } } } } }
    } },
    'next/cache': { revalidatePath: () => {} },
  })
  assert.deepEqual(await saveCustomerResponseRemark('case', '  Called back  ', ''), { success: true })
  assert.deepEqual(mutations[0], { customer_response_remark: 'Called back' })
  await saveCustomerResponseRemark('case', ' ', 'Called back')
  assert.deepEqual(mutations[1], { customer_response_remark: null })
  found = false
  assert.match((await saveCustomerResponseRemark('case', 'new', 'old')).error, /changed by another user/)
  assert.match((await saveCustomerResponseRemark('case', 'x'.repeat(2001), '')).error, /2000/)
})
