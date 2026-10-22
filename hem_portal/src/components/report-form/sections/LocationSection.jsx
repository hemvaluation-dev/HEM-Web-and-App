"use client";

import { Section, Grid, Field, TextInput, Select } from "../ui";

export default function LocationSection({ data, setData }) {
  const setLoc = (field, value) =>
    setData((d) => ({ ...d, location: { ...d.location, [field]: value } }));
  const setMunicipal = (field, value) =>
    setData((d) => ({ ...d, municipal: { ...d.municipal, [field]: value } }));

  const loc = data.location;
  const mun = data.municipal;

  return (
    <Section title="5. Location & site access" defaultOpen={false}>
      <Grid cols={4}>
        <Field label="Type (Comm., Res, Ind, Mix)">
          <Select
            options={["Residential", "Commercial", "Industrial", "Mixed"]}
            value={loc.type}
            onChange={(e) => setLoc("type", e.target.value)}
          />
        </Field>
        <Field label="Class of Locality">
          <TextInput placeholder="Middle Class" value={loc.classOfLocality} onChange={(e) => setLoc("classOfLocality", e.target.value)} />
        </Field>
        <Field label="Site is (Dev, Under Dev)">
          <Select options={["Developed", "Under Development"]} value={loc.siteIs} onChange={(e) => setLoc("siteIs", e.target.value)} />
        </Field>
        <Field label="Proximity to civic amenities/public transport">
          <TextInput placeholder="Near by" value={loc.proximityToCivicAmenities} onChange={(e) => setLoc("proximityToCivicAmenities", e.target.value)} />
        </Field>
      </Grid>

      <Grid cols={4}>
        <Field label="Close Vicinity/Landmark" span>
          <TextInput placeholder="Near Post office Pedagantyada" value={data.closeVicinity} onChange={(e) => setData((d) => ({ ...d, closeVicinity: e.target.value }))} />
        </Field>
        <Field label="Property within municipal Limits">
          <Select options={["Yes", "No"]} value={mun.withinLimits} onChange={(e) => setMunicipal("withinLimits", e.target.value)} />
        </Field>
        <Field label="Name of Panchayat">
          <TextInput placeholder="GVMC" value={mun.nameOfPanchayat} onChange={(e) => setMunicipal("nameOfPanchayat", e.target.value)} />
        </Field>
      </Grid>

      <Grid cols={4}>
        <Field label="Site Access">
          <Select options={["Easy", "Difficult"]} value={data.siteAccess} onChange={(e) => setData((d) => ({ ...d, siteAccess: e.target.value }))} />
        </Field>
        <Field label="Availability of basic amenities (Water, Sewer, Electrical, Road)">
          <TextInput placeholder="Near By" value={data.basicAmenities} onChange={(e) => setData((d) => ({ ...d, basicAmenities: e.target.value }))} />
        </Field>
        <Field label="Marketability">
          <Select options={["Excellent", "Good", "Average", "Poor"]} value={data.marketability} onChange={(e) => setData((d) => ({ ...d, marketability: e.target.value }))} />
        </Field>
      </Grid>
    </Section>
  );
}
