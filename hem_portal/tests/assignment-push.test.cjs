const { test } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { edgeLoad } = require('./edge-load.cjs')
const dir = path.resolve(__dirname, '../../supabase/functions/assignment-push')
const id = '5d2508c9-a603-4d87-8069-9ba846720f99'
const account = JSON.stringify({ project_id: 'hem-test', client_email: 'sender@example.test', private_key: '-----BEGIN PRIVATE KEY-----\ninvalid\n-----END PRIVATE KEY-----' })
function load(fetch, configured = true, credentials = account) {
 const env = { get: key => ({ PUSH_WEBHOOK_SECRET: 'test-secret', FIREBASE_SERVICE_ACCOUNT_JSON: configured ? credentials : undefined, SUPABASE_URL: 'https://project.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'server-only' })[key] }
 return edgeLoad(path.join(dir, 'index.ts'), { env, serve: () => {} }, fetch).handlePush
}
const request = body => new Request('https://test.invalid', { method: 'POST', headers: { 'x-push-secret': 'test-secret' }, body: JSON.stringify(body) })
const response = data => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
test('public requests and absent configuration never touch the database/provider', async () => {
 const handle = load(() => { throw Error('Must not call') })
 assert.equal((await handle(new Request('https://test.invalid', { method: 'POST' }))).status, 401)
 assert.equal((await handle(request({ event_id: 'bad' }))).status, 400)
 assert.equal((await load(() => { throw Error('Must not call') }, false)(request({ event_id: id }))).status, 503)
})
test('duplicate events cannot dispatch twice', async () => {
 let calls = 0
 const handle = load(async url => { calls++; assert.match(url, /rpc\/hem_claim_assignment_push$/); return response([]) })
 assert.equal((await handle(request({ event_id: id }))).status, 200)
 assert.equal(calls, 1)
})
test('reassigned case skips sending to previous agent', async () => {
 const calls = []
 const handle = load(async (url, init) => {
  calls.push([url, init])
  if (url.includes('rpc/')) return response([{ id, case_id: id, user_id: id }])
  if (init.method === 'PATCH') { assert.equal(JSON.parse(init.body).status, 'skipped'); return response([]) }
  return response([])
 })
 assert.equal((await handle(request({ record: { id } }))).status, 200)
 assert.ok(calls.every(([url]) => !url.includes('googleapis')))
})
test('no registered devices means no OAuth or FCM requests', async () => {
 const handle = load(async (url, init) => {
  assert.ok(!url.includes('googleapis'))
  if (url.includes('rpc/')) return response([{ id, case_id: id, user_id: id }])
  if (url.includes('hem_push_devices') || init.method === 'PATCH') return response([])
  return response([{ id }])
 })
 assert.equal((await (await handle(request({ event_id: id }))).json()).status, 'no_devices')
})
test('provider authentication failure releases lease for bounded retry', async () => {
 let pending = false
 const handle = load(async (url, init) => {
  if (url.includes('rpc/')) return response([{ id, case_id: id, user_id: id }])
  if (url.includes('hem_push_devices')) return response([{ token: 'private-token' }])
  if (url.includes('hem_push_deliveries')) return response([])
  if (init.method === 'PATCH') { pending = JSON.parse(init.body).status === 'pending'; return response([]) }
  return response([{ id, attempts: 1 }])
 })
 assert.equal((await handle(request({ event_id: id }))).status, 503)
 assert.equal(pending, true)
})
test('lock-screen text has no customer information; only UNREGISTERED invalidates tokens', () => {
 const fcm = edgeLoad(path.join(dir, 'fcm.ts'), {}, fetch)
 const message = fcm.assignmentMessage({ id, case_id: id, applicant_name: 'SECRET CUSTOMER' }, 'token').message
 assert.ok(!JSON.stringify(message).includes('SECRET CUSTOMER'))
 assert.equal(message.android.notification.tag, id)
 assert.equal(fcm.invalidToken({error:{details:[{errorCode:'UNREGISTERED'}]}}), true)
 assert.equal(fcm.invalidToken({error:{details:[{errorCode:'INVALID_ARGUMENT'}]}}), false)
})

test('HTTP v1 success records delivery, removes unregistered device and finishes event', async () => {
 const { generateKeyPairSync } = require('node:crypto')
 const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
 const credentials = JSON.stringify({ project_id: 'hem-test', client_email: 'sender@example.test', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) })
 let sends = 0, recorded = 0, removed = 0, finished = false
 const handle = load(async (url, init) => {
  if (url.includes('oauth2')) return response({ access_token: 'ephemeral-test-access' })
  if (url.includes('fcm.googleapis')) {
   sends++
   const body = JSON.parse(init.body)
   if (body.message.token === 'expired-token') return new Response(JSON.stringify({ error: { details: [{ errorCode: 'UNREGISTERED' }] } }), { status: 404 })
   assert.equal(body.message.data.case_id, id)
   return response({ name: 'message-id' })
  }
  if (url.includes('rpc/')) return response([{ id, case_id: id, user_id: id }])
  if (url.includes('hem_push_deliveries')) {
   if (init.method === 'POST') { recorded++; return response([]) }
   return response([{ token: 'already-sent-token' }])
  }
  if (url.includes('hem_push_devices')) {
   if (init.method === 'DELETE') { removed++; return response([]) }
   return response([{ token: 'already-sent-token' }, { token: 'valid-token' }, { token: 'expired-token' }])
  }
  if (init.method === 'PATCH') { finished = JSON.parse(init.body).status === 'sent'; return response([]) }
  return response([{ id }])
 }, true, credentials)
 assert.equal((await handle(request({ event_id: id }))).status, 200)
 assert.equal(sends, 2)
 assert.equal(recorded, 1)
 assert.equal(removed, 1)
 assert.equal(finished, true)
})
