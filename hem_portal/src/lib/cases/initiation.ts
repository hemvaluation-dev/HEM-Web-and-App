/** The initiation form uses Indian Standard Time, regardless of server timezone. */
export function initiationLocalTime(now = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(now).replace(' ', 'T')
}

export function initiationTimestamp(value: string): string {
  const input = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/.test(input)) {
    throw new Error('Select a valid initiation date and time.')
  }
  const day = new Date(input.slice(0, 10) + 'T00:00:00Z')
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== input.slice(0, 10)) throw new Error('Select a valid initiation date and time.')
  const date = new Date(/[Zz]$|[+-]\d{2}:\d{2}$/.test(input) ? input : input + '+05:30')
  if (!Number.isFinite(date.getTime())) throw new Error('Select a valid initiation date and time.')
  return date.toISOString()
}
