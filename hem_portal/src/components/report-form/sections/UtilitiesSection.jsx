"use client";

import { Section, Grid, Field, TextInput, Select } from "../ui";

export default function UtilitiesSection({ data, setData }) {
  const e = data.electricity;
  const set = (field, value) =>
    setData((d) => ({ ...d, electricity: { ...d.electricity, [field]: value } }));

  return (
    <Section title="6. Electricity & miscellaneous checks" defaultOpen={false}>
      <Grid cols={4}>
        <Field label="Electricity Meter Service No.">
          <TextInput placeholder="Sc No: ..., Meter No: ..." value={e.meterServiceNo} onChange={(ev) => set("meterServiceNo", ev.target.value)} />
        </Field>
        <Field label="High Tension wires">
          <Select options={["No", "Yes"]} value={e.highTensionWires} onChange={(ev) => set("highTensionWires", ev.target.value)} />
        </Field>
        <Field label="Electricity in the name of">
          <TextInput value={e.inNameOf} onChange={(ev) => set("inNameOf", ev.target.value)} />
        </Field>
        <Field label="Property tax in the name of">
          <TextInput value={e.propertyTaxInNameOf} onChange={(ev) => set("propertyTaxInNameOf", ev.target.value)} />
        </Field>
        <Field label="Area left for cross">
          <TextInput value={e.areaLeftForCross} onChange={(ev) => set("areaLeftForCross", ev.target.value)} />
        </Field>
        <Field label="Joint wall and Joint slab">
          <Select options={["No", "Yes"]} value={e.jointWallSlab} onChange={(ev) => set("jointWallSlab", ev.target.value)} />
        </Field>
        <Field label="Any graveyard nearby">
          <Select options={["No", "Yes"]} value={e.graveyardNearby} onChange={(ev) => set("graveyardNearby", ev.target.value)} />
        </Field>
      </Grid>
    </Section>
  );
}
