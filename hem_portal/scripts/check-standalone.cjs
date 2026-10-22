const { createRequire } = require('node:module')
const { pathToFileURL } = require('node:url')
const path = require('node:path')
const assert = require('node:assert/strict')

async function main() {
  if (process.env.VERCEL) {
    console.log('Skipping standalone verification on Vercel.')
    return
  }

  const bundledRequire = createRequire(path.resolve('.next/standalone/server.js'))
  const React = bundledRequire('react')
  const { Document, Page, Text, renderToBuffer } = await import(pathToFileURL(bundledRequire.resolve('@react-pdf/renderer')).href)
  const document = React.createElement(Document, null,
    React.createElement(Page, null, React.createElement(Text, { style: { fontFamily: 'Helvetica' } }, 'HEM production bundle verification')))
  const bytes = await renderToBuffer(document)
  assert.equal(bytes.subarray(0, 4).toString(), '%PDF')
  assert.ok(bytes.length > 500)
  console.log('PASS standalone PDF rendering, including packaged standard fonts.')
}
main().catch(error => { console.error('Standalone PDF verification failed:', error.message); process.exitCode = 1 })
