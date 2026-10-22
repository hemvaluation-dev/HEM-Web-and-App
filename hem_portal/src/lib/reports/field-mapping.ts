import type { TemplateDef } from '@/lib/report-engine/templates'
import { calculateMeasurements, convertArea, convertRate, decimal, measuredSquareFeet, measurementGroups, numberValue, unit } from '@/lib/valuation/measurements'

import { lenderBindings, type LenderBinding } from './lender-bindings'
const veritasSources: Record<string, string> = {
  document_holder_name: 'owner_name', phone: 'phone_number', nearest_landmark: 'landmark', branch_distance: 'distance_from_branch',
  usage: 'property_usage', occupancy: 'occupancy_details', floors: 'no_of_floors', total_units: 'no_of_units',
  property_identification: 'property_identified_by', building_age: 'age_of_property', future_life: 'residual_life',
  documents_list: 'property_documents_verified', flooring: 'flooring_type', plot_demarcated: 'demarcation_available',
  locality: 'class_of_locality', rental_value: 'rental_per_month', construction_stage: 'stage_of_construction',
  work_progress: 'stage_percentage', structure: 'structure_type', hazardous_zones: 'near_hazards', comments: 'remarks_and_violations',
  east_title: 'boundaries_document_east', west_title: 'boundaries_document_west', north_title: 'boundaries_document_north', south_title: 'boundaries_document_south',
  east_actual: 'boundaries_physical_east', west_actual: 'boundaries_physical_west', north_actual: 'boundaries_physical_north', south_actual: 'boundaries_physical_south',
  application_number: 'application_number', applicant_name: 'applicant_name', branch: 'branch', property_address: 'property_address', property_type: 'property_type', ownership_type: 'ownership_type', latitude: 'latitude', longitude: 'longitude', state: 'state', district: 'district', pincode: 'pincode', inspection_date: 'visit_date', marketability: 'marketability', meter_number: 'meter_number', road_width: 'road_width', civic_status: 'civic_status', nhb_1991: 'nhb_1991', nhb_2011: 'nhb_2011', deviation: 'deviation', roof: 'roof', eb_service: 'eb_service', property_tax: 'property_tax', passage_less_10ft: 'passage_less_10ft', passage_width: 'passage_width', distance_main_road: 'distance_main_road', facilities: 'facilities', water_supply: 'water_supply', drainage: 'drainage', condition: 'condition'
}
// Explicit unit contracts for fixed lender fields. Documentary/approved areas are never filled from site measurements.
const calculatedFields: Record<string, Record<string, [string, ('sqft' | 'sqyd' | 'sqm')?]>> = {
  veritas: { land_sft: ['land_area', 'sqft'], rate_sft: ['land_rate', 'sqft'], land_value: ['land_value'], existing_bua: ['bua', 'sqft'], existing_building_value: ['building_value'] },
  kreditbee: { kreditbee_49: ['land_area', 'sqft'], kreditbee_50: ['land_rate', 'sqft'], kreditbee_f99: ['bua', 'sqft'], kreditbee_h99: ['construction_rate', 'sqft'] },
  'aditya-birla-lap': { 'aditya-birla-lap_113': ['land_area', 'sqft'], 'aditya-birla-lap_114': ['land_rate', 'sqft'], 'aditya-birla-lap_115': ['land_value'], 'aditya-birla-lap_125': ['bua', 'sqft'], 'aditya-birla-lap_126': ['construction_rate', 'sqft'], 'aditya-birla-lap_127': ['building_value'], 'aditya-birla-lap_156': ['total_value'] },
  equitas: { equitas_51: ['land_area', 'sqft'], equitas_52: ['bua', 'sqft'], equitas_55: ['land_rate', 'sqft'], equitas_56: ['construction_rate', 'sqft'], equitas_59: ['land_value'], equitas_60: ['building_value'], equitas_63: ['total_value'] },
  icici: { icici_62: ['land_area', 'sqft'], icici_63: ['land_rate', 'sqft'], icici_64: ['land_value'], icici_65: ['bua', 'sqft'], icici_66: ['construction_rate', 'sqft'], icici_67: ['building_value'], icici_68: ['total_value'] },
  'smfg-lap': { 'smfg-lap_92': ['land_area', 'sqyd'], 'smfg-lap_93': ['land_rate', 'sqyd'], 'smfg-lap_94': ['land_value'], 'smfg-lap_95': ['bua', 'sqft'], 'smfg-lap_96': ['construction_rate', 'sqft'], 'smfg-lap_97': ['building_value'], 'smfg-lap_109': ['total_value'] },
  ummeed: { ummeed_89: ['land_area', 'sqft'], ummeed_90: ['land_rate', 'sqft'], ummeed_91: ['land_value'], ummeed_93: ['bua', 'sqft'], ummeed_94: ['construction_rate', 'sqft'], ummeed_97: ['building_value'] },
  'jm-finance': { 'jm-finance_86': ['land_area', 'sqm'], 'jm-finance_site_e161': ['land_area', 'sqft'], 'jm-finance_site_g161': ['land_rate', 'sqft'] },
  'axis-finance': { 'axis-finance_122': ['land_area', 'sqyd'], 'axis-finance_123': ['land_rate', 'sqyd'] },
  'chola-sme': { 'chola-sme_91': ['land_area', 'sqyd'], 'chola-sme_92': ['land_rate', 'sqyd'], 'chola-sme_94': ['land_value'] },
  'smfg-rural-lap': { 'smfg-rural-lap_70': ['land_area', 'sqyd'], 'smfg-rural-lap_71': ['land_rate', 'sqyd'] },
}
export function mapReportFields(template: TemplateDef, source: Record<string, unknown>, overrides: Record<string, unknown> = {}, record: Record<string, unknown> = {}, location: Record<string, unknown> | null = {}) {
  const d = calculateMeasurements(source)
  const result: Record<string, string> = {}
  for (const f of template.fields) {
    const binding = fieldBinding(template.id, f.id)
    let value: unknown = binding ? resolveBinding(binding, d, record, location ?? {}) : ''
    // An exact lender-specific value is an intentional edit, never a guessed synonym.
    if (Object.prototype.hasOwnProperty.call(source, f.id) && !binding) value = source[f.id]
    if (Object.prototype.hasOwnProperty.call(overrides, f.id)) value = overrides[f.id]
    const calculation = calculatedFields[template.id]?.[f.id]
    if (calculation && d[calculation[0]] !== undefined) {
      const [key, target] = calculation, n = numberValue(d[key])
      value = n === null ? '' : target ? decimal((key.endsWith('_rate') ? convertRate : convertArea)(n, unit(d[`${key}_unit`]), target)) : d[key]
      // Convert directly from measured feet; converting rounded displayed yards back
      // to feet can otherwise turn a 1,200 sq.ft plot into 1,199.999997.
      const group = measurementGroups.find(group => group.area === key)
      const measured = group ? measuredSquareFeet(d, group.prefix) : null
      if (target && measured !== null) value = decimal(convertArea(measured, 'sqft', target))
    }
    result[f.id] = Array.isArray(value) ? value.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join('; ') : String(value ?? '')
  }
  if (template.id === 'veritas') {
    const sum = (...keys: string[]) => keys.reduce((n, key) => n + (numberValue(result[key]) ?? 0), 0)
    result.total_bua = decimal(sum('existing_bua', 'proposed_bua'))
    result.total_building_value = decimal(sum('existing_building_value', 'proposed_building_value', 'enhancement', 'additional_cost'))
    result.land_plus_rcc = decimal(sum('land_value', 'total_building_value'))
    result.land_plus_temp = decimal(sum('land_value', 'temp_total_value'))
    result.total_property_value = d.total_value === '' ? '' : decimal(Number(d.total_value) + sum('proposed_building_value', 'enhancement', 'additional_cost', 'temp_total_value'))
    result.forced_sale_value = result.total_property_value === '' ? '' : decimal(Number(result.total_property_value) * .8)
  }
  return result
}

