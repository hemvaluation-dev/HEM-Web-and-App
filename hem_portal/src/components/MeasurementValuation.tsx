'use client'
import { areaUnits, calculateMeasurements, changeUnit, measurementGroups, type AreaUnit } from '@/lib/valuation/measurements'

export default function MeasurementValuation({ data, onChange, disabled = false }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void; disabled?: boolean }) {
  const values = calculateMeasurements(data)
  const update = (key: string, value: unknown) => onChange(calculateMeasurements({ ...values, [key]: value }))
  const inputClass = 'w-full rounded-lg border border-line bg-surface px-3 py-2 text-on-surface disabled:opacity-60'
  const select = (key: string) => <select aria-label={`${key.replaceAll('_', ' ')} unit`} disabled={disabled} className={inputClass} value={String(values[`${key}_unit`] ?? '')} onChange={e => onChange(changeUnit(values, key, e.target.value as AreaUnit))}>{Object.entries(areaUnits).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
  return <section className="ui-panel p-5 space-y-5">
    <h3 className="font-semibold">Measurements and valuation</h3>
    <p className="text-sm text-muted">Enter all four sides in feet. Area = average of east/west × average of north/south. This is an estimate for irregular plots. Changing an area or rate unit converts its value and preserves the valuation.</p>
    {measurementGroups.map(g => <fieldset disabled={disabled} key={g.area} className="space-y-3 border-t border-line pt-4">
      <legend className="font-semibold">{g.label}</legend>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{['east', 'west', 'north', 'south'].map(side => <label key={side} className="text-sm capitalize">{side} (fts)<input className={inputClass} type="number" min="0" step="any" value={String(values[`${g.prefix}_measurements_${side}`] ?? '')} onChange={e => update(`${g.prefix}_measurements_${side}`, e.target.value)} /></label>)}</div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <label className="text-sm">Calculated area<input className={inputClass} value={String(values[g.area] ?? '')} readOnly /></label>
        <label className="text-sm">Area unit{select(g.area)}</label>
        <label className="text-sm">Rate (₹ per unit)<input className={inputClass} type="number" min="0" step="any" value={String(values[g.rate] ?? '')} onChange={e => update(g.rate, e.target.value)} /></label>
        <label className="text-sm">Rate unit{select(g.rate)}</label>
        <label className="text-sm">Calculated value (₹)<input className={inputClass} value={String(values[g.amount] ?? '')} readOnly /></label>
      </div>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={(values[`include_${g.prefix}_value`] ?? (g.prefix !== 'slab')) === true} onChange={e => update(`include_${g.prefix}_value`, e.target.checked)} />Include {g.label.toLowerCase()} value in total</label>
    </fieldset>)}
    <p className="font-semibold">Total valuation: {values.total_value === '' ? 'Enter areas and rates for selected components' : `₹ ${Number(values.total_value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}</p>
  </section>
}
