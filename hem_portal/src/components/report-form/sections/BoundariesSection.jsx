"use client";

import { uid } from "../defaultData";
import { Section, Grid, Field, TextInput, TextArea, Select, Button, RowCard } from "../ui";

export default function BoundariesSection({ data, setData }) {
  const docs = data.documentsVerified;

  const updateDoc = (id, value) =>
    setData((d) => ({
      ...d,
      documentsVerified: d.documentsVerified.map((x) => (x.id === id ? { ...x, text: value } : x)),
    }));
  const addDoc = () =>
    setData((d) => ({ ...d, documentsVerified: [...d.documentsVerified, { id: uid(), text: "" }] }));
  const removeDoc = (id) =>
    setData((d) => ({ ...d, documentsVerified: d.documentsVerified.filter((x) => x.id !== id) }));

  const setBoundaryField = (dir, key, value) =>
    setData((d) => ({
      ...d,
      boundaries: { ...d.boundaries, [dir]: { ...d.boundaries[dir], [key]: value } },
    }));
  const setBoundaryMatching = (value) =>
    setData((d) => ({ ...d, boundaries: { ...d.boundaries, matching: value } }));

  const b = data.boundaries;

  return (
    <Section title="2. Documents, ownership & boundaries">
      <p className="text-xs font-medium text-on-surface-variant mb-1">Property documents verified</p>
      {docs.map((doc, idx) => (
        <RowCard key={doc.id} onRemove={docs.length > 1 ? () => removeDoc(doc.id) : undefined}>
          <TextArea
            placeholder={`e.g. Copy of Settlement Deed Doc.No: 298/2023 Dated: 17-01-2023, in favor of ...`}
            value={doc.text}
            onChange={(e) => updateDoc(doc.id, e.target.value)}
          />
        </RowCard>
      ))}
      <Button type="button" variant="ghost" onClick={addDoc}>+ Add document</Button>

      <Grid cols={2}>
        <Field label="Ownership type">
          <Select
            options={["Free Hold", "Lease Hold"]}
            value={data.ownershipType}
            onChange={(e) => setData((d) => ({ ...d, ownershipType: e.target.value }))}
          />
        </Field>
        <Field label="Boundaries Matching">
          <Select options={["Yes", "No", "Partial"]} value={b.matching} onChange={(e) => setBoundaryMatching(e.target.value)} />
        </Field>
      </Grid>

      <p className="text-xs font-medium text-on-surface-variant mt-4 mb-1">Boundaries as per documents & site</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-xs text-on-surface-variant">
              <th className="py-1 pr-2 font-medium">Direction</th>
              <th className="py-1 pr-2 font-medium">As per Doc</th>
              <th className="py-1 pr-2 font-medium">As per Site</th>
            </tr>
          </thead>
          <tbody>
            {["east", "west", "north", "south"].map((dir) => (
              <tr key={dir}>
                <td className="py-1 pr-2 capitalize text-on-surface-variant w-20">{dir}</td>
                <td className="py-1 pr-2">
                  <TextInput value={b[dir].doc} onChange={(e) => setBoundaryField(dir, "doc", e.target.value)} />
                </td>
                <td className="py-1 pr-2">
                  <TextInput value={b[dir].site} onChange={(e) => setBoundaryField(dir, "site", e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
