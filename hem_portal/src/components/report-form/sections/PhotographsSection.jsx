"use client";

import { uid } from "../defaultData";
import { Section, Grid, Field, TextInput, TextArea, Button } from "../ui";
import PhotoInput from "../PhotoInput";

export default function PhotographsSection({ data, setData }) {
  const p = data.photographs;

  const setMeta = (field, value) =>
    setData((d) => ({ ...d, photographs: { ...d.photographs, [field]: value } }));

  const setFixed = (key) => (field, value) =>
    setData((d) => ({
      ...d,
      photographs: { ...d.photographs, [key]: { ...d.photographs[key], [field]: value } },
    }));

  const updateExtra = (id, field, value) =>
    setData((d) => ({
      ...d,
      photographs: {
        ...d.photographs,
        extra: d.photographs.extra.map((x) => (x.id === id ? { ...x, [field]: value } : x)),
      },
    }));
  const addExtra = () =>
    setData((d) => ({
      ...d,
      photographs: { ...d.photographs, extra: [...d.photographs.extra, { id: uid(), caption: "", image: "" }] },
    }));
  const removeExtra = (id) =>
    setData((d) => ({
      ...d,
      photographs: { ...d.photographs, extra: d.photographs.extra.filter((x) => x.id !== id) },
    }));

  return (
    <Section title="9. Photographs">
      <Grid cols={2}>
        <Field label="Applicant Name (photo page header)">
          <TextInput value={p.applicantName} onChange={(e) => setMeta("applicantName", e.target.value)} />
        </Field>
        <Field label="Address" span>
          <TextArea rows={2} value={p.address} onChange={(e) => setMeta("address", e.target.value)} />
        </Field>
      </Grid>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <PhotoInput
          label="Elevation of the property"
          caption={p.elevation.caption}
          image={p.elevation.image}
          onCaptionChange={(v) => setFixed("elevation")("caption", v)}
          onImageChange={(v) => setFixed("elevation")("image", v)}
        />
        <PhotoInput
          label="Road view"
          caption={p.roadView.caption}
          image={p.roadView.image}
          onCaptionChange={(v) => setFixed("roadView")("caption", v)}
          onImageChange={(v) => setFixed("roadView")("image", v)}
        />
      </div>

      <p className="text-xs font-medium text-on-surface-variant mt-6 mb-2">
        Additional photos (left/right side view, internal views, meter, tax receipt, electricity bill, etc.)
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {p.extra.map((photo) => (
          <div key={photo.id} className="relative">
            <PhotoInput
              caption={photo.caption}
              image={photo.image}
              onCaptionChange={(v) => updateExtra(photo.id, "caption", v)}
              onImageChange={(v) => updateExtra(photo.id, "image", v)}
            />
            <button
              type="button"
              onClick={() => removeExtra(photo.id)}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-surface border border-border-base text-on-surface-variant hover:text-red-500 text-xs shadow-sm"
              aria-label="Remove photo"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <Button type="button" variant="ghost" className="mt-3" onClick={addExtra}>+ Add photo</Button>
    </Section>
  );
}
