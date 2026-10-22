import { calculateMeasurements, convertArea, convertRate, decimal, numberValue, unit } from './measurements'
const object = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {}
export function legacyMeasurements(data: Record<string, unknown>) {
  const d: Record<string, unknown> = { land_area: object(data.valuation).landAreaSqYds, land_area_unit: 'sqyd', land_rate: object(data.valuation).landRate, land_rate_unit: 'sqyd', bua: object(data.valuation).totalConstructionArea, bua_unit: 'sqft', construction_rate: object(data.valuation).constructionRate, construction_rate_unit: 'sqft', ...object(data.measurements) }
  for (const [prefix, section] of [['land', 'landDimensions'], ['plinth', 'buildingDimensions'], ['slab', 'slabDimensions']]) {
    for (const side of ['east', 'west', 'north', 'south']) d[`${prefix}_measurements_${side}`] = object(data[section])[side] ?? d[`${prefix}_measurements_${side}`]
  }
  return calculateMeasurements(d)
}
export function applyLegacyMeasurements(data: Record<string, unknown>, input = legacyMeasurements(data)) {
  const d = calculateMeasurements(input), result: Record<string, unknown> = { ...data, measurements: d, valuation: { ...object(data.valuation) } }
  for (const [prefix, section] of [['land', 'landDimensions'], ['plinth', 'buildingDimensions'], ['slab', 'slabDimensions']]) {
    result[section] = { ...object(data[section]) }
    for (const side of ['east', 'west', 'north', 'south']) object(result[section])[side] = d[`${prefix}_measurements_${side}`] ?? ''
  }
  for (const [key, target, targetUnit] of [['land_area', 'landAreaSqYds', 'sqyd'], ['land_rate', 'landRate', 'sqyd'], ['bua', 'totalConstructionArea', 'sqft'], ['construction_rate', 'constructionRate', 'sqft']] as const) {
    const n = numberValue(d[key])
    object(result.valuation)[target] = n === null ? '' : decimal((key.endsWith('_rate') ? convertRate : convertArea)(n, unit(d[`${key}_unit`]), targetUnit))
  }
  return result
}
