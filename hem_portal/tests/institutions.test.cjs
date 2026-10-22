const test = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('./load.cjs')

function action(accessError = null) {
  const writes = []
  const dependencies = {
    '@/lib/cases/evidence': {}, '@/lib/reports/storage': {}, '@/lib/cases/data': {},
    '@/lib/report-engine/templates': {}, '@/utils/supabase/server': {},
    '@/lib/auth/actions': { authorizeAction: async scope => { assert.equal(scope, 'owner'); return accessError } },
    'next/cache': { revalidatePath: () => {} },
    '@supabase/supabase-js': { createClient: () => ({ from: table => ({
      update: values => ({ eq: (column, id) => ({ select: () => ({ single: async () => {
        writes.push({ table, values, column, id })
        return { data: { id, ...values, template_name: 'veritas' }, error: null }
      } }) }) }),
    }) }) },
  }
  return { ...load('src/app/(main)/admin/actions.ts', dependencies), writes }
}

test('renaming a built-in institution updates only its name, preserving its ID and template', async () => {
  const { renameClientBank, writes } = action()
  const id = '0c323ab6-866e-4fcc-89e3-5e202632c85e'
  const result = await renameClientBank(id, '  Veritas Housing Finance  ')
  assert.equal(result.client.template_name, 'veritas')
  assert.equal(result.client.id, id)
  assert.deepEqual(writes, [{ table: 'clients', values: { name: 'Veritas Housing Finance' }, column: 'id', id }])
})

test('unauthorized and invalid institution renames cannot write', async () => {
  const blocked = action('Permission denied')
  assert.equal((await blocked.renameClientBank('id', 'Name')).error, 'Permission denied')
  assert.equal(blocked.writes.length, 0)
  const allowed = action()
  assert.ok((await allowed.renameClientBank('invalid', 'Name')).error)
  const id = '0c323ab6-866e-4fcc-89e3-5e202632c85e'
  for (const name of ['', '   ', 'a'.repeat(151)]) assert.ok((await allowed.renameClientBank(id, name)).error)
  assert.equal(allowed.writes.length, 0)
})
