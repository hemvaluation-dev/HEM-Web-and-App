const test = require('node:test')
const assert = require('node:assert/strict')
const { PNG } = require('pngjs')
const { edgeLoad } = require('./edge-load.cjs')
function service({ active = true, offline = false, claim = true, cacheAvailable = true } = {}) {
  let handler
  const calls = [], stored = new Map()
  const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'test-anon', SUPABASE_SERVICE_ROLE_KEY: 'test-service' }
  const fetch = async (url, init) => {
    const address = String(url)
    calls.push(address)
    if (address.includes('/auth/v1/user')) return Response.json({ id: 'test-user' })
    if (address.includes('/rest/v1/users')) return Response.json([{ is_active: active }])
    if (address.includes('/rpc/')) {
      if (!cacheAvailable) return Response.json({}, { status: 503 })
      const body = JSON.parse(init.body)
      if (address.endsWith('hem_mapping_cache_read')) return Response.json({ value: stored.get(body.p_key) ?? null, writable: true })
      if (address.endsWith('hem_mapping_claim_geocode')) return Response.json(claim)
      stored.set(body.p_key, body.p_value)
      return Response.json(true)
    }
    if (offline) throw new TypeError('network unavailable')
    if (address.includes('nominatim')) {
      assert.match(init.headers['User-Agent'], /HEMAssociates/)
      return Response.json({ display_name: 'QA address', address: { village: 'QA village', state: 'QA state', postcode: '533101' } })
    }
    assert.match(address, /tile\.openstreetmap\.org/)
    const tile = new PNG({ width: 256, height: 256 })
    tile.data.fill(180)
    for (let i = 3; i < tile.data.length; i += 4) tile.data[i] = 255
    return new Response(PNG.sync.write(tile), { headers: { 'Content-Type': 'image/png' } })
  }
  edgeLoad('../supabase/functions/google-geocode/index.ts', { env: { get: name => env[name] }, serve: fn => { handler = fn } }, fetch)
  return { calls, request: (body, authorization = 'Bearer test-session') => handler(new Request('https://example.supabase.co/functions/v1/google-geocode', { method: 'POST', headers: { ...(authorization ? { Authorization: authorization } : {}), 'Content-Type': 'application/json' }, body: JSON.stringify(body) })) }
}
const coordinates = { latitude: 17, longitude: 82, altitude: 10, accuracy: 5 }
test('OpenStreetMap returns an address without changing device GPS or requiring a Google key', async () => {
  const api = service()
  const response = await api.request({ ...coordinates, action: 'capture' })
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.deepEqual(body.coordinates, coordinates)
  assert.equal(body.address.formatted_address, 'QA address')
  assert.equal(body.address.city, 'QA village')
  assert.equal(body.provider, 'OpenStreetMap')
  assert.ok(body.amenities.hospital)
  assert.equal(api.calls.some(url => url.includes('googleapis')), false)
})
test('repeated geocoding uses persistent cache instead of another provider request', async () => {
  const api = service()
  await api.request(coordinates); await api.request(coordinates)
  assert.equal(api.calls.filter(url => url.includes('nominatim.openstreetmap')).length, 1)
})
for (const options of [{ offline: true }, { claim: false }, { cacheAvailable: false }]) {
  test(`GPS is retained when map lookup cannot run: ${JSON.stringify(options)}`, async () => {
    const api = service(options)
    const response = await api.request(coordinates)
    const body = await response.json()
    assert.equal(response.status, 200)
    assert.deepEqual(body.coordinates, coordinates)
    assert.equal(body.address, null)
    assert.match(body.warning, /GPS captured/)
    if (options.claim === false || options.cacheAvailable === false) assert.equal(api.calls.filter(url => url.includes('nominatim.openstreetmap')).length, 0)
  })
}
test('legacy mobile fetch/amenities contract works and amenities do not call a public POI server', async () => {
  const api = service()
  assert.equal((await api.request(coordinates)).status, 200)
  const response = await api.request({ ...coordinates, action: 'amenities' })
  assert.deepEqual(Object.keys(await response.json()).sort(), ['airport', 'bus_stop', 'highway', 'hospital', 'railway_station'])
  assert.equal(api.calls.some(url => /overpass|googleapis/.test(url)), false)
})
test('static map centers a GPS marker, embeds attribution and reuses tile cache', async () => {
  const api = service()
  const response = await api.request({ ...coordinates, action: 'static_map' })
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.match(body.attribution, /OpenStreetMap contributors/)
  const png = PNG.sync.read(Buffer.from(body.imageBase64, 'base64'))
  assert.equal(png.width, 256)
  assert.equal(png.height, 256)
  const center = (128 * 256 + 128) * 4
  assert.equal(png.data[center], 220)
  assert.equal(png.data[center + 1], 35)
  assert.equal(png.data[(250 * 256) * 4], 255)
  const tiles = api.calls.filter(url => url.includes('tile.openstreetmap')).length
  assert.ok(tiles > 0 && tiles <= 4)
  await api.request({ ...coordinates, action: 'static_map' })
  assert.equal(api.calls.filter(url => url.includes('tile.openstreetmap')).length, tiles)
})
test('authentication, active account and coordinate validation run before any OSM calls', async () => {
  for (const [api, body, token, status] of [
    [service(), coordinates, '', 401], [service({ active: false }), coordinates, 'Bearer test', 401],
    [service(), { latitude: 91, longitude: 82 }, 'Bearer test', 400], [service(), null, 'Bearer test', 400],
  ]) {
    assert.equal((await api.request(body, token)).status, status)
    assert.equal(api.calls.some(url => /openstreetmap/.test(url)), false)
  }
})
