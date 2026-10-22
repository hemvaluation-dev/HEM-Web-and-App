export type AreaUnit = 'sqft' | 'sqyd' | 'sqm'
export const areaUnits: Record<AreaUnit, string> = { sqft: 'sq.fts', sqyd: 'sq.yards', sqm: 'sq.mtr' }
const feet: Record<AreaUnit, number> = { sqft: 1, sqyd: 9, sqm: 1 / 0.09290304 }
export const measurementGroups = [
  { prefix: 'land', area: 'land_area', rate: 'land_rate', amount: 'land_value', label: 'Land' },
  { prefix: 'plinth', area: 'bua', rate: 'construction_rate', amount: 'building_value', label: 'Build-up' },
  { prefix: 'slab', area: 'slab_area', rate: 'slab_rate', amount: 'slab_value', label: 'Slab' },
] as const
export function numberValue(value: unknown): number | null {
  if (value === null || value === undefined || String(value).trim() === '') return null
  const n = Number(String(value).replace(/,/g, ''))
  return Number.isFinite(n) && n >= 0 ? n : null
}
export function unit(value: unknown, fallback: AreaUnit = 'sqyd'): AreaUnit {
  return value === 'sqft' || value === 'sqyd' || value === 'sqm' ? value : fallback
}
export const convertArea = (value: number, from: AreaUnit, to: AreaUnit) => value * feet[from] / feet[to]
export const convertRate = (value: number, from: AreaUnit, to: AreaUnit) => value * feet[to] / feet[from]
export const decimal = (value: number) => String(Number(value.toFixed(6)))
export function measuredSquareFeet(data: Record<string, unknown>, prefix: string): number | null {
  const values = ['east', 'west', 'north', 'south'].map(side => numberValue(data[`${prefix}_measurements_${side}`]))
  if (values.some(v => v === null)) return null
  const [e, w, n, s] = values as number[]
  return ((e + w) / 2) * ((n + s) / 2)
}
/** Legacy agent areas are sq yards; legacy construction rates are per sq foot. */
export function calculateMeasurements(input: Record<string, unknown>): Record<string, unknown> {
  const d = { ...input }
  for (const g of measurementGroups) {
    const areaUnit = unit(d[`${g.area}_unit`])
    const rateUnit = unit(d[`${g.rate}_unit`], g.prefix === 'land' ? 'sqyd' : 'sqft')
    d[`${g.area}_unit`] = areaUnit
    d[`${g.rate}_unit`] = rateUnit
    const measured = measuredSquareFeet(d, g.prefix)
    const hasMeasurements = ['east', 'west', 'north', 'south'].some(side => String(d[`${g.prefix}_measurements_${side}`] ?? '').trim() !== '')
    if (measured !== null) d[g.area] = decimal(convertArea(measured, 'sqft', areaUnit))
    else if (hasMeasurements) d[g.area] = '' // Never calculate from incomplete sides or retain a stale calculated area.
    const area = measured ?? (numberValue(d[g.area]) === null ? null : convertArea(numberValue(d[g.area])!, areaUnit, 'sqft'))
    const rate = numberValue(d[g.rate])
    d[g.amount] = area !== null && rate !== null ? decimal(convertArea(area, 'sqft', rateUnit) * rate) : ''
  }
  const included = measurementGroups.filter(g => d[`include_${g.prefix}_value`] ?? (g.prefix !== 'slab'))
  d.total_value = included.length && included.every(g => numberValue(d[g.amount]) !== null)
    ? decimal(included.reduce((sum, g) => sum + numberValue(d[g.amount])!, 0)) : ''
  return d
}
export function changeUnit(data: Record<string, unknown>, key: string, next: AreaUnit) {
  const d = calculateMeasurements(data)
  const isRate = key.endsWith('_rate')
  const current = unit(d[`${key}_unit`], isRate && key !== 'land_rate' ? 'sqft' : 'sqyd')
  const value = numberValue(d[key])
  return calculateMeasurements({ ...d, [key]: value === null ? '' : decimal((isRate ? convertRate : convertArea)(value, current, next)), [`${key}_unit`]: next })
}
