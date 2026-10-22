const fs = require('node:fs')
const path = require('node:path')
const output = path.resolve('.next/standalone')
if (process.env.VERCEL) {
  console.log('Skipping standalone preparation on Vercel.')
  process.exit(0)
}

if (!fs.existsSync(path.join(output, 'server.js'))) throw new Error('Standalone server output is missing.')
fs.cpSync(path.resolve('public'), path.join(output, 'public'), { recursive: true })
fs.cpSync(path.resolve('.next/static'), path.join(output, '.next/static'), { recursive: true })
console.log('Standalone bundle includes public files and compiled static assets.')
