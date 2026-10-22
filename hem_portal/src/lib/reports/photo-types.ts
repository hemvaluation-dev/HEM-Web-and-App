import type { PhotoSlotDef, TemplateDef } from '@/lib/report-engine/templates'

export const photoTypes = [
  'Elevation Photo', 'Road Photo', 'Road Photo with Property Elevation', 'Bedroom', 'Hall', 'Kitchen',
  'Set Back Photos', 'East Boundary Photo', 'West Boundary Photo', 'North Boundary Photo', 'South Boundary Photo',
  'Selfie', 'Power Bill', 'Meter', 'Property Document',
  'Others - Screenshots', 'Others - Map Screenshot', 'Others - Route Sketch', 'Others - Satellite View',
  'Others - Cadastral / BhuNaksha Map', 'Others - Government Rate Screenshot', 'Others - Prohibited Property Screenshot',
  'Others - Electricity Bill Screenshot', 'Others - Property Tax Screenshot', 'Others - Approved Plan / Layout', 'Others - Document Screenshot', 'Other',
] as const
export const isScreenshotType = (value: string) => /^others\s*[-–]/i.test(value)
const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
function regularTypes(slot: PhotoSlotDef): string[] {
  const label = slot.label.toLowerCase()
  if (/meter/.test(label)) return ['Meter']
  if (/bill/.test(label)) return ['Power Bill']
  if (/applicant|owner|surveyor|person|selfie/.test(label)) return ['Selfie']
  if (/road|access|approach|neighbourhood/.test(label)) return ['Road Photo', 'Road Photo with Property Elevation']
  if (/kitchen/.test(label)) return ['Kitchen']
  if (/bedroom/.test(label)) return ['Bedroom']
  if (/interior|room|hall|living/.test(label)) return ['Hall', 'Bedroom', 'Kitchen']
  if (/boundary|side|rear|setback|set back|passage/.test(label)) return ['Set Back Photos', 'East Boundary Photo', 'West Boundary Photo', 'North Boundary Photo', 'South Boundary Photo']
  return ['Elevation Photo', 'Road Photo with Property Elevation', 'Other']
}
/** Specialized screenshots never fill normal property slots. Each saved image is used at most once. */
export function matchReportPhotos<T extends { photo_type?: string | null }>(template: TemplateDef, photos: T[]): (T | null)[] {
  const slots = template.photoSlots || []
  const used = new Set<number>()
  const result: (T | null)[] = slots.map(() => null)
  // Reserve exact named slots before filling more general property slots.
  for (const exact of [true, false]) slots.forEach((slot, index) => {
    if (Boolean(slot.photoTypes) !== exact) return
    const types = (slot.photoTypes || regularTypes(slot)).map(normalized)
    const match = photos.findIndex((photo, i) => !used.has(i) && types.includes(normalized(photo.photo_type || '')))
    if (match >= 0) { used.add(match); result[index] = photos[match] }
  })
  return result
}
