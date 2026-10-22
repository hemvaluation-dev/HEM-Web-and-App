'use client'

import MeasurementValuation from '@/components/MeasurementValuation'
import { calculateMeasurements, convertArea, convertRate, numberValue, unit } from '@/lib/valuation/measurements'
import { matchReportPhotos } from '@/lib/reports/photo-types'
import { mapReportFields, isCalculatedField, reportFieldOrigin } from '@/lib/reports/field-mapping'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect, useMemo, FormEvent } from 'react'
import { FileCheck2, Download, Loader2, Search } from 'lucide-react'
import { cloneDefaultFormData } from '@/components/report-form/defaultData'
import { Button, Field, TextInput } from '@/components/report-form/ui'
import ApplicantSection from '@/components/report-form/sections/ApplicantSection'
import BoundariesSection from '@/components/report-form/sections/BoundariesSection'
import DimensionsSection from '@/components/report-form/sections/DimensionsSection'
import PropertyDetailsSection from '@/components/report-form/sections/PropertyDetailsSection'
import LocationSection from '@/components/report-form/sections/LocationSection'
import UtilitiesSection from '@/components/report-form/sections/UtilitiesSection'
import ValuationSection from '@/components/report-form/sections/ValuationSection'
import RemarksSection from '@/components/report-form/sections/RemarksSection'
import PhotographsSection from '@/components/report-form/sections/PhotographsSection'

import { findTemplate, getTemplate, type TemplateDef, type FieldDef } from '@/lib/report-engine/templates'

interface Props {
  caseId: string
  caseData: any
  mergedData: Record<string, any>
  photos: any[]
  locationData: any
}

function val(v: any): string {
  if (v === undefined || v === null || v === '') return ''
  return String(v)
}

