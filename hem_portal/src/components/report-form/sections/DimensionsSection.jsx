"use client";

import { Field, TextInput } from "../ui";
import { Section } from "../ui";

function DimensionRow({ title, keys, values, onChange }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-on-surface-variant mb-1">{title}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {keys.map(({ key, label }) => (
          <Field key={key} label={label}>
            <TextInput value={values[key]} onChange={(e) => onChange(key, e.target.value)} />
          </Field>
        ))}
      </div>
    </div>
  );
}

export default function DimensionsSection({ data, setData }) {
  const setFor = (section) => (key, value) =>
    setData((d) => ({ ...d, [section]: { ...d[section], [key]: value } }));

  return (
    <Section title="3. Set backs & dimensions" defaultOpen={false}>
      <DimensionRow
        title="Set Backs"
        keys={[
          { key: "front", label: "Front (in fts)" },
          { key: "back", label: "Back (in fts)" },
          { key: "right", label: "Right (in fts)" },
          { key: "left", label: "Left (in fts)" },
        ]}
        values={data.setBacks}
        onChange={setFor("setBacks")}
      />
      <DimensionRow
        title="Land Dimensions"
        keys={[
          { key: "east", label: "East (in fts)" },
          { key: "west", label: "West (in fts)" },
          { key: "north", label: "North (in fts)" },
          { key: "south", label: "South (in fts)" },
        ]}
        values={data.landDimensions}
        onChange={setFor("landDimensions")}
      />
      <DimensionRow
        title="Building Dimensions"
        keys={[
          { key: "east", label: "East (in fts)" },
          { key: "west", label: "West (in fts)" },
          { key: "north", label: "North (in fts)" },
          { key: "south", label: "South (in fts)" },
        ]}
        values={data.buildingDimensions}
        onChange={setFor("buildingDimensions")}
      />
      <DimensionRow
        title="Slab Dimensions"
        keys={[
          { key: "east", label: "East (in fts)" },
          { key: "west", label: "West (in fts)" },
          { key: "north", label: "North (in fts)" },
          { key: "south", label: "South (in fts)" },
        ]}
        values={data.slabDimensions}
        onChange={setFor("slabDimensions")}
      />
    </Section>
  );
}
