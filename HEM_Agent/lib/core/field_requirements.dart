class FieldRequirements {
  static const List<Map<String, String>> mandatoryFields = [
    {'key': 'branch', 'label': 'Branch'},
    {'key': 'property_address', 'label': 'Property Address'},
    {'key': 'age_of_property', 'label': 'Age of Property'},
    {'key': 'no_of_floors', 'label': 'No. of Floors'},
    {'key': 'property_usage', 'label': 'Property Usage'},
    {'key': 'structure_type', 'label': 'Structure of Property'},
    {'key': 'flooring_type', 'label': 'Flooring Type'},
    {'key': 'occupancy_details', 'label': 'Occupancy Details'},
    {
      'key': 'property_documents_verified',
      'label': 'Property Documents Verified',
    },
    {'key': 'ownership_type', 'label': 'Ownership Type'},
    {'key': 'quality_of_construction', 'label': 'Quality of Construction'},
    {'key': 'interiors_exteriors', 'label': 'Interiors/Exteriors Quality'},
    {'key': 'residual_life', 'label': 'Residual Life'},
    {'key': 'setback_front', 'label': 'Setback - Front'},
    {'key': 'setback_rear', 'label': 'Setback - Rear'},
    {'key': 'setback_right', 'label': 'Setback - Right'},
    {'key': 'setback_left', 'label': 'Setback - Left'},
    {'key': 'boundaries_document_east', 'label': 'Document Boundary - East'},
    {'key': 'boundaries_document_west', 'label': 'Document Boundary - West'},
    {'key': 'boundaries_document_north', 'label': 'Document Boundary - North'},
    {'key': 'boundaries_document_south', 'label': 'Document Boundary - South'},
    {'key': 'boundaries_physical_east', 'label': 'Physical Boundary - East'},
    {'key': 'boundaries_physical_west', 'label': 'Physical Boundary - West'},
    {'key': 'boundaries_physical_south', 'label': 'Physical Boundary - South'},
    {'key': 'boundaries_physical_north', 'label': 'Physical Boundary - North'},
    {'key': 'land_measurements_east', 'label': 'Land Measurement - East'},
    {'key': 'land_measurements_west', 'label': 'Land Measurement - West'},
    {'key': 'land_measurements_north', 'label': 'Land Measurement - North'},
    {'key': 'land_measurements_south', 'label': 'Land Measurement - South'},
    {'key': 'land_area', 'label': 'Land Area'},
    {'key': 'plinth_measurements_east', 'label': 'Plinth Measurement - East'},
    {'key': 'plinth_measurements_west', 'label': 'Plinth Measurement - West'},
    {'key': 'plinth_measurements_north', 'label': 'Plinth Measurement - North'},
    {'key': 'plinth_measurements_south', 'label': 'Plinth Measurement - South'},
    {'key': 'bua', 'label': 'BUA (Built-Up Area)'},
    {'key': 'slab_measurements_east', 'label': 'Slab Measurement - East'},
    {'key': 'slab_measurements_west', 'label': 'Slab Measurement - West'},
    {'key': 'slab_measurements_north', 'label': 'Slab Measurement - North'},
    {'key': 'slab_measurements_south', 'label': 'Slab Measurement - South'},
    {'key': 'slab_area', 'label': 'Slab Area'},
    {'key': 'floor_wise_area', 'label': 'Floor Wise Area (in Sqft.)'},
    {'key': 'road_width', 'label': 'Road Width'},
    {'key': 'person_met_at_site', 'label': 'Person Met at Site'},
    {
      'key': 'relationship_with_customer',
      'label': 'Relationship with Customer',
    },
    {'key': 'stage_of_construction', 'label': 'Stage of Construction'},
    {'key': 'stage_percentage', 'label': 'Stage Percentage'},
    {'key': 'remarks_and_violations', 'label': 'Remarks & Violations'},
    {'key': 'class_of_locality', 'label': 'Class of Locality'},
    {'key': 'site_developed', 'label': 'Site Developed'},
    {'key': 'proximity_amenities', 'label': 'Proximity to Civic Amenities'},
    {'key': 'within_municipal_limits', 'label': 'Within Municipal Limits'},
    {'key': 'panchayat_name', 'label': 'Name of Panchayat'},
    {'key': 'site_access', 'label': 'Site Access'},
    {'key': 'landmark', 'label': 'Landmark'},
    {'key': 'gps_coordinates', 'label': 'GPS Coordinates'},
    {'key': 'address_docs', 'label': 'Address Docs'},
    {'key': 'dist_railway', 'label': 'Dist. from Railway'},
    {'key': 'dist_bus', 'label': 'Dist. from Bus Stand'},
    {'key': 'dist_city_center', 'label': 'Dist. from City Center'},
    {'key': 'approach_road_width', 'label': 'Approach Road Width'},
    {'key': 'meter_number', 'label': 'Meter Number'},
    {'key': 'meter_owner_name', 'label': 'Meter Owner Name'},
    {'key': 'bill_generated_name', 'label': 'Bill Generated Name'},
    {'key': 'meter_owner_matching', 'label': 'Meter No & Owner Matching'},
    {'key': 'lift', 'label': 'Lift Details'},
    {'key': 'lift_available', 'label': 'Lift Available'},
    {'key': 'near_hazards', 'label': 'Near Hazards/Water Body'},
    {'key': 'demarcation_available', 'label': 'Demarcation Available'},
    {'key': 'basic_amenities', 'label': 'Basic Amenities'},
    {'key': 'marketability', 'label': 'Marketability'},
    {'key': 'high_tension_wires', 'label': 'High Tension Wires'},
    {'key': 'area_left_for_cross', 'label': 'Area Left for Cross'},
    {'key': 'joint_wall_slab', 'label': 'Joint Wall/Slab'},
    {'key': 'graveyard_nearby', 'label': 'Graveyard Nearby'},
    {'key': 'property_identified_by', 'label': 'Property Identified By'},
    {'key': 'community_dominated', 'label': 'Community Dominated'},
    {'key': 'linear_dimensions', 'label': 'Linear Dimensions'},
    {
      'key': 'linear_dimensions_matching',
      'label': 'Linear Dimensions Matching',
    },
    {
      'key': 'land_area_as_per_physical',
      'label': 'Land Area as per physical/site',
    },
    {'key': 'no_of_units', 'label': 'No. of Units'},
    {'key': 'land_rate', 'label': 'Land Rate / Flat Rate'},
    {'key': 'rental_per_month', 'label': 'Rental Per Month'},
    {'key': 'land_mismatch_reason', 'label': 'Reason for Land Extent Mismatch'},
    {'key': 'excess_land', 'label': 'Structure Under Excess Land'},
    {
      'key': 'boundary_mismatch_reason',
      'label': 'Reason for Boundary Mismatch',
    },
  ];

  static const List<Map<String, String>> veritasFields = [
    {'key': 'nhb_1991', 'label': 'NHB 1991'},
    {'key': 'nhb_2011', 'label': 'NHB 2011'},
    {'key': 'roof', 'label': 'Roof'},
    {'key': 'eb_service', 'label': 'EB Service'},
    {'key': 'property_tax', 'label': 'Property Tax'},
    {'key': 'passage_less_10ft', 'label': 'Passage Less 10ft'},
    {'key': 'passage_width', 'label': 'Passage Width'},
    {'key': 'distance_main_road', 'label': 'Distance Main Road'},
    {'key': 'water_supply', 'label': 'Water Supply'},
    {'key': 'drainage', 'label': 'Drainage'},
    {'key': 'condition', 'label': 'Condition'},
    {'key': 'facilities', 'label': 'Facilities'},
    {'key': 'civic_status', 'label': 'Civic Status'},
    {'key': 'deviation', 'label': 'Deviation'},
  ];

  // Yes/No fields get dropdowns instead of text fields
  static const Set<String> yesNoFields = {
    'linear_dimensions_matching',
    'meter_owner_matching',
    'community_dominated',
    'demarcation_available',
    'lift_available',
    'excess_land',
  };

  static bool filled(String key, Map data) {
    final value = data[key];
    if (key != 'floor_wise_area')
      return value != null && value.toString().trim().isNotEmpty;
    final floors = int.tryParse(data['no_of_floors']?.toString() ?? '') ?? 0;
    if (floors <= 0) return true;
    return value is List &&
        value.length >= floors &&
        value.every(
          (item) =>
              item is Map &&
              [
                'floor',
                'plinthArea',
                'slabArea',
              ].every((k) => item[k]?.toString().trim().isNotEmpty == true),
        );
  }

  static bool isVeritas(String template) =>
      const {
        'veritas',
        'veritashl',
        'veritaseel',
        'veritasfinance',
        'hemassociatesveritas',
      }.contains(
        template
            .toLowerCase()
            .replaceAll(RegExp(r'[^a-z0-9]'), '')
            .replaceFirst(RegExp(r'template$'), ''),
      );

  static List<Map<String, String>> forTemplate(String template) => [
    ...mandatoryFields,
    if (isVeritas(template)) ...veritasFields,
  ];
}
