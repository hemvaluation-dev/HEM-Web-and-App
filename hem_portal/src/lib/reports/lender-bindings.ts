export type LenderBinding = { source?: string; sources?: string[]; floor?: string; format?: 'date' | 'coordinates' | 'feet-to-metres' }

/** Reviewed per-template field IDs. Unlisted fields require separate portal input. */
export const lenderBindings: Record<string, Record<string, LenderBinding>> = {
  "aditya-birla-lap": {
    "aditya-birla-lap_1": {
      "source": "applicant_name"
    },
    "aditya-birla-lap_2": {
      "source": "created_at",
      "format": "date"
    },
    "aditya-birla-lap_4": {
      "source": "visit_date",
      "format": "date"
    },
    "aditya-birla-lap_5": {
      "source": "application_number"
    },
    "aditya-birla-lap_8": {
      "source": "owner_name"
    },
    "aditya-birla-lap_10": {
      "source": "property_address"
    },
    "aditya-birla-lap_11": {
      "source": "address_docs"
    },
    "aditya-birla-lap_15": {
      "source": "landmark"
    },
    "aditya-birla-lap_16": {
      "source": "latitude"
    },
    "aditya-birla-lap_17": {
      "source": "longitude"
    },
    "aditya-birla-lap_18": {
      "source": "property_type"
    },
    "aditya-birla-lap_19": {
      "source": "property_usage"
    },
    "aditya-birla-lap_20": {
      "source": "previous_valuation"
    },
    "aditya-birla-lap_23": {
      "source": "dist_railway"
    },
    "aditya-birla-lap_24": {
      "source": "dist_bus"
    },
    "aditya-birla-lap_26": {
      "source": "dist_city_center"
    },
    "aditya-birla-lap_27": {
      "source": "distance_from_branch"
    },
    "aditya-birla-lap_28": {
      "source": "approach_road_width"
    },
    "aditya-birla-lap_31": {
      "source": "occupancy_details"
    },
    "aditya-birla-lap_33": {
      "source": "demarcation_available"
    },
    "aditya-birla-lap_34": {
      "source": "property_identified_by"
    },
    "aditya-birla-lap_48": {
      "source": "property_identified_by"
    },
    "aditya-birla-lap_36": {
      "source": "structure_type"
    },
    "aditya-birla-lap_37": {
      "source": "no_of_floors"
    },
    "aditya-birla-lap_38": {
      "source": "basic_amenities"
    },
    "aditya-birla-lap_40": {
      "source": "quality_of_construction"
    },
    "aditya-birla-lap_42": {
      "source": "interiors_exteriors"
    },
    "aditya-birla-lap_57": {
      "source": "interiors_exteriors"
    },
    "aditya-birla-lap_43": {
      "source": "age_of_property"
    },
    "aditya-birla-lap_50": {
      "source": "ownership_type"
    },
    "aditya-birla-lap_52": {
      "source": "lift_available"
    },
    "aditya-birla-lap_53": {
      "source": "marketability"
    },
    "aditya-birla-lap_58": {
      "source": "residual_life"
    },
    "aditya-birla-lap_141": {
      "source": "setback_front"
    },
    "aditya-birla-lap_145": {
      "source": "setback_left"
    },
    "aditya-birla-lap_149": {
      "source": "setback_right"
    },
    "aditya-birla-lap_153": {
      "source": "setback_rear"
    },
    "aditya-birla-lap_160": {
      "source": "stage_percentage"
    },
    "aditya-birla-lap_161": {
      "source": "recommended_percentage"
    },
    "aditya-birla-lap_162": {
      "source": "boundaries_document_north"
    },
    "aditya-birla-lap_163": {
      "source": "boundaries_document_south"
    },
    "aditya-birla-lap_164": {
      "source": "boundaries_document_east"
    },
    "aditya-birla-lap_165": {
      "source": "boundaries_document_west"
    },
    "aditya-birla-lap_166": {
      "source": "boundaries_physical_north"
    },
    "aditya-birla-lap_167": {
      "source": "boundaries_physical_south"
    },
    "aditya-birla-lap_168": {
      "source": "boundaries_physical_east"
    },
    "aditya-birla-lap_169": {
      "source": "boundaries_physical_west"
    },
    "aditya-birla-lap_170": {
      "source": "boundaries_matching"
    },
    "aditya-birla-lap_171": {
      "source": "remarks_and_violations"
    },
    "aditya-birla-lap_173": {
      "source": "property_documents_verified"
    },
    "aditya-birla-lap_61": {
      "floor": "ground",
      "source": "plinthArea"
    },
    "aditya-birla-lap_63": {
      "floor": "first",
      "source": "plinthArea"
    },
    "aditya-birla-lap_65": {
      "floor": "second",
      "source": "plinthArea"
    },
    "aditya-birla-lap_67": {
      "floor": "third",
      "source": "plinthArea"
    },
    "aditya-birla-lap_69": {
      "floor": "fourth",
      "source": "plinthArea"
    },
    "aditya-birla-lap_86": {
      "floor": "ground",
      "source": "plinthArea"
    },
    "aditya-birla-lap_90": {
      "floor": "first",
      "source": "plinthArea"
    },
    "aditya-birla-lap_94": {
      "floor": "second",
      "source": "plinthArea"
    },
    "aditya-birla-lap_98": {
      "floor": "third",
      "source": "plinthArea"
    },
    "aditya-birla-lap_102": {
      "floor": "fourth",
      "source": "plinthArea"
    }
  },
  "axis-finance": {
    "axis-finance_0": {
      "source": "application_number"
    },
    "axis-finance_1": {
      "source": "applicant_name"
    },
    "axis-finance_2": {
      "source": "owner_name"
    },
    "axis-finance_3": {
      "source": "ownership_type"
    },
    "axis-finance_5": {
      "source": "property_documents_verified"
    },
    "axis-finance_7": {
      "source": "property_address"
    },
    "axis-finance_8": {
      "source": "city"
    },
    "axis-finance_9": {
      "source": "district"
    },
    "axis-finance_10": {
      "source": "state"
    },
    "axis-finance_11": {
      "source": "pincode"
    },
    "axis-finance_12": {
      "source": "landmark"
    },
    "axis-finance_13": {
      "source": "dist_city_center"
    },
    "axis-finance_14": {
      "source": "class_of_locality"
    },
    "axis-finance_18": {
      "source": "class_of_locality"
    },
    "axis-finance_20": {
      "source": "condition"
    },
    "axis-finance_121": {
      "source": "condition"
    },
    "axis-finance_21": {
      "source": "occupancy_details"
    },
    "axis-finance_22": {
      "source": "rental_per_month"
    },
    "axis-finance_24": {
      "source": "property_type"
    },
    "axis-finance_26": {
      "source": "property_usage"
    },
    "axis-finance_28": {
      "source": "demarcation_available"
    },
    "axis-finance_31": {
      "source": "interiors_exteriors"
    },
    "axis-finance_33": {
      "source": "boundaries_document_east"
    },
    "axis-finance_34": {
      "source": "boundaries_document_south"
    },
    "axis-finance_35": {
      "source": "boundaries_document_west"
    },
    "axis-finance_36": {
      "source": "boundaries_document_north"
    },
    "axis-finance_65": {
      "source": "boundaries_physical_east"
    },
    "axis-finance_66": {
      "source": "boundaries_physical_south"
    },
    "axis-finance_67": {
      "source": "boundaries_physical_west"
    },
    "axis-finance_68": {
      "source": "boundaries_physical_north"
    },
    "axis-finance_69": {
      "source": "latitude"
    },
    "axis-finance_70": {
      "source": "longitude"
    },
    "axis-finance_77": {
      "source": "age_of_property"
    },
    "axis-finance_78": {
      "source": "residual_life"
    },
    "axis-finance_80": {
      "source": "structure_type"
    },
    "axis-finance_84": {
      "source": "no_of_floors"
    },
    "axis-finance_112": {
      "source": "setback_front"
    },
    "axis-finance_113": {
      "source": "setback_left"
    },
    "axis-finance_114": {
      "source": "setback_right"
    },
    "axis-finance_115": {
      "source": "setback_rear"
    },
    "axis-finance_120": {
      "source": "quality_of_construction"
    },
    "axis-finance_139": {
      "source": "stage_of_construction"
    },
    "axis-finance_149": {
      "source": "visit_date",
      "format": "date"
    },
    "axis-finance_96": {
      "floor": "stilt",
      "source": "plinthArea"
    },
    "axis-finance_100": {
      "floor": "third",
      "source": "plinthArea"
    },
    "axis-finance_101": {
      "floor": "fourth",
      "source": "plinthArea"
    },
    "axis-finance_97": {
      "floor": "gf1",
      "source": "plinthArea"
    },
    "axis-finance_98": {
      "floor": "gf2",
      "source": "plinthArea"
    },
    "axis-finance_99": {
      "floor": "gf3",
      "source": "plinthArea"
    }
  },
  "chola-sme": {
    "chola-sme_0": {
      "source": "application_number"
    },
    "chola-sme_1": {
      "source": "applicant_name"
    },
    "chola-sme_2": {
      "source": "phone_number"
    },
    "chola-sme_4": {
      "source": "branch"
    },
    "chola-sme_5": {
      "source": "created_at",
      "format": "date"
    },
    "chola-sme_8": {
      "source": "owner_name"
    },
    "chola-sme_9": {
      "source": "property_address"
    },
    "chola-sme_16": {
      "source": "pincode"
    },
    "chola-sme_17": {
      "source": "city"
    },
    "chola-sme_18": {
      "source": "state"
    },
    "chola-sme_28": {
      "source": "landmark"
    },
    "chola-sme_29": {
      "source": "property_type"
    },
    "chola-sme_31": {
      "source": "visit_date",
      "format": "date"
    },
    "chola-sme_33": {
      "source": "proximity_amenities"
    },
    "chola-sme_34": {
      "source": "class_of_locality"
    },
    "chola-sme_38": {
      "source": "occupancy_details"
    },
    "chola-sme_39": {
      "source": "property_usage"
    },
    "chola-sme_42": {
      "source": "structure_type"
    },
    "chola-sme_43": {
      "source": "condition"
    },
    "chola-sme_80": {
      "source": "condition"
    },
    "chola-sme_44": {
      "source": "stage_of_construction"
    },
    "chola-sme_104": {
      "source": "stage_of_construction"
    },
    "chola-sme_45": {
      "source": "no_of_floors"
    },
    "chola-sme_48": {
      "source": "dist_railway"
    },
    "chola-sme_49": {
      "source": "dist_bus"
    },
    "chola-sme_58": {
      "source": "deviation"
    },
    "chola-sme_61": {
      "source": "boundaries_document_north"
    },
    "chola-sme_62": {
      "source": "boundaries_document_south"
    },
    "chola-sme_63": {
      "source": "boundaries_document_east"
    },
    "chola-sme_64": {
      "source": "boundaries_document_west"
    },
    "chola-sme_69": {
      "source": "boundaries_physical_north"
    },
    "chola-sme_70": {
      "source": "boundaries_physical_south"
    },
    "chola-sme_71": {
      "source": "boundaries_physical_east"
    },
    "chola-sme_72": {
      "source": "boundaries_physical_west"
    },
    "chola-sme_73": {
      "source": "land_measurements_north"
    },
    "chola-sme_74": {
      "source": "land_measurements_south"
    },
    "chola-sme_75": {
      "source": "land_measurements_east"
    },
    "chola-sme_76": {
      "source": "land_measurements_west"
    },
    "chola-sme_77": {
      "source": "quality_of_construction"
    },
    "chola-sme_81": {
      "source": "age_of_property"
    },
    "chola-sme_82": {
      "source": "residual_life"
    },
    "chola-sme_84": {
      "source": "flooring_type"
    },
    "chola-sme_87": {
      "source": "roof"
    },
    "chola-sme_88": {
      "source": "basic_amenities"
    },
    "chola-sme_103": {
      "source": "remarks_and_violations"
    },
    "chola-sme_105": {
      "source": "stage_percentage"
    },
    "chola-sme_109": {
      "source": "property_documents_verified"
    }
  },
  "equitas": {
    "equitas_0": {
      "source": "application_number"
    },
    "equitas_2": {
      "source": "applicant_name"
    },
    "equitas_3": {
      "source": "owner_name"
    },
    "equitas_4": {
      "source": "branch"
    },
    "equitas_6": {
      "source": "phone_number"
    },
    "equitas_8": {
      "source": "age_of_property"
    },
    "equitas_9": {
      "source": "residual_life"
    },
    "equitas_10": {
      "source": "property_type"
    },
    "equitas_11": {
      "source": "property_usage"
    },
    "equitas_124": {
      "source": "property_usage"
    },
    "equitas_12": {
      "source": "address_docs"
    },
    "equitas_13": {
      "source": "property_address"
    },
    "equitas_14": {
      "source": "landmark"
    },
    "equitas_17": {
      "source": "demarcation_available"
    },
    "equitas_18": {
      "source": "class_of_locality"
    },
    "equitas_19": {
      "source": "site_developed"
    },
    "equitas_22": {
      "source": "near_hazards"
    },
    "equitas_24": {
      "source": "meter_number"
    },
    "equitas_25": {
      "source": "meter_owner_name"
    },
    "equitas_27": {
      "source": "distance_from_branch"
    },
    "equitas_28": {
      "source": "boundaries_document_north"
    },
    "equitas_29": {
      "source": "boundaries_document_south"
    },
    "equitas_30": {
      "source": "boundaries_document_east"
    },
    "equitas_31": {
      "source": "boundaries_document_west"
    },
    "equitas_32": {
      "source": "boundaries_physical_north"
    },
    "equitas_33": {
      "source": "boundaries_physical_south"
    },
    "equitas_34": {
      "source": "boundaries_physical_east"
    },
    "equitas_35": {
      "source": "boundaries_physical_west"
    },
    "equitas_40": {
      "source": "land_measurements_north"
    },
    "equitas_41": {
      "source": "land_measurements_south"
    },
    "equitas_42": {
      "source": "land_measurements_east"
    },
    "equitas_43": {
      "source": "land_measurements_west"
    },
    "equitas_48": {
      "source": "boundary_mismatch_reason"
    },
    "equitas_58": {
      "source": "stage_percentage"
    },
    "equitas_109": {
      "source": "marketability"
    },
    "equitas_116": {
      "source": "occupancy_details"
    },
    "equitas_117": {
      "source": "person_met_at_site"
    },
    "equitas_118": {
      "source": "relationship_with_customer"
    },
    "equitas_121": {
      "source": "approach_road_width"
    },
    "equitas_127": {
      "source": "no_of_floors"
    },
    "equitas_128": {
      "source": "structure_type"
    },
    "equitas_132": {
      "source": "rental_per_month"
    },
    "equitas_133": {
      "source": "remarks_and_violations"
    },
    "equitas_15": {
      "sources": [
        "latitude",
        "longitude"
      ],
      "format": "coordinates"
    }
  },
  "icici": {
    "icici_0": {
      "source": "application_number"
    },
    "icici_2": {
      "source": "application_number"
    },
    "icici_1": {
      "source": "applicant_name"
    },
    "icici_10": {
      "source": "property_type"
    },
    "icici_42": {
      "source": "property_type"
    },
    "icici_14": {
      "source": "property_address"
    },
    "icici_16": {
      "source": "state"
    },
    "icici_17": {
      "source": "city"
    },
    "icici_18": {
      "source": "landmark"
    },
    "icici_19": {
      "source": "pincode"
    },
    "icici_26": {
      "source": "boundaries_document_east"
    },
    "icici_27": {
      "source": "boundaries_physical_east"
    },
    "icici_28": {
      "source": "boundaries_document_west"
    },
    "icici_29": {
      "source": "boundaries_physical_west"
    },
    "icici_30": {
      "source": "boundaries_document_north"
    },
    "icici_31": {
      "source": "boundaries_physical_north"
    },
    "icici_32": {
      "source": "boundaries_document_south"
    },
    "icici_33": {
      "source": "boundaries_physical_south"
    },
    "icici_34": {
      "source": "boundaries_matching"
    },
    "icici_36": {
      "source": "demarcation_available"
    },
    "icici_37": {
      "source": "site_developed"
    },
    "icici_38": {
      "source": "class_of_locality"
    },
    "icici_41": {
      "source": "dist_city_center"
    },
    "icici_43": {
      "source": "no_of_floors"
    },
    "icici_52": {
      "source": "structure_type"
    },
    "icici_53": {
      "source": "interiors_exteriors"
    },
    "icici_54": {
      "source": "interiors_exteriors"
    },
    "icici_55": {
      "source": "condition"
    },
    "icici_56": {
      "source": "age_of_property"
    },
    "icici_57": {
      "source": "occupancy_details"
    },
    "icici_59": {
      "source": "relationship_with_customer"
    },
    "icici_61": {
      "source": "residual_life"
    },
    "icici_77": {
      "source": "created_at",
      "format": "date"
    },
    "icici_80": {
      "source": "stage_of_construction"
    },
    "icici_82": {
      "source": "stage_percentage"
    },
    "icici_83": {
      "source": "recommended_percentage"
    },
    "icici_85": {
      "source": "remarks_and_violations"
    },
    "icici_92": {
      "source": "visit_date",
      "format": "date"
    }
  },
  "jm-finance": {
    "jm-finance_0": {
      "source": "branch"
    },
    "jm-finance_1": {
      "source": "applicant_name"
    },
    "jm-finance_2": {
      "source": "person_met_at_site"
    },
    "jm-finance_109": {
      "source": "person_met_at_site"
    },
    "jm-finance_16": {
      "source": "property_address"
    },
    "jm-finance_35": {
      "source": "property_address"
    },
    "jm-finance_27": {
      "source": "landmark"
    },
    "jm-finance_29": {
      "source": "pincode"
    },
    "jm-finance_31": {
      "source": "city"
    },
    "jm-finance_32": {
      "source": "latitude"
    },
    "jm-finance_33": {
      "source": "longitude"
    },
    "jm-finance_34": {
      "source": "address_docs"
    },
    "jm-finance_36": {
      "source": "property_documents_verified"
    },
    "jm-finance_42": {
      "source": "panchayat_name"
    },
    "jm-finance_43": {
      "source": "age_of_property"
    },
    "jm-finance_44": {
      "source": "residual_life"
    },
    "jm-finance_45": {
      "source": "site_access"
    },
    "jm-finance_48": {
      "source": "class_of_locality"
    },
    "jm-finance_49": {
      "source": "site_developed"
    },
    "jm-finance_50": {
      "source": "property_type"
    },
    "jm-finance_51": {
      "source": "occupancy_details"
    },
    "jm-finance_55": {
      "source": "ownership_type"
    },
    "jm-finance_65": {
      "source": "high_tension_wires"
    },
    "jm-finance_67": {
      "source": "property_usage"
    },
    "jm-finance_78": {
      "source": "structure_type"
    },
    "jm-finance_82": {
      "source": "roof"
    },
    "jm-finance_89": {
      "source": "rental_per_month"
    },
    "jm-finance_92": {
      "source": "property_tax"
    },
    "jm-finance_96": {
      "source": "remarks_and_violations"
    },
    "jm-finance_97": {
      "source": "marketability"
    },
    "jm-finance_101": {
      "source": "visit_date",
      "format": "date"
    },
    "jm-finance_38": {
      "source": "boundaries_physical_west"
    },
    "jm-finance_39": {
      "source": "boundaries_document_north"
    },
    "jm-finance_40": {
      "source": "boundaries_document_west"
    },
    "jm-finance_site_e66": {
      "source": "boundaries_physical_north"
    },
    "jm-finance_site_g66": {
      "source": "boundaries_physical_south"
    },
    "jm-finance_site_g67": {
      "source": "boundaries_document_south"
    },
    "jm-finance_site_i66": {
      "source": "boundaries_physical_east"
    },
    "jm-finance_site_i67": {
      "source": "boundaries_document_east"
    },
    "jm-finance_47": {
      "source": "approach_road_width",
      "format": "feet-to-metres"
    },
    "jm-finance_site_e161": {
      "source": "land_area"
    },
    "jm-finance_site_g161": {
      "source": "land_rate"
    }
  },
  "niwas-finance": {
    "niwas-finance_3": {
      "source": "application_number"
    },
    "niwas-finance_5": {
      "source": "visit_date",
      "format": "date"
    },
    "niwas-finance_7": {
      "source": "person_met_at_site"
    },
    "niwas-finance_8": {
      "source": "previous_valuation"
    },
    "niwas-finance_9": {
      "source": "applicant_name"
    },
    "niwas-finance_10": {
      "source": "owner_name"
    },
    "niwas-finance_12": {
      "source": "property_type"
    },
    "niwas-finance_14": {
      "source": "property_usage"
    },
    "niwas-finance_15": {
      "source": "occupancy_details"
    },
    "niwas-finance_16": {
      "source": "address_docs"
    },
    "niwas-finance_17": {
      "source": "district"
    },
    "niwas-finance_18": {
      "source": "state"
    },
    "niwas-finance_19": {
      "source": "pincode"
    },
    "niwas-finance_21": {
      "source": "boundaries_matching"
    },
    "niwas-finance_31": {
      "source": "property_documents_verified"
    },
    "niwas-finance_35": {
      "source": "within_municipal_limits"
    },
    "niwas-finance_42": {
      "source": "passage_width"
    },
    "niwas-finance_46": {
      "source": "marketability"
    },
    "niwas-finance_48": {
      "source": "landmark"
    },
    "niwas-finance_50": {
      "source": "eb_service"
    },
    "niwas-finance_51": {
      "source": "water_supply"
    },
    "niwas-finance_52": {
      "source": "drainage"
    },
    "niwas-finance_61": {
      "source": "demarcation_available"
    },
    "niwas-finance_62": {
      "source": "ownership_type"
    },
    "niwas-finance_67": {
      "source": "no_of_floors"
    },
    "niwas-finance_68": {
      "source": "no_of_units"
    },
    "niwas-finance_70": {
      "source": "floor_valued"
    },
    "niwas-finance_71": {
      "source": "stage_of_construction"
    },
    "niwas-finance_77": {
      "source": "stage_of_construction"
    },
    "niwas-finance_73": {
      "source": "age_of_property"
    },
    "niwas-finance_74": {
      "source": "residual_life"
    },
    "niwas-finance_75": {
      "source": "structure_type"
    },
    "niwas-finance_76": {
      "source": "roof"
    },
    "niwas-finance_92": {
      "source": "stage_percentage"
    },
    "niwas-finance_94": {
      "source": "site_developed"
    },
    "niwas-finance_20": {
      "source": "boundaries_physical_east"
    },
    "remarks_and_violations": {
      "source": "remarks_and_violations"
    },
    "niwas-finance_site_c31": {
      "source": "boundaries_document_north"
    },
    "niwas-finance_site_d31": {
      "source": "boundaries_physical_north"
    },
    "niwas-finance_site_c32": {
      "source": "boundaries_document_east"
    },
    "niwas-finance_site_c33": {
      "source": "boundaries_document_west"
    },
    "niwas-finance_site_d33": {
      "source": "boundaries_physical_west"
    },
    "niwas-finance_site_c34": {
      "source": "boundaries_document_south"
    },
    "niwas-finance_site_d34": {
      "source": "boundaries_physical_south"
    },
    "niwas-finance_22": {
      "sources": [
        "longitude",
        "latitude"
      ],
      "format": "coordinates"
    },
    "niwas-finance_87": {
      "floor": "ground",
      "source": "plinthArea"
    },
    "niwas-finance_88": {
      "floor": "first",
      "source": "plinthArea"
    },
    "niwas-finance_89": {
      "floor": "second",
      "source": "plinthArea"
    },
    "niwas-finance_90": {
      "floor": "third",
      "source": "plinthArea"
    }
  },
  "smfg-lap": {
    "smfg-lap_1": {
      "source": "branch"
    },
    "smfg-lap_3": {
      "source": "created_at",
      "format": "date"
    },
    "smfg-lap_4": {
      "source": "visit_date",
      "format": "date"
    },
    "smfg-lap_6": {
      "source": "person_met_at_site"
    },
    "smfg-lap_7": {
      "source": "applicant_name"
    },
    "smfg-lap_8": {
      "source": "owner_name"
    },
    "smfg-lap_9": {
      "source": "property_type"
    },
    "smfg-lap_10": {
      "source": "property_usage"
    },
    "smfg-lap_12": {
      "source": "property_address"
    },
    "smfg-lap_13": {
      "source": "address_docs"
    },
    "smfg-lap_14": {
      "source": "previous_valuation"
    },
    "smfg-lap_15": {
      "source": "distance_from_branch"
    },
    "smfg-lap_17": {
      "source": "property_documents_verified"
    },
    "smfg-lap_18": {
      "source": "ownership_type"
    },
    "smfg-lap_22": {
      "source": "boundaries_document_east"
    },
    "smfg-lap_23": {
      "source": "boundaries_document_west"
    },
    "smfg-lap_24": {
      "source": "boundaries_document_north"
    },
    "smfg-lap_25": {
      "source": "boundaries_document_south"
    },
    "smfg-lap_30": {
      "source": "boundaries_physical_east"
    },
    "smfg-lap_31": {
      "source": "boundaries_physical_west"
    },
    "smfg-lap_32": {
      "source": "boundaries_physical_north"
    },
    "smfg-lap_33": {
      "source": "boundaries_physical_south"
    },
    "smfg-lap_34": {
      "source": "boundaries_matching"
    },
    "smfg-lap_35": {
      "source": "occupancy_details"
    },
    "smfg-lap_38": {
      "source": "relationship_with_customer"
    },
    "smfg-lap_39": {
      "source": "demarcation_available"
    },
    "smfg-lap_40": {
      "source": "property_identified_by"
    },
    "smfg-lap_41": {
      "source": "structure_type"
    },
    "smfg-lap_114": {
      "source": "structure_type"
    },
    "smfg-lap_43": {
      "source": "no_of_floors"
    },
    "smfg-lap_44": {
      "source": "floor_valued"
    },
    "smfg-lap_51": {
      "source": "quality_of_construction"
    },
    "smfg-lap_52": {
      "source": "interiors_exteriors"
    },
    "smfg-lap_53": {
      "source": "age_of_property"
    },
    "smfg-lap_54": {
      "source": "residual_life"
    },
    "smfg-lap_56": {
      "source": "class_of_locality"
    },
    "smfg-lap_57": {
      "source": "site_developed"
    },
    "smfg-lap_58": {
      "source": "proximity_amenities"
    },
    "smfg-lap_59": {
      "source": "landmark"
    },
    "smfg-lap_60": {
      "source": "within_municipal_limits"
    },
    "smfg-lap_61": {
      "source": "panchayat_name"
    },
    "smfg-lap_62": {
      "source": "site_access"
    },
    "smfg-lap_63": {
      "source": "basic_amenities"
    },
    "smfg-lap_64": {
      "source": "marketability"
    },
    "smfg-lap_65": {
      "source": "meter_number"
    },
    "smfg-lap_98": {
      "source": "stage_of_construction"
    },
    "smfg-lap_99": {
      "source": "stage_percentage"
    },
    "smfg-lap_100": {
      "source": "recommended_percentage"
    },
    "smfg-lap_112": {
      "source": "rental_per_month"
    },
    "smfg-lap_116": {
      "source": "roof"
    },
    "smfg-lap_124": {
      "source": "remarks_and_violations"
    },
    "smfg-lap_66": {
      "floor": "basement",
      "source": "plinthArea"
    },
    "smfg-lap_67": {
      "floor": "stilt",
      "source": "plinthArea"
    },
    "smfg-lap_68": {
      "floor": "ground",
      "source": "plinthArea"
    },
    "smfg-lap_69": {
      "floor": "first",
      "source": "plinthArea"
    },
    "smfg-lap_70": {
      "floor": "second",
      "source": "plinthArea"
    },
    "smfg-lap_71": {
      "floor": "third",
      "source": "plinthArea"
    },
    "smfg-lap_72": {
      "floor": "fourth",
      "source": "plinthArea"
    }
  },
  "smfg-rural-lap": {
    "smfg-rural-lap_1": {
      "source": "visit_date",
      "format": "date"
    },
    "smfg-rural-lap_7": {
      "source": "phone_number"
    },
    "smfg-rural-lap_8": {
      "source": "applicant_name"
    },
    "smfg-rural-lap_9": {
      "source": "property_address"
    },
    "smfg-rural-lap_10": {
      "source": "owner_name"
    },
    "smfg-rural-lap_32": {
      "source": "demarcation_available"
    },
    "smfg-rural-lap_37": {
      "source": "age_of_property"
    },
    "smfg-rural-lap_40": {
      "source": "meter_number"
    },
    "smfg-rural-lap_42": {
      "source": "structure_type"
    },
    "smfg-rural-lap_44": {
      "source": "stage_of_construction"
    },
    "smfg-rural-lap_47": {
      "source": "property_usage"
    },
    "smfg-rural-lap_48": {
      "source": "no_of_floors"
    },
    "smfg-rural-lap_52": {
      "source": "no_of_floors"
    },
    "smfg-rural-lap_49": {
      "source": "lift"
    },
    "smfg-rural-lap_56": {
      "source": "flooring_type"
    },
    "smfg-rural-lap_68": {
      "source": "condition"
    },
    "smfg-rural-lap_79": {
      "source": "occupancy_details"
    },
    "remarks_and_violations": {
      "source": "remarks_and_violations"
    },
    "smfg-rural-lap_33": {
      "sources": [
        "latitude",
        "longitude"
      ],
      "format": "coordinates"
    },
    "smfg-rural-lap_20": {
      "source": "boundaries_document_east"
    },
    "smfg-rural-lap_21": {
      "source": "boundaries_document_west"
    },
    "smfg-rural-lap_22": {
      "source": "boundaries_document_north"
    },
    "smfg-rural-lap_23": {
      "source": "boundaries_document_south"
    },
    "smfg-rural-lap_24": {
      "source": "boundaries_physical_east"
    },
    "smfg-rural-lap_25": {
      "source": "boundaries_physical_west"
    },
    "smfg-rural-lap_26": {
      "source": "boundaries_physical_north"
    },
    "smfg-rural-lap_27": {
      "source": "boundaries_physical_south"
    }
  },
  "tyger-finance": {
    "tyger-finance_0": {
      "source": "branch"
    },
    "tyger-finance_1": {
      "source": "applicant_name"
    },
    "tyger-finance_3": {
      "source": "property_address"
    },
    "tyger-finance_11": {
      "source": "city"
    },
    "tyger-finance_12": {
      "source": "pincode"
    },
    "tyger-finance_14": {
      "source": "distance_from_branch"
    },
    "tyger-finance_15": {
      "source": "property_type"
    },
    "tyger-finance_28": {
      "source": "property_type"
    },
    "tyger-finance_16": {
      "source": "person_met_at_site"
    },
    "tyger-finance_17": {
      "source": "relationship_with_customer"
    },
    "tyger-finance_18": {
      "source": "phone_number"
    },
    "tyger-finance_23": {
      "source": "age_of_property"
    },
    "tyger-finance_25": {
      "source": "occupancy_details"
    },
    "tyger-finance_27": {
      "source": "residual_life"
    },
    "tyger-finance_29": {
      "source": "site_access"
    },
    "tyger-finance_33": {
      "source": "class_of_locality"
    },
    "tyger-finance_34": {
      "source": "interiors_exteriors"
    },
    "tyger-finance_35": {
      "source": "interiors_exteriors"
    },
    "tyger-finance_36": {
      "source": "site_developed"
    },
    "tyger-finance_37": {
      "source": "basic_amenities"
    },
    "tyger-finance_57": {
      "source": "no_of_floors"
    },
    "tyger-finance_70": {
      "source": "structure_type"
    },
    "tyger-finance_72": {
      "source": "roof"
    },
    "tyger-finance_78": {
      "source": "stage_percentage"
    },
    "tyger-finance_81": {
      "source": "marketability"
    },
    "tyger-finance_84": {
      "source": "deviation"
    },
    "tyger-finance_86": {
      "source": "visit_date",
      "format": "date"
    },
    "tyger-finance_19": {
      "source": "boundaries_document_north"
    },
    "tyger-finance_20": {
      "source": "boundaries_physical_east"
    },
    "tyger-finance_site_b22": {
      "source": "boundaries_physical_north"
    },
    "tyger-finance_site_c21": {
      "source": "boundaries_document_south"
    },
    "tyger-finance_site_c22": {
      "source": "boundaries_physical_south"
    },
    "tyger-finance_site_d21": {
      "source": "boundaries_document_east"
    },
    "tyger-finance_site_e21": {
      "source": "boundaries_document_west"
    },
    "tyger-finance_site_e22": {
      "source": "boundaries_physical_west"
    },
    "tyger-finance_41": {
      "sources": [
        "latitude",
        "longitude"
      ],
      "format": "coordinates"
    },
    "tyger-finance_47": {
      "floor": "ground",
      "source": "plinthArea"
    },
    "tyger-finance_49": {
      "floor": "first",
      "source": "plinthArea"
    }
  },
  "ugrow": {
    "ugrow_0": {
      "source": "application_number"
    },
    "ugrow_1": {
      "source": "applicant_name"
    },
    "ugrow_3": {
      "source": "owner_name"
    },
    "ugrow_4": {
      "source": "address_docs"
    },
    "ugrow_5": {
      "source": "property_address"
    },
    "ugrow_6": {
      "source": "pincode"
    },
    "ugrow_7": {
      "source": "visit_date",
      "format": "date"
    },
    "ugrow_8": {
      "source": "property_type"
    },
    "ugrow_9": {
      "source": "property_usage"
    },
    "ugrow_10": {
      "source": "occupancy_details"
    },
    "ugrow_13": {
      "source": "no_of_floors"
    },
    "ugrow_14": {
      "source": "no_of_units"
    },
    "ugrow_17": {
      "source": "ownership_type"
    },
    "ugrow_19": {
      "source": "age_of_property"
    },
    "ugrow_20": {
      "source": "demarcation_available"
    },
    "ugrow_21": {
      "source": "property_identified_by"
    },
    "ugrow_22": {
      "source": "approach_road_width"
    },
    "ugrow_27": {
      "source": "site_developed"
    },
    "ugrow_28": {
      "source": "landmark"
    },
    "ugrow_32": {
      "source": "structure_type"
    },
    "ugrow_33": {
      "source": "quality_of_construction"
    },
    "ugrow_36": {
      "source": "flooring_type"
    },
    "ugrow_43": {
      "source": "property_documents_verified"
    },
    "ugrow_44": {
      "source": "deviation"
    },
    "ugrow_23": {
      "source": "boundaries_document_north"
    },
    "ugrow_24": {
      "source": "boundaries_document_east"
    },
    "ugrow_25": {
      "source": "boundaries_document_west"
    },
    "ugrow_26": {
      "source": "boundaries_document_south"
    },
    "ugrow_north_document": {
      "source": "boundaries_physical_west"
    },
    "ugrow_south_document": {
      "source": "boundaries_physical_south"
    },
    "remarks_and_violations": {
      "source": "remarks_and_violations"
    },
    "ugrow_site_c38": {
      "source": "boundaries_physical_north"
    },
    "ugrow_site_c39": {
      "source": "boundaries_physical_east"
    },
    "ugrow_50": {
      "floor": "ground",
      "source": "plinthArea"
    },
    "ugrow_51": {
      "floor": "first",
      "source": "plinthArea"
    },
    "ugrow_52": {
      "floor": "second",
      "source": "plinthArea"
    }
  },
  "ummeed": {
    "ummeed_1": {
      "source": "application_number"
    },
    "ummeed_3": {
      "source": "applicant_name"
    },
    "ummeed_4": {
      "source": "owner_name"
    },
    "ummeed_5": {
      "source": "property_documents_verified"
    },
    "ummeed_6": {
      "source": "property_address"
    },
    "ummeed_7": {
      "source": "address_docs"
    },
    "ummeed_8": {
      "source": "landmark"
    },
    "ummeed_9": {
      "source": "visit_date",
      "format": "date"
    },
    "ummeed_10": {
      "source": "occupancy_details"
    },
    "ummeed_12": {
      "source": "marketability"
    },
    "ummeed_13": {
      "source": "road_width"
    },
    "ummeed_30": {
      "source": "road_width"
    },
    "ummeed_17": {
      "source": "property_usage"
    },
    "ummeed_19": {
      "source": "class_of_locality"
    },
    "ummeed_21": {
      "source": "property_type"
    },
    "ummeed_22": {
      "source": "distance_from_branch"
    },
    "ummeed_23": {
      "source": "site_access"
    },
    "ummeed_26": {
      "source": "within_municipal_limits"
    },
    "ummeed_27": {
      "source": "panchayat_name"
    },
    "ummeed_31": {
      "source": "no_of_floors"
    },
    "ummeed_57": {
      "source": "no_of_floors"
    },
    "ummeed_33": {
      "source": "age_of_property"
    },
    "ummeed_34": {
      "source": "residual_life"
    },
    "ummeed_35": {
      "source": "boundaries_document_north"
    },
    "ummeed_36": {
      "source": "boundaries_physical_north"
    },
    "ummeed_38": {
      "source": "boundaries_document_south"
    },
    "ummeed_39": {
      "source": "boundaries_physical_south"
    },
    "ummeed_41": {
      "source": "boundaries_document_east"
    },
    "ummeed_42": {
      "source": "boundaries_physical_east"
    },
    "ummeed_44": {
      "source": "boundaries_document_west"
    },
    "ummeed_45": {
      "source": "boundaries_physical_west"
    },
    "ummeed_47": {
      "source": "boundaries_matching"
    },
    "ummeed_48": {
      "source": "property_identified_by"
    },
    "ummeed_49": {
      "source": "community_dominated"
    },
    "ummeed_51": {
      "source": "meter_owner_matching"
    },
    "ummeed_52": {
      "source": "meter_number"
    },
    "ummeed_53": {
      "source": "demarcation_available"
    },
    "ummeed_54": {
      "source": "drainage"
    },
    "ummeed_55": {
      "source": "water_supply"
    },
    "ummeed_56": {
      "source": "structure_type"
    },
    "ummeed_148": {
      "source": "structure_type"
    },
    "ummeed_60": {
      "source": "quality_of_construction"
    },
    "ummeed_63": {
      "source": "flooring_type"
    },
    "ummeed_64": {
      "source": "roof"
    },
    "ummeed_155": {
      "source": "roof"
    },
    "ummeed_122": {
      "source": "stage_percentage"
    },
    "ummeed_123": {
      "source": "recommended_percentage"
    },
    "ummeed_138": {
      "source": "deviation"
    },
    "ummeed_143": {
      "source": "remarks_and_violations"
    },
    "ummeed_126": {
      "sources": [
        "latitude",
        "longitude"
      ],
      "format": "coordinates"
    },
    "ummeed_71": {
      "floor": "ground",
      "source": "plinthArea"
    },
    "ummeed_74": {
      "floor": "first",
      "source": "plinthArea"
    },
    "ummeed_77": {
      "floor": "second",
      "source": "plinthArea"
    },
    "ummeed_80": {
      "floor": "third",
      "source": "plinthArea"
    }
  },
  "kreditbee": {
    "kreditbee_j11": {
      "source": "property_usage"
    },
    "kreditbee_j88": {
      "source": "structure_type"
    },
    "kreditbee_d29": {
      "source": "demarcation_available"
    },
    "kreditbee_2": {
      "source": "visit_date",
      "format": "date"
    },
    "kreditbee_7": {
      "source": "distance_from_branch"
    },
    "kreditbee_8": {
      "source": "person_met_at_site"
    },
    "kreditbee_10": {
      "source": "address_docs"
    },
    "kreditbee_12": {
      "source": "landmark"
    },
    "kreditbee_28": {
      "source": "property_identified_by"
    },
    "kreditbee_29": {
      "source": "site_developed"
    },
    "kreditbee_30": {
      "source": "proximity_amenities"
    },
    "kreditbee_31": {
      "source": "dist_railway"
    },
    "kreditbee_32": {
      "source": "dist_bus"
    },
    "kreditbee_34": {
      "source": "approach_road_width"
    },
    "kreditbee_35": {
      "source": "occupancy_details"
    },
    "kreditbee_56": {
      "source": "relationship_with_customer"
    },
    "kreditbee_62": {
      "source": "class_of_locality"
    },
    "kreditbee_74": {
      "source": "interiors_exteriors"
    },
    "kreditbee_80": {
      "source": "interiors_exteriors"
    },
    "kreditbee_81": {
      "source": "interiors_exteriors"
    },
    "kreditbee_91": {
      "source": "rental_per_month"
    },
    "kreditbee_92": {
      "source": "property_documents_verified"
    },
    "kreditbee_e11": {
      "source": "property_type"
    },
    "kreditbee_d26": {
      "source": "boundaries_matching"
    },
    "kreditbee_0": {
      "source": "branch"
    },
    "kreditbee_9": {
      "source": "applicant_name"
    },
    "kreditbee_11": {
      "source": "property_address"
    },
    "kreditbee_14": {
      "source": "city"
    },
    "kreditbee_15": {
      "source": "state"
    },
    "kreditbee_16": {
      "source": "pincode"
    },
    "kreditbee_19": {
      "source": "boundaries_document_east"
    },
    "kreditbee_20": {
      "source": "boundaries_document_west"
    },
    "kreditbee_21": {
      "source": "boundaries_document_north"
    },
    "kreditbee_22": {
      "source": "boundaries_document_south"
    },
    "kreditbee_23": {
      "source": "boundaries_physical_east"
    },
    "kreditbee_24": {
      "source": "boundaries_physical_west"
    },
    "kreditbee_25": {
      "source": "boundaries_physical_north"
    },
    "kreditbee_26": {
      "source": "boundaries_physical_south"
    },
    "kreditbee_39": {
      "source": "age_of_property"
    },
    "kreditbee_40": {
      "source": "residual_life"
    },
    "kreditbee_52": {
      "source": "stage_of_construction"
    },
    "kreditbee_93": {
      "source": "remarks_and_violations"
    },
    "kreditbee_17": {
      "sources": [
        "latitude",
        "longitude"
      ],
      "format": "coordinates"
    },
    "kreditbee_f78": {
      "floor": "basement",
      "source": "plinthArea"
    },
    "kreditbee_f79": {
      "floor": "stilt",
      "source": "plinthArea"
    },
    "kreditbee_f80": {
      "floor": "ground",
      "source": "plinthArea"
    },
    "kreditbee_f81": {
      "floor": "first",
      "source": "plinthArea"
    },
    "kreditbee_f82": {
      "floor": "second",
      "source": "plinthArea"
    },
    "kreditbee_f83": {
      "floor": "third",
      "source": "plinthArea"
    },
    "kreditbee_f84": {
      "floor": "fourth",
      "source": "plinthArea"
    },
    "kreditbee_f85": {
      "floor": "fifth",
      "source": "plinthArea"
    }
  }
}
