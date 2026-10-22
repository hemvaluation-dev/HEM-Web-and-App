const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd())

const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']
const failures = []
for (const name of required) {
  const value = process.env[name]?.trim()
  if (!value || /^(your-|replace-|changeme|example)/i.test(value)) failures.push(`${name} is missing or contains a placeholder`)
}
try {
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  if (url.protocol !== 'https:' || url.username || url.password || url.hostname === 'your-project-ref.supabase.co') failures.push('NEXT_PUBLIC_SUPABASE_URL must be the HTTPS URL of your Supabase project')
} catch { failures.push('NEXT_PUBLIC_SUPABASE_URL must be a valid URL') }
if (process.env.SUPABASE_SERVICE_ROLE_KEY === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) failures.push('The service role key must differ from the browser key')

if (failures.length) {
  console.error('Production configuration checks failed:\n' + failures.map(message => `- ${message}`).join('\n'))
  process.exitCode = 1
} else {
  console.log('Required production configuration is present. Values are never printed. Service connectivity is not checked.')
}
