const { ESLint } = require('eslint')
const path = require('node:path')
const baseline = require('../quality/lint-baseline.json')

async function main() {
  const eslint = new ESLint()
  const results = await eslint.lintFiles(['.'])
  const current = {}
  let errors = 0, warnings = 0
  for (const result of results) {
    for (const message of result.messages) {
      const file = path.relative(process.cwd(), result.filePath).split(path.sep).join('/')
      const key = `${file}::${message.ruleId || 'parser'}::${message.severity}`
      current[key] = (current[key] || 0) + 1
      if (message.severity === 2) errors++; else warnings++
    }
  }
  const regressions = Object.entries(current).filter(([key, count]) => count > (baseline[key] || 0))
  console.log(`Legacy lint debt: ${errors} errors, ${warnings} warnings. Full details: npm run lint.`)
  if (regressions.length) {
    console.error('New lint findings (file, rule, severity):\n' + regressions.map(([key, count]) => `${key}: ${count} (allowed ${baseline[key] || 0})`).join('\n'))
    process.exitCode = 1
  } else console.log('No lint regressions. Existing findings remain visible in the checked-in baseline.')
}
main().catch(() => { console.error('Lint verification could not run.'); process.exitCode = 1 })
