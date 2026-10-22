'use client'

import { useRouter } from 'next/navigation'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import MeasurementValuation from '@/components/MeasurementValuation'
import { calculateMeasurements, measurementGroups } from '@/lib/valuation/measurements'
import { ListChecks, CheckCircle2, AlertCircle, ClipboardCheck, Save, X, AlertTriangle, Edit3, Home, Square, Ruler, Move, Zap, MoreHorizontal, User, LayoutList } from 'lucide-react'
import { updateDataReview } from './actions'
import { STANDARD_FIELDS } from '@/utils/constants'

interface Props {
  caseId: string
  initialData: Record<string, any>
  revision: number
  status: string
}

export default function EditableDataReview({ caseId, initialData, revision, status }: Props) {
  const router = useRouter()
  // Combine standard fields with any existing custom keys in initialData
  const allKeys = Array.from(new Set([
    ...Object.keys(initialData).filter(k => !['id', 'case_id', 'created_at', 'updated_at'].includes(k)),
    ...STANDARD_FIELDS
  ]))

  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const data: Record<string, any> = {}
    allKeys.forEach(key => {
      data[key] = initialData[key] !== undefined && initialData[key] !== null ? initialData[key] : ''
    })
    return calculateMeasurements(data)
  })

  const [initialState, setInitialState] = useState<Record<string, any>>(() => {
    const data: Record<string, any> = {}
    allKeys.forEach(key => {
      data[key] = initialData[key] !== undefined && initialData[key] !== null ? initialData[key] : ''
    })
    return calculateMeasurements(data)
  })

  const locked = ['in_review', 'reviewed', 'completed'].includes(status)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const formatKey = (key: string) => {
    return key
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const formatKeyWithUnits = (key: string) => {
    const labels: Record<string, string> = {
      land_area_as_per_physical: 'Separately recorded site area (legacy)',
      applicant_contact: 'Additional applicant contact',
      pct_recommendation: 'Recommendation % (legacy entry)',
      road_width: 'Road width at property',
      approach_road_width: 'Approach road width',
      floor_wise_area: 'Individual floor areas (sq.fts)',
    }
    const baseLabel = labels[key] || formatKey(key)
    
    if (['land_area', 'land_area_as_per_physical', 'bua', 'slab_area'].includes(key)) {
      return `${baseLabel} (sq yards)`
    }
    if (key.includes('measurements') || key.includes('setback') || key === 'road_width') {
      return `${baseLabel} (ft)`
    }
    return baseLabel
  }

  const numericFields = [
    'age_of_property',
    'no_of_floors',
    'land_measurements_east',
    'land_measurements_west',
    'land_measurements_north',
    'land_measurements_south',
    'land_area',
    'land_area_as_per_physical',
    'plinth_measurements_east',
    'plinth_measurements_west',
    'plinth_measurements_north',
    'plinth_measurements_south',
    'bua',
    'slab_measurements_east',
    'slab_measurements_west',
    'slab_measurements_north',
    'slab_measurements_south',
    'slab_area',
    'road_width',
    'setback_front',
    'setback_rear',
    'setback_right',
    'setback_left',
    'no_of_units',
    'land_rate',
    'rental_per_month',
    'phone_number',
    'applicant_contact',
    'distance_from_branch',
    'residual_life',
    'construction_rate',
    'stage_percentage',
    'recommended_percentage',
    'dist_railway',
    'dist_bus',
    'dist_city_center',
    'approach_road_width',
    'total_value',
    'distress_value',
    'gov_value',
    'pct_recommendation'
  ]

  // Calculate modified fields
  const modifiedEntries = Object.keys(formData).filter(
    key => JSON.stringify(formData[key] ?? '') !== JSON.stringify(initialState[key] ?? '')
  )

  const hasChanges = modifiedEntries.length > 0

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => calculateMeasurements({ ...prev, [key]: value }))
    setSaveSuccess(false)
  }

  const handleSaveClick = () => {
    if (!hasChanges) return
    setShowConfirmModal(true)
  }

  const handleConfirmSave = async () => {
    setSaving(true)
    setErrorMessage(null)

    try {
      const res = await Promise.race([
        updateDataReview(caseId, formData, revision, modifiedEntries),
        new Promise<{ error: string }>(resolve => setTimeout(() => resolve({ error: 'Saving timed out. Your edits remain on screen. Check whether the case updated before trying again.' }), 30000)),
      ])
      if (res.error) {
        setErrorMessage(res.error)
      } else {
        setInitialState({ ...formData })
        setSaveSuccess(true)
        router.refresh()
      }
    } catch {
      setErrorMessage('Changes could not be saved. Your edits are still here. Check your connection and try again.')
    } finally {
      setSaving(false)
      setShowConfirmModal(false)
    }
  }

  return (
    <div className="space-y-8 text-on-surface relative">
      <MeasurementValuation data={formData} disabled={locked || saving} onChange={next => { setFormData(next); setSaveSuccess(false) }} />
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface rounded-xl border border-border-base p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-brand-dark" />
            Field Data Review
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Review and edit property measurements, boundaries, and inspection details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-success dark:text-emerald-400 rounded-xl font-semibold text-sm border border-emerald-500/20 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved Successfully</span>
            </div>
          )}

          <button
            onClick={handleSaveClick}
            disabled={!hasChanges || saving || locked}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
              hasChanges
                ? 'bg-primary hover:bg-primary-hover text-on-primary cursor-pointer shadow-primary/20 hover:shadow-md'
                : 'bg-surface-dim text-on-surface-variant cursor-not-allowed border border-border-base opacity-60'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving…' : locked ? 'Editing locked during review' : `Save Changes ${hasChanges ? `(${modifiedEntries.length})` : ''}`}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="p-4 bg-red-500/10 border border-red-500/20 text-danger dark:text-red-400 rounded-xl flex items-center gap-3 font-medium text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Failed to save changes: {errorMessage}</span>
        </div>
      )}

      {locked && <p role="status" className="ui-panel p-4 text-sm">Completed cases are read only. For a legacy review case, select Revise data and report under Case completion & team assignments before editing.</p>}
      {/* Fields Grid */}
      <div className="bg-surface rounded-xl border border-border-base p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-base/40">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-brand-dark">
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface">Editable Property Fields</h3>
              <p className="text-xs text-on-surface-variant">Update any incorrect or missing values below. Changes require confirmation.</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full">
            {allKeys.length} Total Fields
          </span>
        </div>

        <fieldset disabled={locked} className="space-y-12">
          {(() => {
            const fieldGroups = [
              {
                title: 'Meta & Applicant',
                icon: User,
                keys: ['case_ref', 'applicant_name', 'phone_number', 'applicant_contact', 'person_met_at_site', 'relationship_with_customer', 'owner_name', 'distance_from_branch', 'previous_valuation']
              },
              {
                title: 'Property Details',
                icon: Home,
                keys: ['branch', 'property_address', 'property_type', 'age_of_property', 'no_of_floors', 'property_usage', 'structure_type', 'flooring_type', 'occupancy_details', 'property_documents_verified', 'ownership_type', 'quality_of_construction', 'interiors_exteriors', 'residual_life']
              },
              {
                title: 'Boundaries',
                icon: Square,
                keys: ['boundaries_document_east', 'boundaries_document_west', 'boundaries_document_north', 'boundaries_document_south', 'boundaries_physical_east', 'boundaries_physical_west', 'boundaries_physical_north', 'boundaries_physical_south', 'boundaries_matching', 'boundary_mismatch_reason']
              },
              {
                title: 'Measurements & Area',
                icon: Ruler,
                keys: ['linear_dimensions', 'linear_dimensions_matching', 'land_measurements_east', 'land_measurements_west', 'land_measurements_north', 'land_measurements_south', 'land_area', 'land_area_as_per_physical', 'land_mismatch_reason', 'plinth_measurements_east', 'plinth_measurements_west', 'plinth_measurements_north', 'plinth_measurements_south', 'bua', 'slab_measurements_east', 'slab_measurements_west', 'slab_measurements_north', 'slab_measurements_south', 'slab_area', 'excess_land']
              },
              {
                title: 'Setbacks',
                icon: Move,
                keys: ['setback_front', 'setback_rear', 'setback_right', 'setback_left', 'road_width']
              },
              {
                title: 'Location & Surroundings',
                icon: Home,
                keys: ['class_of_locality', 'site_developed', 'proximity_amenities', 'within_municipal_limits', 'panchayat_name', 'site_access', 'landmark', 'gps_coordinates', 'address_docs', 'dist_railway', 'dist_bus', 'dist_city_center', 'approach_road_width']
              },
              {
                title: 'Features & Environment',
                icon: Zap,
                keys: ['meter_number', 'meter_owner_name', 'bill_generated_name', 'meter_owner_matching', 'lift', 'lift_available', 'near_hazards', 'demarcation_available', 'basic_amenities', 'marketability', 'high_tension_wires', 'area_left_for_cross', 'joint_wall_slab', 'graveyard_nearby']
              },
              {
                title: 'Additional & Valuation',
                icon: MoreHorizontal,
                keys: ['property_identified_by', 'no_of_units', 'community_dominated', 'land_rate', 'rental_per_month', 'construction_rate', 'stage_of_construction', 'stage_percentage', 'recommended_percentage', 'total_value', 'distress_value', 'gov_value', 'pct_recommendation', 'remarks_and_violations']
              }
            ]
          
            const groupedKeys = new Set(fieldGroups.flatMap(g => g.keys))
            const otherKeys = allKeys.filter(k => !groupedKeys.has(k))
            
            if (otherKeys.length > 0) {
              fieldGroups.push({
                title: 'Other Details',
                icon: LayoutList,
                keys: otherKeys
              })
            }

            return fieldGroups.map((group) => {
              const groupKeys = group.keys.filter(k => allKeys.includes(k) && !measurementGroups.some(g => k === g.area || k === g.rate || k === g.amount || k.startsWith(g.prefix + '_measurements_')) && !k.endsWith('_unit') && k !== 'total_value' && !k.startsWith('include_'))
              if (groupKeys.length === 0) return null
  
              return (
                <div key={group.title} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border-base/50">
                    <group.icon className="w-5 h-5 text-brand-dark" />
                    <h4 className="text-lg font-bold text-on-surface">{group.title}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupKeys.map((key) => {
                      const isModified = String(formData[key] ?? '') !== String(initialState[key] ?? '')
                      return (
                        <div 
                          key={key} 
                          className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                            isModified 
                              ? 'bg-primary/5 border-primary shadow-sm' 
                              : 'bg-surface-container-low border-border-base/50 hover:border-border-base'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                              {formatKeyWithUnits(key)}
                            </label>
                            {isModified && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 bg-primary text-on-primary rounded-full uppercase tracking-wider">
                                Modified
                              </span>
                            )}
                          </div>
                          {key === 'floor_wise_area' ? (
                            <div className="space-y-3">
                              {(() => {
                                let floors = [];
                                try {
                                  floors = Array.isArray(formData[key]) ? formData[key] : (typeof formData[key] === 'string' && formData[key] ? JSON.parse(formData[key]) : []);
                                } catch (e) {
                                  floors = [];
                                }
                                if (!Array.isArray(floors)) floors = [];
                                
                                return floors.map((floor: any, i: number) => (
                                  <div key={i} className="flex flex-col gap-2 p-3 bg-surface border border-border-base rounded-xl text-sm">
                                    <span className="font-bold text-xs uppercase text-brand-dark">{floor.floor || `Floor ${i+1}`}</span>
                                    <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        aria-label={`${floor.floor || `Floor ${i+1}`} slab area (sq.fts)`}
                                        placeholder="Floor slab area (sq.fts)"
                                        value={floor.slabArea || ''} 
                                        onChange={(e) => {
                                          const newArr = [...floors];
                                          newArr[i] = { ...newArr[i], slabArea: e.target.value };
                                          handleInputChange(key, newArr);
                                        }} 
                                        className="w-full bg-paper-2 px-3 py-1.5 rounded-lg border border-border-base focus:border-primary focus:outline-none placeholder:text-on-surface-variant/40 transition-colors"
                                      />
                                      <input 
                                        type="text" 
                                        aria-label={`${floor.floor || `Floor ${i+1}`} plinth area (sq.fts)`}
                                        placeholder="Floor plinth area (sq.fts)"
                                        value={floor.plinthArea || ''} 
                                        onChange={(e) => {
                                          const newArr = [...floors];
                                          newArr[i] = { ...newArr[i], plinthArea: e.target.value };
                                          handleInputChange(key, newArr);
                                        }} 
                                        className="w-full bg-paper-2 px-3 py-1.5 rounded-lg border border-border-base focus:border-primary focus:outline-none placeholder:text-on-surface-variant/40 transition-colors"
                                      />
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          ) : typeof formData[key] === 'object' && formData[key] !== null ? (
                            <textarea
                              value={JSON.stringify(formData[key], null, 2)}
                              onChange={(e) => handleInputChange(key, e.target.value)}
                              className="w-full bg-surface px-3 py-2 rounded-xl border border-border-base focus:border-primary focus:outline-none text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/40 transition-colors min-h-[100px]"
                            />
                          ) : (
                            <input
                              type={numericFields.includes(key) ? "number" : "text"}
                              step={numericFields.includes(key) ? "any" : undefined}
                              value={formData[key] ?? ''}
                              onChange={(e) => handleInputChange(key, e.target.value)}
                              placeholder={`Enter ${formatKey(key).toLowerCase()}...`}
                              className="w-full bg-surface px-3 py-2 rounded-xl border border-border-base focus:border-primary focus:outline-none text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/40 transition-colors"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          })()}
        </fieldset>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && createPortal(
        <div role="dialog" aria-modal="true" aria-labelledby="confirm-data-title" className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl border border-border-base max-w-lg w-full max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border-base/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-warning rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 id="confirm-data-title" className="text-lg font-bold text-on-surface">Confirm Data Changes</h3>
                  <p className="text-xs text-on-surface-variant">You are about to modify property inspection data.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="p-2 text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-hover transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <p className="text-sm font-semibold text-on-surface mb-2">
                The following {modifiedEntries.length} field{modifiedEntries.length > 1 ? 's' : ''} will be updated:
              </p>
              {modifiedEntries.map(key => (
                <div key={key} className="p-3 bg-surface-container-low rounded-xl border border-border-base/40 text-xs space-y-1">
                  <p className="font-bold text-brand-dark uppercase tracking-wider">{formatKey(key)}</p>
                  <div className="flex items-center justify-between gap-2 text-on-surface-variant">
                    <span className="line-through truncate max-w-[45%]">
                      {typeof initialState[key] === 'object' && initialState[key] !== null ? JSON.stringify(initialState[key]) : String(initialState[key] ?? 'Empty')}
                    </span>
                    <span>→</span>
                    <span className="font-bold text-on-surface truncate max-w-[45%]">
                      {typeof formData[key] === 'object' && formData[key] !== null ? JSON.stringify(formData[key]) : String(formData[key] ?? 'Empty')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-base/40">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={saving || locked}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={saving || locked}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-bold text-sm shadow-sm transition-all"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Confirm & Save</span>
              </button>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  )
}