function mapToFormData(caseData: any, mergedData: any, photos: any[], locationData: any) {
  mergedData = calculateMeasurements(mergedData)
  const d = cloneDefaultFormData()
  
  d.meta.dateOfInitiate = val(caseData?.created_at?.split('T')[0])
  d.meta.contactNumber = val(mergedData.phone_number || caseData?.phone_number)
  d.meta.personMetAtSite = val(mergedData.person_met_at_site)
  d.meta.relationshipWithCustomer = val(mergedData.relationship_with_customer)
  
  let visitDate = mergedData.visit_date
  if (!visitDate) {
    if (locationData?.created_at) {
      visitDate = locationData.created_at.split('T')[0]
    } else if (photos?.length > 0) {
      visitDate = photos[0].created_at?.split('T')[0]
    }
  }
  d.meta.dateOfVisit = val(visitDate)

  d.applicant.applicantName = val(mergedData.applicant_name || caseData?.applicant_name)
  d.applicant.ownerName = val(mergedData.owner_name)
  d.applicant.typeOfProperty = val(mergedData.property_type || caseData?.property_type)
  d.applicant.distanceFromBranch = val(mergedData.distance_from_branch)
  d.applicant.valuedBefore = val(mergedData.previous_valuation) || "No"
  d.ownershipType = val(mergedData.ownership_type) || "Free Hold"
  
  if (val(mergedData.property_documents_verified)) {
    d.documentsVerified[0].text = val(mergedData.property_documents_verified)
  }
  d.applicant.doorPlotNo = val(caseData?.address) 
  
  d.boundaries.east.doc = val(mergedData.boundaries_document_east)
  d.boundaries.west.doc = val(mergedData.boundaries_document_west)
  d.boundaries.north.doc = val(mergedData.boundaries_document_north)
  d.boundaries.south.doc = val(mergedData.boundaries_document_south)
  d.boundaries.east.site = val(mergedData.boundaries_physical_east)
  d.boundaries.west.site = val(mergedData.boundaries_physical_west)
  d.boundaries.north.site = val(mergedData.boundaries_physical_north)
  d.boundaries.south.site = val(mergedData.boundaries_physical_south)
  d.boundaries.matching = val(mergedData.boundaries_matching) || "Yes"

  d.setBacks.front = val(mergedData.setback_front)
  d.setBacks.back = val(mergedData.setback_rear)
  d.setBacks.right = val(mergedData.setback_right)
  d.setBacks.left = val(mergedData.setback_left)

  d.landDimensions.east = val(mergedData.land_measurements_east)
  d.landDimensions.west = val(mergedData.land_measurements_west)
  d.landDimensions.north = val(mergedData.land_measurements_north)
  d.landDimensions.south = val(mergedData.land_measurements_south)

  d.buildingDimensions.east = val(mergedData.plinth_measurements_east)
  d.buildingDimensions.west = val(mergedData.plinth_measurements_west)
  d.buildingDimensions.north = val(mergedData.plinth_measurements_north)
  d.buildingDimensions.south = val(mergedData.plinth_measurements_south)

  d.slabDimensions.east = val(mergedData.slab_measurements_east)
  d.slabDimensions.west = val(mergedData.slab_measurements_west)
  d.slabDimensions.north = val(mergedData.slab_measurements_north)
  d.slabDimensions.south = val(mergedData.slab_measurements_south)

  d.buildingDetails.noOfFloors = val(mergedData.no_of_floors)
  d.buildingDetails.floorValued = val(mergedData.floor_valued)
  d.unitDetails.noOfUnits = val(mergedData.no_of_units)
  d.age.ageOfProperty = val(mergedData.age_of_property)
  d.age.residualLife = val(mergedData.residual_life)
  
  d.quality.construction = val(mergedData.quality_of_construction) || "Good"
  d.quality.interiorsExteriors = val(mergedData.interiors_exteriors) || "Good"

  d.location.classOfLocality = val(mergedData.class_of_locality)
  d.location.siteIs = val(mergedData.site_developed) || "Developed"
  d.location.proximityToCivicAmenities = val(mergedData.proximity_amenities)
  
  d.municipal.withinLimits = val(mergedData.within_municipal_limits) || "Yes"
  d.municipal.nameOfPanchayat = val(mergedData.panchayat_name)
  
  d.siteAccess = val(mergedData.site_access) || "Easy"
  d.basicAmenities = val(mergedData.basic_amenities) || "Near By"
  d.marketability = val(mergedData.marketability) || "Good"
  
  d.electricity.highTensionWires = val(mergedData.high_tension_wires) || "No"
  d.electricity.areaLeftForCross = val(mergedData.area_left_for_cross)
  d.electricity.jointWallSlab = val(mergedData.joint_wall_slab) || "No"
  d.electricity.graveyardNearby = val(mergedData.graveyard_nearby) || "No"

  d.measurements = mergedData
  d.valuation.landAreaSqYds = numberValue(mergedData.land_area) === null ? '' : String(convertArea(Number(mergedData.land_area), unit(mergedData.land_area_unit), 'sqyd'))
  d.valuation.landRate = numberValue(mergedData.land_rate) === null ? '' : String(convertRate(Number(mergedData.land_rate), unit(mergedData.land_rate_unit), 'sqyd'))
  d.valuation.totalConstructionArea = numberValue(mergedData.bua) === null ? '' : String(convertArea(Number(mergedData.bua), unit(mergedData.bua_unit), 'sqft'))
  d.valuation.constructionRate = numberValue(mergedData.construction_rate) === null ? '' : String(convertRate(Number(mergedData.construction_rate), unit(mergedData.construction_rate_unit, 'sqft'), 'sqft'))
  d.valuation.stageOfConstruction = val(mergedData.stage_of_construction) || "Completed"
  d.valuation.stagePercent = val(mergedData.stage_percentage) || "100%"
  d.valuation.recommendedPercent = val(mergedData.recommended_percentage) || "NA"
  
  if (mergedData.remarks_and_violations) {
    d.remarks[0].text = mergedData.remarks_and_violations
  }

  const getPhoto = (typeStr: string) => {
    const p = photos.find(ph => ph.photo_type?.toLowerCase().includes(typeStr.toLowerCase()))
    return p ? p.file_url : ""
  }
  
  d.photographs.elevation.image = getPhoto('elevation')
  d.photographs.roadView.image = getPhoto('road')
  
  const elevationPhoto = photos.find(ph => ph.photo_type?.toLowerCase().includes('elevation'))
  const roadPhoto = photos.find(ph => ph.photo_type?.toLowerCase().includes('road'))
  const excludeIds = new Set([elevationPhoto?.id, roadPhoto?.id].filter(Boolean))

  const extras = photos
    .filter(ph => !excludeIds.has(ph.id) && ph.file_url)
    .map((ph, idx) => ({
      id: ph.id || `extra_${idx}`,
      caption: (ph.photo_type || 'Extra Photo').replace(/_/g, ' ').toUpperCase(),
      image: ph.file_url
    }))
  
  d.photographs.extra = extras

  return d
}

