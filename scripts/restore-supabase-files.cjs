#!/usr/bin/env node
// Restore only allowlisted, checksum-verified files from the private HEM backup.
const fs = require('node:fs/promises')
const path = require('node:path')
const crypto = require('node:crypto')
const dotenv = require('../hem_portal/node_modules/dotenv')
const { createClient } = require('../hem_portal/node_modules/@supabase/supabase-js')
const root = path.resolve(__dirname, '..')
const backup = path.join(root, '.secrets/supabase-backups/2026-10-22-cases')
const project = 'gwqfwtcxlwcmglrozshc'
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
async function main() {
 const env = dotenv.parse(await fs.readFile(path.join(root, '.secrets/supabase-new-project.env')))
 const key = env.SUPABASE_SERVICE_ROLE_KEY
 if (!key || key.startsWith('sb_publishable_')) throw Error('A protected destination server key is required')
 const client = createClient(`https://${project}.supabase.co`, key, { auth: { persistSession: false, autoRefreshToken: false } })
 const manifest = JSON.parse(await fs.readFile(path.join(backup, 'manifest.json')))
 const meta = JSON.parse(await fs.readFile(path.join(backup, 'source-storage-metadata.json')))
 const listed = await client.storage.listBuckets()
 if (listed.error) throw Error('Destination bucket access failed: ' + listed.error.message)
 for (const bucket of meta.buckets) {
  const existing = listed.data.find(item => item.id === bucket.id)
  if (existing) {
   if (existing.public) throw Error('Destination bucket unexpectedly public')
   continue
  }
  const created = await client.storage.createBucket(bucket.id, { public: false, fileSizeLimit: bucket.file_size_limit || undefined, allowedMimeTypes: bucket.allowed_mime_types || undefined })
  if (created.error) throw Error('Could not create private bucket: ' + bucket.id)
 }
 const results = [], failures = [], queue = [...manifest.files]
 async function worker() {
  for (;;) {
   const file = queue.shift()
   if (!file) return
   try {
    const bytes = await fs.readFile(path.join(backup, 'storage', file.bucket, file.name))
    if (bytes.length !== file.bytes || hash(bytes) !== file.sha256) throw Error('Local checksum mismatch')
    let verified = false
    for (let attempt = 0; attempt < 3; attempt++) {
     const uploaded = await client.storage.from(file.bucket).upload(file.name, bytes, { contentType: file.contentType || file.sourceObject?.metadata?.mimetype || 'application/octet-stream', upsert: false })
     if (uploaded.error && !['409','400'].includes(String(uploaded.error.statusCode))) {
      if (attempt < 2) continue
      throw Error('Upload failed')
     }
     const downloaded = await client.storage.from(file.bucket).download(file.name)
     if (downloaded.error) { if (attempt < 2) continue; throw Error('Read-back verification failed') }
     const saved = Buffer.from(await downloaded.data.arrayBuffer())
     if (saved.length !== file.bytes || hash(saved) !== file.sha256) throw Error('Destination collision or checksum mismatch; object was not overwritten')
     verified = true
     break
    }
    if (!verified) throw Error('Destination object could not be verified')
    results.push({ bucket: file.bucket, name: file.name, bytes: file.bytes, sha256: file.sha256 })
   } catch (error) { failures.push({ bucket: file.bucket, name: file.name, error: error.message }) }
   if ((results.length + failures.length) % 20 === 0) console.log(`Destination files verified: ${results.length}/${manifest.files.length}; failures: ${failures.length}`)
  }
 }
 await Promise.all([worker(), worker(), worker()])
 const result = { destinationProject: project, verifiedAt: new Date().toISOString(), files: results, failures, bytes: results.reduce((sum,f) => sum+f.bytes,0) }
 await fs.writeFile(path.join(backup, 'destination-file-verification.json'), JSON.stringify(result, null, 2), { mode: 0o600 })
 console.log(JSON.stringify({ destination: project, verifiedFiles: results.length, failures: failures.length, bytes: result.bytes }))
 if (failures.length) process.exitCode = 1
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
