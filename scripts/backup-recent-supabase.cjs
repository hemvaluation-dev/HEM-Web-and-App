#!/usr/bin/env node
// Read-only source backup. Credentials are loaded locally and never written to exports.
const fs = require('node:fs/promises')
const path = require('node:path')
const crypto = require('node:crypto')
const dotenv = require('../hem_portal/node_modules/dotenv')
const root = path.resolve(__dirname, '..')
const backup = path.resolve(process.env.HEM_BACKUP_DIR || path.join(root, '.secrets/supabase-backups/2026-10-22-cases'))
const start = '2026-10-20T18:30:00Z'
const end = '2026-10-22T18:30:00Z'
const expectedProject = 'osvuyzhaucjrtdhqrmlx'
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
let env, base, key
async function request(route, options = {}) {
 for (let attempt = 0; attempt < 3; attempt++) {
  try {
   const response = await fetch(base + route, { ...options, redirect: 'error', signal: AbortSignal.timeout(90000), headers: { apikey: key, Authorization: 'Bearer ' + key, ...options.headers } })
   if (!response.ok) {
    const error = new Error(`Source request failed: HTTP ${response.status}`)
    if (response.status < 500 && response.status !== 429) { error.permanent = true; throw error }
    throw error
   }
   return response
  } catch (error) {
   if (error.permanent || attempt === 2) throw error
   await sleep((attempt + 1) * 1000)
  }
 }
}
async function save(name, value) {
 const target = path.join(backup, name)
 await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o700 })
 await fs.writeFile(target, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 })
}
async function rows(table, query = '', persist = true) {
 const all = []
 for (let offset = 0; ; offset += 1000) {
  const response = await request('/rest/v1/' + table + '?select=*' + query + '&order=id&limit=1000&offset=' + offset)
  const batch = await response.json()
  all.push(...batch)
  if (batch.length < 1000) break
 }
 if (persist) await save('data/' + table + '.json', all)
 return all
}
function safePath(bucket, name) {
 if (!/^[a-zA-Z0-9_-]+$/.test(bucket)) throw new Error('Invalid bucket')
 const target = path.resolve(backup, 'storage', bucket, name)
 const prefix = path.resolve(backup, 'storage', bucket) + path.sep
 if (!target.startsWith(prefix)) throw new Error('Unsafe storage object path')
 return target
}
function storageRef(value) {
 if (typeof value !== 'string') return null
 try {
  const url = new URL(value)
  if (url.origin !== base) return null
  const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public\/|sign\/|authenticated\/)?([^/]+)\/(.+)$/)
  return match ? { bucket: decodeURIComponent(match[1]), name: decodeURIComponent(match[2]) } : null
 } catch { return null }
}
function collectReferences(value, refs) {
 if (typeof value === 'string') {
  const ref = storageRef(value)
  if (ref) refs.set(ref.bucket + '/' + ref.name, ref)
 } else if (Array.isArray(value)) value.forEach(item => collectReferences(item, refs))
 else if (value && typeof value === 'object') Object.values(value).forEach(item => collectReferences(item, refs))
}
async function main() {
 env = dotenv.parse(await fs.readFile(path.join(root, 'hem_portal/.env.local')))
 base = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
 key = env.SUPABASE_SERVICE_ROLE_KEY || env.SERVICE_ROLE
 if (base !== `https://${expectedProject}.supabase.co` || !key) throw new Error('Protected source project credentials are unavailable or point to another project')
 await fs.mkdir(backup, { recursive: true, mode: 0o700 })
 const cases = await rows('cases', '&created_at=gte.' + start + '&created_at=lt.' + end)
 if (!cases.length) throw new Error('No cases selected; verify the date range')
 const selected = new Set(cases.map(row => row.id))
 const filter = '&case_id=in.(' + cases.map(row => row.id).join(',') + ')'
 const data = { cases }
 for (const table of ['clients', 'users', 'attendance', 'leaves']) data[table] = await rows(table)
 for (const table of ['case_location', 'case_photos', 'case_documents', 'case_reports', 'case_field_data', 'extracted_data', 'case_events']) data[table] = await rows(table, filter)
 const metadata = JSON.parse(await fs.readFile(path.join(backup, 'source-storage-metadata.json'), 'utf8'))
 const refs = new Map()
 collectReferences(data, refs)
 for (const report of data.case_reports) {
  if (report.storage_path) refs.set('reports/' + report.storage_path, { bucket: 'reports', name: report.storage_path })
 }
 for (const object of metadata.objects) {
  if (selected.has(object.name.split('/')[0])) refs.set(object.bucket_id + '/' + object.name, { bucket: object.bucket_id, name: object.name })
 }
 const lookup = new Map(metadata.objects.map(object => [object.bucket_id + '/' + object.name, object]))
 const results = [], failures = []
 const queue = [...refs.values()]
 async function worker() {
  for (;;) {
   const ref = queue.shift()
   if (!ref) return
   try {
    const response = await request('/storage/v1/object/authenticated/' + encodeURIComponent(ref.bucket) + '/' + ref.name.split('/').map(encodeURIComponent).join('/'))
    const bytes = Buffer.from(await response.arrayBuffer())
    const object = lookup.get(ref.bucket + '/' + ref.name)
    const expected = Number(object?.metadata?.size)
    if (Number.isFinite(expected) && expected > 0 && expected !== bytes.length) throw new Error('Object size does not match source metadata')
    const sha256 = crypto.createHash('sha256').update(bytes).digest('hex')
    const target = safePath(ref.bucket, ref.name)
    await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o700 })
    await fs.writeFile(target, bytes, { mode: 0o600 })
    const persisted = await fs.readFile(target)
    if (crypto.createHash('sha256').update(persisted).digest('hex') !== sha256) throw new Error('Saved object checksum mismatch')
    results.push({ ...ref, bytes: bytes.length, sha256, contentType: response.headers.get('content-type'), sourceObject: object || null })
   } catch (error) { failures.push({ ...ref, error: error.message }) }
   if ((results.length + failures.length) % 20 === 0) console.log(`Files processed: ${results.length + failures.length}/${refs.size}`)
  }
 }
 await Promise.all([worker(), worker(), worker()])
 const manifest = { version: 1, sourceProject: expectedProject, createdAt: new Date().toISOString(), selection: { startInclusive: start, endExclusive: end, timezone: 'Asia/Kolkata' }, counts: Object.fromEntries(Object.entries(data).map(([table, value]) => [table, value.length])), files: results.sort((a,b) => (a.bucket+'/'+a.name).localeCompare(b.bucket+'/'+b.name)), failures, bytes: results.reduce((sum,item) => sum+item.bytes,0) }
 await save('manifest.json', manifest)
 console.log(JSON.stringify({ backup, counts: manifest.counts, files: results.length, failures: failures.length, bytes: manifest.bytes }))
 if (failures.length) process.exitCode = 1
}
async function verifySnapshot() {
 env = dotenv.parse(await fs.readFile(path.join(root, 'hem_portal/.env.local')))
 base = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
 key = env.SUPABASE_SERVICE_ROLE_KEY || env.SERVICE_ROLE
 if (base !== `https://${expectedProject}.supabase.co` || !key) throw new Error('Source credentials do not match')
 const manifest = JSON.parse(await fs.readFile(path.join(backup, 'manifest.json'), 'utf8'))
 const currentCases = await rows('cases', '&created_at=gte.' + start + '&created_at=lt.' + end, false)
 const filter = '&case_id=in.(' + currentCases.map(row => row.id).join(',') + ')'
 const changed = []
 function stable(value) {
  if (Array.isArray(value)) return value.map(stable)
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key,stable(value[key])]))
  return value
 }
 for (const table of Object.keys(manifest.counts)) {
  const local = JSON.parse(await fs.readFile(path.join(backup,'data',table+'.json'),'utf8'))
  const current = table === 'cases' ? currentCases : await rows(table, ['clients','users','attendance','leaves'].includes(table) ? '' : filter, false)
  if (JSON.stringify(stable(local)) !== JSON.stringify(stable(current))) changed.push(table)
 }
 const result = { checkedAt: new Date().toISOString(), changedTables: changed, stable: changed.length === 0 }
 await save('source-stability.json', result)
 console.log(JSON.stringify(result))
 if (changed.length) process.exitCode = 1
}
(process.argv.includes('--verify-source') ? verifySnapshot() : main()).catch(error => { console.error(error.message); process.exitCode = 1 })