// ----------------------------------------------------------------------------------
// TEMPLATE ENGINE HELPERS
// ----------------------------------------------------------------------------------
function visibleFields(t: TemplateDef) { return t.fields.filter(f => !f.hidden); }
function photoCount(t: TemplateDef) { return t.photoSlots?.length ?? t.photoCount ?? t.photoMedia?.length ?? 0; }
function photoLabel(t: TemplateDef, i: number) { return t.photoSlots?.[i]?.label ?? `Property / report photo ${i + 1}`; }
function groupFields(t: TemplateDef) {
  const m = new Map<string, { f: FieldDef; i: number }[]>();
  visibleFields(t).forEach((f, i) => {
    const key = f.section || f.sheet || `Table ${(f.table ?? 0) + 1}`;
    const a = m.get(key) || []; a.push({ f, i }); m.set(key, a)
  });
  return [...m.entries()];
}
function isLongField(f: FieldDef) { return f.multiline === true || (f.sample?.length ?? 0) > 90 || /address|document|remark|comment|description|details|observation|boundary/i.test(f.label); }

// ----------------------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------------------
export default function ReportGenerator({ caseId, caseData, mergedData, photos, locationData }: Props) {
  const clientTemplateName = (findTemplate(caseData?.client?.template_name) ?? findTemplate(caseData?.client?.name))?.id;
  const isTemplateClient = Boolean(clientTemplateName);
  
  if (isTemplateClient) {
    return <TemplateForm clientTemplateName={clientTemplateName} caseId={caseId} caseData={caseData} mergedData={mergedData} photos={photos} locationData={locationData} />
  }

  return <>
    <div className="ui-panel p-5 mb-5 text-sm" role="status">
      <p className="font-semibold">Generic valuation report</p>
      <p className="mt-1 text-muted">A lender-specific template is not configured for {caseData?.client?.name || 'this institution'} ({caseData?.client?.template_name || 'no template ID'}). This form generates the standard HEM PDF. The institution’s original template is needed for its exact report format.</p>
    </div>
    <LegacyPdfForm caseId={caseId} caseData={caseData} mergedData={mergedData} photos={photos} locationData={locationData} />
  </>
}

