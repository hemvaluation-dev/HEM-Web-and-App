#!/usr/bin/env node
const fs = require('node:fs/promises')
const path = require('node:path')
const crypto = require('node:crypto')
const root = path.resolve(__dirname, '..')
const backup = path.resolve(process.env.HEM_BACKUP_DIR || path.join(root, '.secrets/supabase-backups/2026-10-22-cases'))
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
async function main() {
 const read = async name => JSON.parse(await fs.readFile(path.join(backup, name), 'utf8'))
 const manifest = await read('manifest.json')
 if (manifest.failures.length) throw new Error('Manifest contains failed downloads')
 const tables = {}
 for (const table of Object.keys(manifest.counts)) {
  tables[table] = await read('data/' + table + '.json')
  if (tables[table].length !== manifest.counts[table]) throw new Error('Row count mismatch: ' + table)
 }
 const auth = await read('auth-users-and-identities.json')
 const schema = await read('schema-catalog.json')
 if (!schema.tables?.length || !schema.functions?.length || !schema.policies?.length) throw new Error('Schema backup incomplete')
 const authIds = new Set(auth.users.map(user => user.id))
 const users = new Set(tables.users.map(user => user.id))
 const clients = new Set(tables.clients.map(client => client.id))
 const cases = new Set(tables.cases.map(record => record.id))
 if (cases.size !== tables.cases.length) throw new Error('Duplicate case IDs')
 for (const user of tables.users) if (!authIds.has(user.id)) throw new Error('Missing authentication user')
 for (const identity of auth.identities) if (!authIds.has(identity.user_id)) throw new Error('Orphan authentication identity')
 for (const record of tables.cases) {
  if (record.client_id && !clients.has(record.client_id)) throw new Error('Missing institution')
  for (const key of ['assigned_to', 'created_by', 'reviewer_id', 'valuator_id']) if (record[key] && !users.has(record[key])) throw new Error('Missing case user reference')
 }
 for (const [table, rows] of Object.entries(tables)) {
  if (!table.startsWith('case_') && table !== 'extracted_data') continue
  for (const row of rows) {
   if (row.case_id && !cases.has(row.case_id)) throw new Error('Orphan case record: ' + table)
   for (const key of ['actor_id', 'created_by']) if (row[key] && !users.has(row[key])) throw new Error('Missing related user')
  }
 }
 const files = new Map()
 for (const file of manifest.files) {
  const bytes = await fs.readFile(path.join(backup, 'storage', file.bucket, file.name))
  if (bytes.length !== file.bytes || hash(bytes) !== file.sha256) throw new Error('File checksum mismatch')
  files.set(file.bucket + '/' + file.name, file)
 }
 for (const report of tables.case_reports) {
  const file = files.get('reports/' + report.storage_path)
  if (!file) throw new Error('Missing report bytes')
  if (report.sha256 && report.sha256 !== file.sha256) throw new Error('Generated report checksum differs from stored report record')
 }
 const checksums = []
 async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
   const full = path.join(dir, entry.name)
   if (entry.isDirectory()) await walk(full)
   else if (!['SHA256SUMS.json', 'verification.json'].includes(entry.name)) {
    const bytes = await fs.readFile(full)
    checksums.push({ path: path.relative(backup, full), bytes: bytes.length, sha256: hash(bytes) })
   }
  }
 }
 await walk(backup)
 await fs.writeFile(path.join(backup, 'SHA256SUMS.json'), JSON.stringify(checksums, null, 2) + '\n', { mode: 0o600 })
 const result = { verifiedAt: new Date().toISOString(), sourceProject: manifest.sourceProject, counts: manifest.counts, authUsers: auth.users.length, identities: auth.identities.length, passwordHashes: auth.users.filter(user => !!user.encrypted_password).length, storageFiles: manifest.files.length, storageBytes: manifest.bytes, verifiedBackupFiles: checksums.length, schemaTables: schema.tables.length, schemaFunctions: schema.functions.length, result: 'PASS' }
 await fs.writeFile(path.join(backup, 'verification.json'), JSON.stringify(result, null, 2) + '\n', { mode: 0o600 })
 console.log(JSON.stringify(result))
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
