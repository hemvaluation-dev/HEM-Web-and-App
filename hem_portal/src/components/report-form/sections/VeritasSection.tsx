'use client'

import React from 'react'
import { Field, TextInput } from '../ui'

export default function VeritasSection({ data, setData }: { data: any, setData: any }) {
  const setV = (key: string, value: string) => {
    setData((d: any) => ({
      ...d,
      veritas: {
        ...(d.veritas || {}),
        [key]: value
      }
    }))
  }

  const v = data.veritas || {}

  // A helper for full-width text areas
  const TextAreaField = ({ label, field }: { label: string, field: string }) => (
    <div className="col-span-1 md:col-span-2">
      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
        {label}
      </label>
      <textarea
        value={v[field] || ''}
        onChange={(e) => setV(field, e.target.value)}
        rows={3}
        className="w-full bg-surface-container-low border border-line rounded-xl px-4 py-3 text-sm text-on-surface focus:border-primary outline-none transition-all resize-y"
      />
    </div>
  )

  const InputField = ({ label, field }: { label: string, field: string }) => (
    <Field label={label}>
      <TextInput value={v[field] || ''} onChange={(e: any) => setV(field, e.target.value)} />
    </Field>
  )

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-surface rounded-xl border border-border-base p-6 shadow-sm">
        <h2 className="text-lg font-bold text-on-surface mb-4">Veritas Bank - Valuation & Loan Details</h2>
        
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-brand-dark mb-3 uppercase tracking-wider">Property Values & GLV</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="GLV / SFT w.r.t SRO Rates" field="glv_sft_sro" />
            <InputField label="GLV Land" field="glv_land" />
            <InputField label="Market Value Range per SFT" field="market_range_sft" />
            <InputField label="Rate per SFT adopted" field="rate_sft" />
            <InputField label="Total Carpet Area (SFT)" field="carpet_area" />
            <InputField label="Estimated Cost of Enhancement" field="enhancement" />
            <InputField label="Additional Cost (Amenities/Services)" field="additional_cost" />
            <InputField label="Considered Value for Property Insurance" field="insurance_value" />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-brand-dark mb-3 uppercase tracking-wider">Temporary Roof Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Temp Roof - Existing BUA" field="temp_existing_bua" />
            <InputField label="Temp Roof - Carpet Area" field="temp_carpet_area" />
            <InputField label="Temp Roof - Rate per SFT" field="temp_rate_sft" />
            <InputField label="Temp Roof - Existing Building Value" field="temp_existing_value" />
            <InputField label="Temp Roof - Additional Cost" field="temp_additional_cost" />
            <InputField label="Temp Roof - Total Building Value" field="temp_total_value" />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-brand-dark mb-3 uppercase tracking-wider">Loan & Technical Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Proposal Number" field="proposal_number" />
            <InputField label="Existing Sanctioned Loan Amount" field="existing_loan_amount" />
            <InputField label="Request Loan Amount" field="request_loan_amount" />
            <InputField label="Sanctioned Loan Amount" field="sanctioned_loan_amount" />
            <InputField label="LCR" field="lcr" />
            <InputField label="LTV" field="ltv" />
            <InputField label="Combined LTV" field="combined_ltv" />
            <InputField label="Type of Structure" field="structure" />
            <InputField label="Hazardous Zones Applicable" field="hazardous_zones" />
            <InputField label="Geometry/Design/Structural configs met" field="geometry" />
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-brand-dark mb-3 uppercase tracking-wider">Recommendations & Comments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextAreaField label="Recommended" field="recommended" />
            <TextAreaField label="Comments" field="comments" />
          </div>
        </div>

      </div>
    </div>
  )
}
