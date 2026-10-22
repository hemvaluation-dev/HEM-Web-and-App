const test = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('./load.cjs')
for (const available of [true, false]) {
  test(`portal stores original GPS when OpenStreetMap lookup is ${available ? 'available' : 'offline'}`, async () => {
    let saved
    const database = {
      functions: { invoke: async () => { if (!available) throw new Error('offline'); return { data: { address: { formatted_address: 'QA address', city: 'QA city' } } } } },
      from: table => table === 'case_location' ? { upsert: async value => { saved = value; return {} } } : { update: () => ({ eq: () => ({ in: async () => ({}) }) }) },
    }
    const { captureLocation } = load('src/app/(main)/dashboard/cases/[id]/actions.ts', {
      'next/cache': { revalidatePath() {} },
      '@/lib/auth/actions': { authorizeCase: async () => ({ supabase: database }) },
    })
    const result = await captureLocation('413ee8ab-4fb2-42e7-9c1a-f0113ca1da3c', 16.99, 81.78, 5)
    assert.equal(result.success, true)
    assert.equal(saved.latitude, 16.99)
    assert.equal(saved.longitude, 81.78)
    assert.equal(saved.accuracy, 5)
    assert.equal(saved.address_from_gps, available ? 'QA address' : '')
    assert.equal(Object.keys(saved).some(key => key.startsWith('nearest_')), false)
  })
}