// ----------------------------------------------------------------------------------
// NEW TEMPLATE-DRIVEN FORM (DOCX/XLSX)
// ----------------------------------------------------------------------------------
function TemplateForm({ clientTemplateName, caseId, caseData, mergedData, photos, locationData }: any) {
  const router = useRouter();
  const selected = useMemo(() => getTemplate(clientTemplateName), [clientTemplateName]);
  
  const [measurements, setMeasurements] = useState(() => calculateMeasurements(mergedData));
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const data = useMemo(() => mapReportFields(selected, measurements, overrides, caseData, locationData), [selected, measurements, overrides, caseData, locationData]);

  const [files, setFiles] = useState<(File | string | null)[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    // Attempt to pre-fill photo slots from uploaded photos
    const initFiles = matchReportPhotos<{photo_type?: string | null; file_url: string}>(selected, photos || []).map(photo => photo?.file_url || null);
    setFiles(initFiles);
  }, [photos, selected]);

  const sections = groupFields(selected);
  const visible = (items: { f: FieldDef; i: number }[]) => items.filter(({ f }) => !search || f.label.toLowerCase().includes(search.toLowerCase()) || (f.section ?? '').toLowerCase().includes(search.toLowerCase()));
  const setField = (id: string, v: string) => setOverrides(d => ({ ...d, [id]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('report_id', selected.id);
      fd.append('case_id', caseId);
      fd.append('revision', String(caseData.revision));
      fd.append('data_json', JSON.stringify(data));
      fd.append('measurement_json', JSON.stringify(measurements));
      
      // Existing evidence stays in storage; send its case-scoped ID instead of downloading and uploading it again.
      files.forEach((file, index) => {
        if (file instanceof File) fd.append(`photo_${index}`, file);
        else if (typeof file === 'string') {
          const photo = photos.find((photo: { id: string; file_url: string }) => photo.file_url === file);
          if (!photo) throw new Error('A photo is no longer available. Refresh the case.');
          fd.append(`photo_id_${index}`, photo.id);
        }
      });

      const res = await fetch('/api/generate-template-report', { method: 'POST', body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Report generation failed');
      }
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const first = visibleFields(selected).map(f => data[f.id]).find(Boolean) || 'valuation_report';
      a.download = `${String(first).replace(/[^a-zA-Z0-9_-]/g, '_')}_${selected.id}.${selected.kind}`;
      a.click();
      router.refresh();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report generation failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8 text-on-surface">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface rounded-xl border border-border-base p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-brand-dark" />
            {selected.client} — Report Generation
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Review and edit the saved field data before generating the {selected.kind.toUpperCase()} report.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={submit} disabled={busy} className="px-4 py-2 text-sm font-bold rounded-xl bg-primary hover:opacity-90 text-on-primary transition-all flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Generate {selected.kind.toUpperCase()}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
          <input 
            className="w-full bg-surface-container-low border border-line rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-all" 
            placeholder="Search template fields or sections..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>

        <form onSubmit={submit} className="space-y-6">
          <MeasurementValuation data={measurements} onChange={setMeasurements} disabled={busy} />
          <details className="ui-panel p-5" open={search ? true : undefined}>
            <summary className="cursor-pointer font-semibold">Calculated values included in this report</summary>
            <p className="mt-2 text-sm text-muted">These values come from Measurements and valuation above or the report’s additional valuation inputs. They are included automatically; no second entry is needed. Document, approved and proposed areas remain separate inputs below.</p>
            <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {visible(sections.flatMap(([, items]) => items)).filter(({ f }) => isCalculatedField(selected.id, f.id)).map(({ f, i }) => (
                <div key={`${f.id}-${i}`} className="border-b border-line pb-3">
                  <dt className="text-sm text-muted">{f.label}</dt>
                  <dd className="font-semibold">{data[f.id] || 'Not provided'}</dd>
                  <dd className="text-xs text-muted">{reportFieldOrigin(selected.id, f.id)}</dd>
                </div>
              ))}
            </dl>
          </details>
          {sections.map(([name, items], sectionIndex) => {
            const v = visible(items).filter(({ f }) => !isCalculatedField(selected.id, f.id));
            if (!v.length) return null;
            return (
              <div key={`${selected.id}-section-${sectionIndex}-${name}`} className="bg-surface rounded-xl border border-border-base p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-brand-dark mb-4 uppercase tracking-wider">{name} <span className="text-on-surface-variant/50 font-normal">({v.length})</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {v.map(({ f, i }) => (
                    <div className={isLongField(f) ? 'col-span-1 md:col-span-2' : ''} key={`${selected.id}-${f.id}-${i}`}>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        {f.label}
                      </label>
                      <p className="mb-2 text-xs text-on-surface-variant">{reportFieldOrigin(selected.id, f.id)}</p>
                      {isLongField(f) ? (
                        <textarea
                          value={data[f.id] ?? ''}
                          readOnly={isCalculatedField(selected.id, f.id)}
                          placeholder={f.label}
                          onChange={e => setField(f.id, e.target.value)}
                          rows={3}
                          className="w-full bg-surface-container-low border border-line rounded-xl px-4 py-3 text-sm text-on-surface focus:border-primary outline-none transition-all resize-y"
                        />
                      ) : (
                        <input
                          type={f.cellType === 'date' ? 'date' : 'text'}
                          value={data[f.id] ?? ''}
                          readOnly={isCalculatedField(selected.id, f.id)}
                          placeholder={f.label}
                          onChange={e => setField(f.id, e.target.value)}
                          className="w-full bg-surface-container-low border border-line rounded-xl px-4 py-3 text-sm text-on-surface focus:border-primary outline-none transition-all"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="bg-surface rounded-xl border border-border-base p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-brand-dark mb-4 uppercase tracking-wider">Property Photos</h3>
            <p className="text-xs text-on-surface-variant mb-6">
              Photos are matched by type to the selected lender’s placeholders. Choose a saved photo or upload a replacement. Map and screenshot slots use the report width within its margins. For general screenshots, choose the intended slot below.
            </p>
            {Array.from({ length: photoCount(selected) }).some((_, i) => !files[i]) && (
              <div className="ui-panel p-4 mb-4 text-sm" role="status">
                <p className="font-semibold">Some report photo slots are empty</p>
                <p className="mt-1">No image selected for: {Array.from({ length: photoCount(selected) }).filter((_, i) => !files[i]).length} of {photoCount(selected)} slots. Only saved or uploaded images can appear in the report.</p>
                <p className="mt-1 text-muted">{Array.from({ length: photoCount(selected) }, (_, i) => !files[i] ? photoLabel(selected, i) : null).filter(Boolean).join(', ')}</p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: photoCount(selected) }).map((_, i) => (
                <div className="border border-line rounded-xl p-3 bg-surface-container-low" key={`${selected.id}-photo-${i}`}>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Photo {i + 1}
                  </label>
                  <span className="block text-[11px] text-on-surface-variant mb-2 truncate">
                    {photoLabel(selected, i)}
                  </span>
                  
                  {typeof files[i] === 'string' && (files[i] as string).startsWith('http') ? (
                    <div className="mb-2 w-full h-24 rounded-lg overflow-hidden border border-border-base relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={files[i] as string} alt="Selected report photo" className="w-full h-full object-contain" />
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); const n = [...files]; n[i] = null; setFiles(n); }}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-100 transition-opacity text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}

                  <select aria-label={`Saved photo for ${photoLabel(selected, i)}`} className="ui-input mb-2 w-full text-xs" value={typeof files[i] === 'string' ? files[i] as string : ''} onChange={e => { const n = [...files]; n[i] = e.target.value || null; setFiles(n); }}>
                    <option value="">Choose saved photo / leave blank</option>
                    {photos.map((photo: {id: string; file_url: string; photo_type: string}, index: number) => <option key={photo.id} value={photo.file_url}>{index + 1}. {photo.photo_type || 'Other'}</option>)}
                  </select>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="w-full text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-brand-dark hover:file:bg-primary/20 transition-colors"
                    onChange={e => {
                      const n = [...files];
                      n[i] = e.target.files?.[0] ?? null;
                      setFiles(n);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <div className="rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger font-medium">{error}</div>}
        </form>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------------
// LEGACY HEM PDF FORM (FALLBACK)
// ----------------------------------------------------------------------------------
function LegacyPdfForm({ caseId, caseData, mergedData, photos, locationData }: Props) {
  const [data, setData] = useState(() => mapToFormData(caseData, mergedData, photos, locationData))
  const router = useRouter()
  const [status, setStatus] = useState("idle")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    setData(mapToFormData(caseData, mergedData, photos, locationData))
  }, [caseData, mergedData, photos, locationData])

  const setCompany = (field: string, value: string) =>
    setData((d: any) => ({ ...d, companyInfo: { ...d.companyInfo, [field]: value } }))

  async function handleGenerate(e: any) {
    e.preventDefault()
    setStatus("working")
    setErrorMsg("")
    try {
      const res = await fetch(`/api/generate-report?case_id=${caseId}&revision=${caseData.revision}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || body.error || `Request failed (${res.status})`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const name = (data.applicant.applicantName || caseData?.application_number || "Valuation-Report").replace(/[^a-z0-9]+/gi, "-")
      
      a.href = url
      a.download = `${name}.pdf`
      document.body.appendChild(a)
      a.click()
      router.refresh()
      a.remove()
      URL.revokeObjectURL(url)
      setStatus("idle")
    } catch (err: any) {
      console.error(err)
      setStatus("error")
      setErrorMsg(err.message || `Something went wrong generating the report.`)
    }
  }

  function handleReset() {
    if (confirm("Reset the form to saved field data?")) {
      setData(mapToFormData(caseData, mergedData, photos, locationData))
    }
  }

  return (
    <div className="space-y-8 text-on-surface">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface rounded-xl border border-border-base p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-brand-dark" />
            Report Generation (PDF Fallback)
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            No specific DOCX/XLSX template found for this client. Generating the standard PDF report.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={status === "working"}
            className="px-4 py-2 text-sm font-bold rounded-xl bg-primary hover:opacity-90 text-on-primary transition-all flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "working" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Generate PDF
          </button>
        </div>
      </div>

      <form className="mx-auto max-w-5xl">
        <div className="mb-4 rounded-xl border border-border-base bg-surface p-4 shadow-sm">
          <p className="text-xs font-medium text-on-surface-variant mb-2">Report letterhead (used on every page)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company name">
              <TextInput value={data.companyInfo.name} onChange={(e: any) => setCompany("name", e.target.value)} />
            </Field>
            <Field label="Address">
              <TextInput value={data.companyInfo.addressLine} onChange={(e: any) => setCompany("addressLine", e.target.value)} />
            </Field>
            <Field label="Phone">
              <TextInput value={data.companyInfo.phone} onChange={(e: any) => setCompany("phone", e.target.value)} />
            </Field>
            <Field label="Email">
              <TextInput value={data.companyInfo.email} onChange={(e: any) => setCompany("email", e.target.value)} />
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
          <p className="mt-4 rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{errorMsg}</p>
        ) : null}

        <div className="sticky bottom-4 mt-6 flex items-center justify-end gap-2 rounded-xl border border-border-base bg-surface/95 backdrop-blur px-4 py-3 shadow-md">
          <Button type="button" variant="ghost" onClick={handleReset}>
            Reset to Saved Field Data
          </Button>
        </div>
      </form>
    </div>
  )
}
