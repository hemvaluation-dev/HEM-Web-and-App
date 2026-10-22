const assert = require('node:assert/strict')
const base = process.env.PORTAL_SMOKE_URL || 'http://127.0.0.1:3100'

async function main() {
  const health = await fetch(base + '/api/health')
  assert.equal(health.status, 200, 'Liveness endpoint')
  assert.equal((await health.json()).status, 'ok')
  assert.equal(health.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(health.headers.get('x-frame-options'), 'DENY')
  assert.equal(health.headers.get('x-powered-by'), null)
  console.log('PASS production liveness and security headers')

  const session = await fetch(base + '/api/v1/session')
  assert.equal(session.status, 401, 'Unauthenticated session API')
  assert.ok(session.headers.get('x-request-id'))
  assert.equal(session.headers.get('cache-control'), 'no-store')
  console.log('PASS API authorization and response contract')

  const page = await fetch(base + '/dashboard', { redirect: 'manual' })
  assert.equal(page.status, 307, 'Protected dashboard redirect')
  assert.equal(new URL(page.headers.get('location'), base).pathname, '/login')
  const login = await fetch(base + '/login')
  assert.equal(login.status, 200, 'Login page')
  const asset = (await login.text()).match(/src="([^"]*\/_next\/static\/[^"]+)"/)
  assert.ok(asset, 'Login must reference a production JavaScript asset')
  assert.equal((await fetch(new URL(asset[1], base))).status, 200, 'Production JavaScript asset')
  console.log('PASS login, protected-page redirect and production static assets')

  for (const route of ['/api/export-cases', '/api/export-mis', '/api/export-team']) {
    assert.equal((await fetch(base + route)).status, 401, route)
  }
  console.log('PASS protected export endpoints')
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
