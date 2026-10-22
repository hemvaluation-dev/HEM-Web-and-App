"use client";

import { uid } from "../defaultData";
import { Section, Field, TextInput, Select, Button } from "../ui";
import MeasurementValuation from '@/components/MeasurementValuation';
import { legacyMeasurements, applyLegacyMeasurements } from '@/lib/valuation/legacy';

export default function ValuationSection({ data, setData }) {
  const v = data.valuation;
  const setV = (field, value) =>
    setData((d) => ({ ...d, valuation: { ...d.valuation, [field]: value } }));

  const updateFloorRow = (id, field, value) =>
    setData((d) => ({
      ...d,
      floorWiseArea: d.floorWiseArea.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }));
  const addFloorRow = () =>
    setData((d) => ({
      ...d,
      floorWiseArea: [...d.floorWiseArea, { id: uid(), floor: "", plinthArea: "", slabArea: "" }],
    }));
  const removeFloorRow = (id) =>
    setData((d) => ({ ...d, floorWiseArea: d.floorWiseArea.filter((r) => r.id !== id) }));

  const updateUsageRow = (id, field, value) =>
    setData((d) => ({
      ...d,
      floorwiseUsage: d.floorwiseUsage.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }));
  const addUsageRow = () =>
    setData((d) => ({
      ...d,
      floorwiseUsage: [
        ...d.floorwiseUsage,
        { id: uid(), floor: "", usage: "Residential", units: "", tenancyYear: "", rentalAssessment: "" },
      ],
    }));
  const removeUsageRow = (id) =>
    setData((d) => ({ ...d, floorwiseUsage: d.floorwiseUsage.filter((r) => r.id !== id) }));


  return (
    <Section title="7. Floor-wise area & valuation">
      <p className="text-xs font-medium text-on-surface-variant mb-1">Floor Wise Area (in Sqft.)</p>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-xs text-on-surface-variant">
              <th className="py-1 pr-2 font-medium">Floor</th>
              <th className="py-1 pr-2 font-medium">Plinth area</th>
              <th className="py-1 pr-2 font-medium">Slab area</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.floorWiseArea.map((row) => (
              <tr key={row.id}>
                <td className="py-1 pr-2 w-40">
                  <TextInput value={row.floor} onChange={(e) => updateFloorRow(row.id, "floor", e.target.value)} />
                </td>
                <td className="py-1 pr-2">
                  <TextInput value={row.plinthArea} onChange={(e) => updateFloorRow(row.id, "plinthArea", e.target.value)} />
                </td>
                <td className="py-1 pr-2">
                  <TextInput value={row.slabArea} onChange={(e) => updateFloorRow(row.id, "slabArea", e.target.value)} />
                </td>
                <td>
                  <button type="button" onClick={() => removeFloorRow(row.id)} className="text-on-surface-variant hover:text-red-500 text-xs px-2">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="ghost" onClick={addFloorRow}>+ Add floor</Button>

      <MeasurementValuation data={legacyMeasurements(data)} onChange={next => setData(d => applyLegacyMeasurements(d, next))} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <Field label="Stage of construction">
          <Select options={["Completed", "Under construction", "Not started"]} value={v.stageOfConstruction} onChange={(e) => setV("stageOfConstruction", e.target.value)} />
        </Field>
        <Field label="Stage %">
          <TextInput placeholder="100%" value={v.stagePercent} onChange={(e) => setV("stagePercent", e.target.value)} />
        </Field>
        <Field label="Recommended %">
          <TextInput placeholder="NA" value={v.recommendedPercent} onChange={(e) => setV("recommendedPercent", e.target.value)} />
        </Field>
      </div>

      <p className="text-xs font-medium text-on-surface-variant mt-6 mb-1">Floorwise details of usage of property</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-xs text-on-surface-variant">
              <th className="py-1 pr-2 font-medium">Floor</th>
              <th className="py-1 pr-2 font-medium">Usage</th>
              <th className="py-1 pr-2 font-medium">Units</th>
              <th className="py-1 pr-2 font-medium">Yr of current tenancy</th>
              <th className="py-1 pr-2 font-medium">Rental assessment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.floorwiseUsage.map((row) => (
              <tr key={row.id}>
                <td className="py-1 pr-2"><TextInput value={row.floor} onChange={(e) => updateUsageRow(row.id, "floor", e.target.value)} /></td>
                <td className="py-1 pr-2"><TextInput value={row.usage} onChange={(e) => updateUsageRow(row.id, "usage", e.target.value)} /></td>
                <td className="py-1 pr-2"><TextInput value={row.units} onChange={(e) => updateUsageRow(row.id, "units", e.target.value)} /></td>
                <td className="py-1 pr-2"><TextInput value={row.tenancyYear} onChange={(e) => updateUsageRow(row.id, "tenancyYear", e.target.value)} /></td>
                <td className="py-1 pr-2"><TextInput value={row.rentalAssessment} onChange={(e) => updateUsageRow(row.id, "rentalAssessment", e.target.value)} /></td>
                <td><button type="button" onClick={() => removeUsageRow(row.id)} className="text-on-surface-variant hover:text-red-500 text-xs px-2">✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="ghost" onClick={addUsageRow}>+ Add floor usage row</Button>
    </Section>
  );
}
