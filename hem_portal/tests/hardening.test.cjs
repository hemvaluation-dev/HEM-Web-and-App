const test = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('./load.cjs')

test('CSV preserves column boundaries, quotes, Unicode, zeroes and neutralizes formulas', () => {
  const { serializeCsv } = load('src/lib/exports/csv.ts')
  assert.equal(serializeCsv(['Name', 'Notes', 'Count'], [['தமிழ், "name"', '\n=HYPERLINK("evil")', 0]]),
    '\uFEFF"Name","Notes","Count"\r\n"தமிழ், ""name""","\'\n=HYPERLINK(""evil"")","0"')
  assert.throws(() => serializeCsv(['a', 'b'], [['only one']]), /column headers/)
  assert.match(serializeCsv(['a'], [['+cmd']]), /'\+cmd/)
})

test('date filtering uses inclusive Indian business dates across UTC midnight', () => {
  const { filterCases } = load('src/lib/cases/filters.ts')
  const cases = [
    { id: 'before', created_at: '2026-09-24T18:29:59.999Z' },
    { id: 'first', created_at: '2026-09-24T18:30:00Z' },
    { id: 'last', created_at: '2026-09-25T18:29:59.999Z' },
    { id: 'after', created_at: '2026-09-25T18:30:00Z' },
    { id: 'unknown', created_at: null },
  ]
  assert.deepEqual(filterCases(cases, { from: '2026-09-25', to: '2026-09-25' }).map(item => item.id), ['first', 'last'])
  assert.deepEqual(filterCases(cases, { from: 'bad-date' }), [])
})

test('report image URL checks block internal URLs, unrelated projects and redirects to other endpoints', () => {
  const { storageImageUrl } = load('src/lib/reports/images.ts')
  const origin = 'https://workspace.supabase.co'
  for (const url of ['http://127.0.0.1/secret', 'https://169.254.169.254/metadata',
    'https://other.supabase.co/storage/v1/object/public/images/a.jpg',
    `${origin}/rest/v1/users`, `${origin}/storage/v1/object/public/../../../auth/v1`,
    'https://user:password@workspace.supabase.co/storage/v1/object/public/images/a.jpg']) {
    assert.throws(() => storageImageUrl(url, origin), { code: 'INVALID_IMAGE_URL' })
  }
  assert.equal(storageImageUrl(`${origin}/storage/v1/object/public/images/a.jpg`, origin).origin, origin)
})

test('report images decode and normalize locally; SVG and invalid image bytes are rejected', async () => {
  const { reportImage } = load('src/lib/reports/images.ts')
  const sharp = require('sharp')
  const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#fff' } }).png().toBuffer()
  const result = await reportImage(`data:image/png;base64,${png.toString('base64')}`)
  assert.equal((await sharp(result).metadata()).format, 'jpeg')
  await assert.rejects(reportImage('data:image/svg+xml;base64,PHN2Zz4='), { code: 'INVALID_IMAGE' })
  await assert.rejects(reportImage('data:image/png;base64,bm90IGFuIGltYWdl'), { code: 'INVALID_IMAGE' })
})

test('streamed body limits reject oversized input without trusting Content-Length', async () => {
  const { boundedRequest, readJsonObject } = load('src/lib/api/body.ts')
  const oversized = new Request('http://localhost/api/report', { method: 'POST', body: '123456', headers: { 'Content-Length': '1' } })
  await assert.rejects(boundedRequest(oversized, 5), { status: 413 })
  await assert.rejects(readJsonObject(new Request('http://localhost/api/report', { method: 'POST', body: '[]' })), { code: 'INVALID_BODY' })
})

test('review workflow forbids skipped stages, unauthorized approval and reopening completion', () => {
  const { nextCaseStatus } = load('src/lib/cases/workflow.ts')
  const owner = { role: 'owner' }, agent = { role: 'field_agent' }
  assert.throws(() => nextCaseStatus('assigned', 'completed', owner), { status: 409 })
  assert.throws(() => nextCaseStatus('in_review', 'completed', agent), { status: 403 })
  assert.throws(() => nextCaseStatus('completed', 'in_progress', owner), { status: 409 })
  assert.equal(nextCaseStatus('pending_review', 'report_drafted', owner), 'report_drafted')
  assert.equal(nextCaseStatus('reviewed', 'delivered', owner), 'completed')
  assert.equal(nextCaseStatus('report_drafted', 'completed', {role:'valuator'}), 'completed')
  assert.throws(() => nextCaseStatus('report_drafted', 'in_review', owner), {status:409})
  assert.throws(() => nextCaseStatus('submitted', 'report_drafted', agent), { status: 403 })
  assert.equal(nextCaseStatus('submitted', 'report_drafted', { role: 'valuator' }), 'report_drafted')
})

test('leave reviews enforce both approval stages, no self-approval, and valid dates', () => {
  const { nextLeaveStatus, validLeaveDates } = load('src/lib/leaves/policy.ts')
  const owner = { role: 'owner' }, manager = { role: 'manager' }
  assert.equal(nextLeaveStatus('pending', 'approved', manager, false), 'pending_owner')
  assert.equal(nextLeaveStatus('pending_owner', 'approved', owner, false), 'approved')
  assert.throws(() => nextLeaveStatus('pending_owner', 'rejected', manager, false), { status: 403 })
  assert.throws(() => nextLeaveStatus('approved', 'rejected', owner, false), { status: 409 })
  assert.throws(() => nextLeaveStatus('pending', 'approved', owner, true), { status: 403 })
  assert.throws(() => nextLeaveStatus('pending', 'approved', { role: 'field_agent' }, false), { status: 403 })
  assert.equal(validLeaveDates('2026-02-29', '2026-03-01'), false)
  assert.equal(validLeaveDates('2026-09-26', '2026-09-25'), false)
  assert.equal(validLeaveDates('2028-02-29', '2028-03-01'), true)
})

test('capacity guard rejects overload and releases slots even after a failure', async () => {
  const { withCapacity } = load('src/lib/api/capacity.ts')
  let releaseFirst, releaseSecond
  const first = withCapacity('report', () => new Promise(resolve => { releaseFirst = resolve }))
  const second = withCapacity('report', () => new Promise(resolve => { releaseSecond = resolve }))
  await assert.rejects(withCapacity('report', async () => 'unexpected'), { status: 429 })
  releaseFirst('first')
  releaseSecond('second')
  assert.equal(await first, 'first')
  assert.equal(await second, 'second')
  await assert.rejects(withCapacity('report', async () => { throw new Error('failed') }), /failed/)
  assert.equal(await withCapacity('report', async () => 'recovered'), 'recovered')
})
