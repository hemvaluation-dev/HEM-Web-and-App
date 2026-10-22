"use client";

import { useState } from "react";
import { cloneDefaultFormData } from "../defaultData";
import { Button, Field, TextInput } from "./ui";
import ApplicantSection from "./sections/ApplicantSection";
import BoundariesSection from "./sections/BoundariesSection";
import DimensionsSection from "./sections/DimensionsSection";
import PropertyDetailsSection from "./sections/PropertyDetailsSection";
import LocationSection from "./sections/LocationSection";
import UtilitiesSection from "./sections/UtilitiesSection";
import ValuationSection from "./sections/ValuationSection";
import RemarksSection from "./sections/RemarksSection";
import PhotographsSection from "./sections/PhotographsSection";

export default function Home() {
  const [data, setData] = useState(() => cloneDefaultFormData());
  const [status, setStatus] = useState("idle"); // idle | working | error
  const [errorMsg, setErrorMsg] = useState("");

  const setCompany = (field, value) =>
    setData((d) => ({ ...d, companyInfo: { ...d.companyInfo, [field]: value } }));

  async function handleGenerate(e) {
    e.preventDefault();
    setStatus("working");
    setErrorMsg("");
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || body.error || `Request failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const name = (data.applicant.applicantName || "Valuation-Report").replace(/[^a-z0-9]+/gi, "-");
      a.href = url;
      a.download = `${name}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong generating the report.");
    }
  }

  function handleReset() {
    if (confirm("Clear the whole form and start a new report?")) {
      setData(cloneDefaultFormData());
    }
  }

  return (
    <main className="min-h-screen bg-stone-100">
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="mx-auto max-w-5xl px-5 py-4 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="H.E.M. Associates" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-lg font-semibold text-stone-800">H.E.M. Associates — Valuation Report Builder</h1>
            <p className="text-xs text-stone-500">Fill the form once, get a formatted PDF valuation report.</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleGenerate} className="mx-auto max-w-5xl px-5 py-6">
        <div className="mb-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-stone-600 mb-2">Report letterhead (used on every page)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company name">
              <TextInput value={data.companyInfo.name} onChange={(e) => setCompany("name", e.target.value)} />
            </Field>
            <Field label="Address">
              <TextInput value={data.companyInfo.addressLine} onChange={(e) => setCompany("addressLine", e.target.value)} />
            </Field>
            <Field label="Phone">
              <TextInput value={data.companyInfo.phone} onChange={(e) => setCompany("phone", e.target.value)} />
            </Field>
            <Field label="Email">
              <TextInput value={data.companyInfo.email} onChange={(e) => setCompany("email", e.target.value)} />
            </Field>
          </div>
        </div>

        <ApplicantSection data={data} setData={setData} />
        <BoundariesSection data={data} setData={setData} />
        <DimensionsSection data={data} setData={setData} />
        <PropertyDetailsSection data={data} setData={setData} />
        <LocationSection data={data} setData={setData} />
        <UtilitiesSection data={data} setData={setData} />
        <ValuationSection data={data} setData={setData} />
        <RemarksSection data={data} setData={setData} />
        <PhotographsSection data={data} setData={setData} />

        {status === "error" ? (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMsg}</p>
        ) : null}

        <div className="sticky bottom-4 mt-6 flex items-center justify-end gap-2 rounded-xl border border-stone-200 bg-white/95 backdrop-blur px-4 py-3 shadow-md">
          <Button type="button" variant="ghost" onClick={handleReset}>
            Reset form
          </Button>
          <Button type="submit" disabled={status === "working"}>
            {status === "working" ? "Generating PDF…" : "Generate valuation report (PDF)"}
          </Button>
        </div>
      </form>
    </main>
  );
}
