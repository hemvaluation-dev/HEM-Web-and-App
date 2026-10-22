"use client";

import { Section, Grid, Field, TextInput, Select } from "../ui";
import { useEffect } from "react";

export default function PropertyDetailsSection({ data, setData }) {
  const setOccupant = (field, value) =>
    setData((d) => ({ ...d, occupant: { ...d.occupant, [field]: value } }));
  const setBD = (field, value) =>
    setData((d) => ({ ...d, buildingDetails: { ...d.buildingDetails, [field]: value } }));
  const setUnit = (field, value) =>
    setData((d) => ({ ...d, unitDetails: { ...d.unitDetails, [field]: value } }));
  const setQuality = (field, value) =>
    setData((d) => ({ ...d, quality: { ...d.quality, [field]: value } }));
  const setAge = (field, value) =>
    setData((d) => ({ ...d, age: { ...d.age, [field]: value } }));

  const occ = data.occupant;
  const bd = data.buildingDetails;

  useEffect(() => {
    const calculateArea = (dims, toSqYards) => {
      const e = parseFloat(dims?.east) || 0;
      const w = parseFloat(dims?.west) || 0;
      const n = parseFloat(dims?.north) || 0;
      const s = parseFloat(dims?.south) || 0;
      if (!e && !w && !n && !s) return 0;
      const areaSqFt = ((e + w) / 2) * ((s + n) / 2);
      const result = toSqYards ? areaSqFt / 9 : areaSqFt;
      return Number(result.toFixed(2));
    };

    const autoLandArea = calculateArea(data.landDimensions, true);
    if (autoLandArea > 0) {
      const newPlotArea = `${autoLandArea} Sq.Yds`;
      if (bd.plotArea !== newPlotArea) {
        setBD("plotArea", newPlotArea);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.landDimensions]);

  return (
    <Section title="4. Occupant & building details" defaultOpen={false}>
      <Grid cols={3}>
        <Field label="Vacant / Occupied">
          <Select options={["Occupied", "Vacant"]} value={occ.status} onChange={(e) => setOccupant("status", e.target.value)} />
        </Field>
        <Field label="Name of Occupant">
          <TextInput placeholder="GF -Tenants, FF- Owners" value={occ.nameOfOccupant} onChange={(e) => setOccupant("nameOfOccupant", e.target.value)} />
        </Field>
        <Field label="Occupied from">
          <TextInput value={occ.occupiedFrom} onChange={(e) => setOccupant("occupiedFrom", e.target.value)} />
        </Field>
      </Grid>

      <Grid cols={4}>
        <Field label="Property Demarcation">
          <Select options={["Yes", "No"]} value={bd.propertyDemarcation} onChange={(e) => setBD("propertyDemarcation", e.target.value)} />
        </Field>
        <Field label="Property Identified through" span>
          <TextInput placeholder="Property tax and E Bill" value={bd.propertyIdentifiedThrough} onChange={(e) => setBD("propertyIdentifiedThrough", e.target.value)} />
        </Field>
        <Field label="Type of structure">
          <TextInput placeholder="RCC" value={bd.typeOfStructure} onChange={(e) => setBD("typeOfStructure", e.target.value)} />
        </Field>
        <Field label="Plot Area">
          <TextInput placeholder="107 Sq.Yds" value={bd.plotArea} onChange={(e) => setBD("plotArea", e.target.value)} />
        </Field>
        <Field label="No. of Floors">
          <TextInput placeholder="G+1" value={bd.noOfFloors} onChange={(e) => setBD("noOfFloors", e.target.value)} />
        </Field>
        <Field label="Floor Valued">
          <TextInput placeholder="G+1" value={bd.floorValued} onChange={(e) => setBD("floorValued", e.target.value)} />
        </Field>
        <Field label="No of unit per floor">
          <TextInput placeholder="1 Unit" value={bd.noOfUnitPerFloor} onChange={(e) => setBD("noOfUnitPerFloor", e.target.value)} />
        </Field>
        <Field label="No. of lifts">
          <TextInput placeholder="NA" value={bd.noOfLifts} onChange={(e) => setBD("noOfLifts", e.target.value)} />
        </Field>
      </Grid>

      <Grid cols={4}>
        <Field label="No. of units">
          <TextInput value={data.unitDetails.noOfUnits} onChange={(e) => setUnit("noOfUnits", e.target.value)} />
        </Field>
        <Field label="Quality of construction">
          <Select options={["Excellent", "Good", "Average", "Poor"]} value={data.quality.construction} onChange={(e) => setQuality("construction", e.target.value)} />
        </Field>
        <Field label="Interiors / Exteriors">
          <Select options={["Excellent", "Good", "Average", "Poor"]} value={data.quality.interiorsExteriors} onChange={(e) => setQuality("interiorsExteriors", e.target.value)} />
        </Field>
      </Grid>

      <Grid cols={4}>
        <Field label="Age of the property">
          <TextInput placeholder="15 Years" value={data.age.ageOfProperty} onChange={(e) => setAge("ageOfProperty", e.target.value)} />
        </Field>
        <Field label="Residual life">
          <TextInput placeholder="45 Years" value={data.age.residualLife} onChange={(e) => setAge("residualLife", e.target.value)} />
        </Field>
      </Grid>
    </Section>
  );
}