export function isCalculatedField(templateId: string, fieldId: string) {
  return Boolean(calculatedFields[templateId]?.[fieldId]) || (templateId === 'veritas' && ['total_bua', 'total_building_value', 'land_plus_rcc', 'land_plus_temp', 'total_property_value', 'forced_sale_value'].includes(fieldId))
}

export function fieldBinding(templateId: string, fieldId: string): LenderBinding | undefined {
  if (templateId === 'veritas') return veritasSources[fieldId] ? { source: veritasSources[fieldId], ...(fieldId === 'inspection_date' ? { format: 'date' as const } : {}) } : undefined
  return lenderBindings[templateId]?.[fieldId]
}
const floorNames: Record<string, string[]> = {
  basement: ['basement', 'basementfloor', 'bf'], stilt: ['stilt', 'stiltfloor'], ground: ['ground', 'groundfloor', 'gf', '0'],
  first: ['first', 'firstfloor', '1stfloor', 'ff', '1'], second: ['second', 'secondfloor', '2ndfloor', 'sf', '2'],
  third: ['third', 'thirdfloor', '3rdfloor', 'tf', '3'], fourth: ['fourth', 'fourthfloor', '4thfloor', '4'], fifth: ['fifth', 'fifthfloor', '5thfloor', '5'],
  gf1: ['gf1', 'gf1office'], gf2: ['gf2', 'gf2swimmingpool'], gf3: ['gf3', 'gf3zim'],
}
function resolveBinding(binding: LenderBinding, data: Record<string, unknown>, record: Record<string, unknown>, location: Record<string, unknown>): unknown {
  const read = (key: string): unknown => {
    const value = data[key]
    if (value !== undefined && value !== null && value !== '') return value
    // Explicit equivalent field names used by mobile data review.
    const aliases: Record<string, string> = { civic_status: 'panchayat_name', road_width: 'approach_road_width' }
    const alias = aliases[key]
    if (alias && data[alias] !== undefined && data[alias] !== null && data[alias] !== '') return data[alias]
    if ((key === 'latitude' || key === 'longitude') && location[key] == null && record[key] == null) {
      const pair = typeof data.gps_coordinates === 'string'
        ? data.gps_coordinates.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/) : null
      if (pair && Math.abs(Number(pair[1])) <= 90 && Math.abs(Number(pair[2])) <= 180) return pair[key === 'latitude' ? 1 : 2]
    }
    if (key === 'property_address') return data.address_docs || record.address || ''
    if (key === 'created_at') return record.created_at ?? ''
    if (key === 'visit_date') return location.created_at ?? ''
    return location[key] ?? record[key] ?? ''
  }
  if (binding.floor) {
    if (!Array.isArray(data.floor_wise_area)) return ''
    const rows = data.floor_wise_area.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
    const matches = rows.filter(row => (floorNames[binding.floor!] || []).includes(String(row.floor ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')))
    // Duplicate or unknown floor labels require review; never use array position.
    return matches.length === 1 ? matches[0][binding.source!] ?? '' : ''
  }
  if (binding.format === 'coordinates') {
    const values = binding.sources!.map(read)
    return values.every(v => v !== '' && v !== null && v !== undefined) ? values.join(', ') : ''
  }
  const value = read(binding.source!)
  if (binding.format === 'feet-to-metres') { const n = numberValue(value); return n === null ? '' : decimal(n * .3048) }
  if (binding.format === 'date') return typeof value === 'string' ? value.split('T')[0] : ''
  return value
}
export function reportFieldOrigin(templateId: string, fieldId: string): string {
  const calc = calculatedFields[templateId]?.[fieldId]
  if (calc) return `Calculated from ${calc[0].replaceAll('_', ' ')}${calc[1] ? ` (${calc[1]})` : ''}`
  if (isCalculatedField(templateId, fieldId)) return 'Calculated from this report’s valuation fields'
  const binding = fieldBinding(templateId, fieldId)
  if (!binding) return 'Separate report input — no equivalent mobile field'
  if (binding.floor) return `Agent: ${binding.floor} floor measured plinth area (sq.fts)`
  return `Agent / case: ${(binding.sources || [binding.source!]).join(' + ').replaceAll('_', ' ')}${binding.format === 'feet-to-metres' ? ' (converted from feet to metres)' : ''}`
}
