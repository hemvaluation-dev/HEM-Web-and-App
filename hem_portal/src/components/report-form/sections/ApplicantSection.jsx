"use client";

import { Section, Grid, Field, TextInput, Select } from "../ui";

export default function ApplicantSection({ data, setData }) {
  const setMeta = (field, value) =>
    setData((d) => ({ ...d, meta: { ...d.meta, [field]: value } }));
  const setApplicant = (field, value) =>
    setData((d) => ({ ...d, applicant: { ...d.applicant, [field]: value } }));

  const m = data.meta;
  const a = data.applicant;

  return (
    <Section title="1. Report details & applicant" subtitle="Dates, contact, applicant, owner and site address">
      <Grid cols={4}>
        <Field label="Date of Initiate">
          <TextInput type="date" value={m.dateOfInitiate} onChange={(e) => setMeta("dateOfInitiate", e.target.value)} />
        </Field>
        <Field label="Date of Visit">
          <TextInput type="date" value={m.dateOfVisit} onChange={(e) => setMeta("dateOfVisit", e.target.value)} />
        </Field>
        <Field label="Contact Number">
          <TextInput value={m.contactNumber} onChange={(e) => setMeta("contactNumber", e.target.value)} />
        </Field>
        <Field label="Name of person met at site">
          <TextInput value={m.personMetAtSite} onChange={(e) => setMeta("personMetAtSite", e.target.value)} />
        </Field>
        <Field label="Relationship with the customer" span>
          <TextInput value={m.relationshipWithCustomer} onChange={(e) => setMeta("relationshipWithCustomer", e.target.value)} />
        </Field>
      </Grid>

      <Grid cols={4}>
        <Field label="Name of the Applicant" span>
          <TextInput value={a.applicantName} onChange={(e) => setApplicant("applicantName", e.target.value)} />
        </Field>
        <Field label="Name of the Owner" span>
          <TextInput value={a.ownerName} onChange={(e) => setApplicant("ownerName", e.target.value)} />
        </Field>
        <Field label="Type of property">
          <TextInput placeholder="RCC" value={a.typeOfProperty} onChange={(e) => setApplicant("typeOfProperty", e.target.value)} />
        </Field>
        <Field label="Distance from Branch Office">
          <TextInput placeholder="20 KM" value={a.distanceFromBranch} onChange={(e) => setApplicant("distanceFromBranch", e.target.value)} />
        </Field>
      </Grid>

      <p className="text-xs font-medium text-on-surface-variant mt-4 mb-1">Address at site</p>
      <Grid cols={4}>
        <Field label="D.No/Plot No">
          <TextInput value={a.doorPlotNo} onChange={(e) => setApplicant("doorPlotNo", e.target.value)} />
        </Field>
        <Field label="Street Name">
          <TextInput value={a.streetName} onChange={(e) => setApplicant("streetName", e.target.value)} />
        </Field>
        <Field label="Sy.No">
          <TextInput value={a.syNo} onChange={(e) => setApplicant("syNo", e.target.value)} />
        </Field>
        <Field label="Village Name">
          <TextInput value={a.villageName} onChange={(e) => setApplicant("villageName", e.target.value)} />
        </Field>
        <Field label="Land mark">
          <TextInput value={a.landMark} onChange={(e) => setApplicant("landMark", e.target.value)} />
        </Field>
        <Field label="Pincode">
          <TextInput value={a.pincode} onChange={(e) => setApplicant("pincode", e.target.value)} />
        </Field>
      </Grid>

      <Grid cols={4}>
        <Field label="Valuator done valuation before?">
          <Select options={["No", "Yes"]} value={a.valuedBefore} onChange={(e) => setApplicant("valuedBefore", e.target.value)} />
        </Field>
        {a.valuedBefore === "Yes" ? (
          <Field label="If yes, when, for whom?" span>
            <TextInput value={a.valuedBeforeDetails} onChange={(e) => setApplicant("valuedBeforeDetails", e.target.value)} />
          </Field>
        ) : null}
      </Grid>
    </Section>
  );
}
