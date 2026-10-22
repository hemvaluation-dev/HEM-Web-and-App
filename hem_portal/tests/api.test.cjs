const test = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('./load.cjs')
function setup({ user = { id: 'test-user' }, profile = { role: 'owner' } } = {}) {
  const client = { auth: { getUser: async () => ({ data: { user }, error: null }) }, from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: profile }) }) }) }) }
  return load('src/lib/api/route.ts', { '@/utils/supabase/server': { createClient: async () => client }, '@supabase/supabase-js': { createClient: () => client }, 'next/server': { NextResponse: Response } })
}

test('unauthenticated requests never invoke the handler', async () => {
  const { withApi } = setup({ user: null }); let called = false
  const res = await withApi(async () => { called = true; return new Response('ok') })(new Request('http://localhost/api/test'))
  assert.equal(res.status, 401); assert.equal(called, false); assert.equal((await res.json()).code, 'UNAUTHENTICATED')
})
test('missing profiles do not get owner privileges', async () => {
  const { withApi } = setup({ profile: null })
  const res = await withApi(async () => new Response('ok'))(new Request('http://localhost/api/test'))
  assert.equal(res.status, 403); assert.equal((await res.json()).code, 'PROFILE_REQUIRED')
})
test('disabled accounts never invoke protected handlers', async () => {
  const { withApi } = setup({ profile: { role: 'owner', is_active: false } })
  let called = false
  const res = await withApi(async () => { called = true; return new Response('ok') })(new Request('http://localhost/api/test'))
  assert.equal(res.status, 403); assert.equal(called, false)
  assert.equal((await res.json()).code, 'ACCOUNT_DISABLED')
})
test('malformed authorization does not fall back to a valid cookie session', async () => {
  for (const authorization of ['Basic test', 'Bearer ', 'Bearer one two']) {
    const { withApi } = setup()
    const res = await withApi(async () => new Response('ok'))(new Request('http://localhost/api/test', { headers: { Authorization: authorization } }))
    assert.equal(res.status, 401)
  }
})
test('owner-only export rejects another authenticated role', async () => {
  const { withApi } = setup({ profile: { role: 'field_agent' } })
  const res = await withApi(async () => new Response('ok'), { roles: ['owner'] })(new Request('http://localhost/api/test'))
  assert.equal(res.status, 403)
})
test('cross-origin cookie mutations are rejected', async () => {
  const { withApi } = setup()
  const res = await withApi(async () => new Response('ok'))(new Request('http://localhost/api/test', { method: 'POST', headers: { Origin: 'https://another-site.test' } }))
  assert.equal(res.status, 403); assert.equal((await res.json()).code, 'INVALID_ORIGIN')
})
test('verified bearer requests and binary download headers are supported', async () => {
  const { withApi } = setup()
  const res = await withApi(async () => new Response(new Uint8Array([1, 2, 3]), { headers: { 'Content-Type': 'application/pdf' } }))(new Request('http://localhost/api/test', { headers: { Authorization: 'Bearer test' } }))
  assert.equal(res.status, 200); assert.equal(res.headers.get('content-type'), 'application/pdf'); assert.equal(res.headers.get('cache-control'), 'no-store'); assert.ok(res.headers.get('x-request-id')); assert.equal((await res.arrayBuffer()).byteLength, 3)
})
test('legacy server errors do not disclose internal details', async () => {
  const { withApi } = setup()
  const res = await withApi(async () => Response.json({ error: 'database secret detail' }, { status: 500 }))(new Request('http://localhost/api/test'))
  const data = await res.json(); assert.equal(res.status, 500); assert.ok(!data.error.includes('secret')); assert.ok(data.requestId)
})
test('malformed request JSON has a client-error response', async () => {
  const { withApi } = setup()
  const res = await withApi(async req => { await req.json(); return new Response('ok') })(new Request('http://localhost/api/test', { method: 'POST', body: '{' }))
  assert.equal(res.status, 400); assert.equal((await res.json()).code, 'INVALID_JSON')
})
test('submitted inspections are not counted as completed reports', () => {
  const { caseStage } = load('src/lib/cases/status.ts')
  for (const status of ['submitted', 'field_visit_done', 'site_inspected']) assert.equal(caseStage(status), 'Field submitted')
  assert.equal(caseStage('under_review'), 'In review')
  for (const status of ['completed', 'delivered']) assert.equal(caseStage(status), 'Completed')
  assert.equal(caseStage('photos_uploaded'), 'Inspection')
})
