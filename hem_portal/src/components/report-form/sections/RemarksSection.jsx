"use client";

import { uid } from "../defaultData";
import { Section, Field, TextInput, TextArea, Button, RowCard } from "../ui";

export default function RemarksSection({ data, setData }) {
  const remarks = data.remarks;

  const update = (id, value) =>
    setData((d) => ({ ...d, remarks: d.remarks.map((r) => (r.id === id ? { ...r, text: value } : r)) }));
  const add = () => setData((d) => ({ ...d, remarks: [...d.remarks, { id: uid(), text: "" }] }));
  const remove = (id) => setData((d) => ({ ...d, remarks: d.remarks.filter((r) => r.id !== id) }));

  return (
    <Section title="8. Remarks / observations & GPS" defaultOpen={false}>
      <p className="text-xs font-medium text-on-surface-variant mb-1">Numbered remarks (shown as a numbered list in the report)</p>
      {remarks.map((r, idx) => (
        <RowCard key={r.id} onRemove={remarks.length > 1 ? () => remove(r.id) : undefined}>
          <TextArea
            placeholder={`Remark ${idx + 1}`}
            value={r.text}
            onChange={(e) => update(r.id, e.target.value)}
          />
        </RowCard>
      ))}
      <Button type="button" variant="ghost" onClick={add}>+ Add remark</Button>

      <div className="mt-4 max-w-sm">
        <Field label="GPS Coordinates" hint="Latitude, Longitude">
          <TextInput placeholder="17.671035, 83.195940" value={data.gpsCoordinates} onChange={(e) => setData((d) => ({ ...d, gpsCoordinates: e.target.value }))} />
        </Field>
      </div>
    </Section>
  );
}
