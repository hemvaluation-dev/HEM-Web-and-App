// Default/empty state for the valuation report form.
// Mirrors every field found in the H.E.M. Associates "Valuation Report" PDF format.

let idCounter = 0;
export function uid() {
  idCounter += 1;
  return `id_${Date.now()}_${idCounter}`;
}

export const defaultCompanyInfo = {
  name: "H.E.M. ASSOCIATES",
  addressLine: "D.No.8-293/82/CNS/55, Film Nagar, Road No:06, Jubileehills, Hyderabad – 500096",
  phone: "+91 89191 8756",
  email: "hem.valuation@gmail.com",
};

export const defaultFormData = {
  companyInfo: { ...defaultCompanyInfo },
  logoDataUrl: "", // populated from /logo.png on the client before submit

  meta: {
    dateOfInitiate: "",
    dateOfVisit: "",
    contactNumber: "",
    personMetAtSite: "",
    relationshipWithCustomer: "",
  },

  applicant: {
    applicantName: "",
    ownerName: "",
    typeOfProperty: "",
    doorPlotNo: "",
    streetName: "",
    syNo: "",
    villageName: "",
    landMark: "",
    pincode: "",
    valuedBefore: "No",
    valuedBeforeDetails: "",
    distanceFromBranch: "",
  },

  documentsVerified: [{ id: uid(), text: "" }],

  ownershipType: "Free Hold",

  boundaries: {
    east: { doc: "", site: "" },
    west: { doc: "", site: "" },
    north: { doc: "", site: "" },
    south: { doc: "", site: "" },
    matching: "Yes",
  },

  setBacks: { front: "", back: "", right: "", left: "" },
  landDimensions: { east: "", west: "", north: "", south: "" },
  buildingDimensions: { east: "", west: "", north: "", south: "" },
  slabDimensions: { east: "", west: "", north: "", south: "" },

  occupant: {
    status: "Occupied",
    nameOfOccupant: "",
    occupiedFrom: "",
  },

  buildingDetails: {
    propertyDemarcation: "Yes",
    propertyIdentifiedThrough: "",
    typeOfStructure: "",
    plotArea: "",
    noOfFloors: "",
    floorValued: "",
    noOfUnitPerFloor: "",
    noOfLifts: "NA",
  },

  unitDetails: { noOfUnits: "" },

  quality: { construction: "Good", interiorsExteriors: "Good" },

  age: { ageOfProperty: "", residualLife: "" },

  location: {
    type: "Residential",
    classOfLocality: "",
    siteIs: "Developed",
    proximityToCivicAmenities: "",
  },

  closeVicinity: "",

  municipal: { withinLimits: "Yes", nameOfPanchayat: "" },

  siteAccess: "Easy",
  basicAmenities: "Near By",

  marketability: "Good",

  electricity: {
    meterServiceNo: "",
    highTensionWires: "No",
    inNameOf: "",
    propertyTaxInNameOf: "",
    areaLeftForCross: "",
    jointWallSlab: "No",
    graveyardNearby: "No",
  },

  floorWiseArea: [
    { id: uid(), floor: "Ground floor", plinthArea: "", slabArea: "" },
    { id: uid(), floor: "First floor", plinthArea: "", slabArea: "" },
    { id: uid(), floor: "Second floor", plinthArea: "", slabArea: "" },
    { id: uid(), floor: "Third Floor", plinthArea: "", slabArea: "" },
    { id: uid(), floor: "Forth Floor", plinthArea: "", slabArea: "" },
  ],

  valuation: {
    landAreaSqYds: "",
    landRate: "",
    totalConstructionArea: "",
    constructionRate: "",
    stageOfConstruction: "Completed",
    stagePercent: "100%",
    recommendedPercent: "NA",
  },

  floorwiseUsage: [
    { id: uid(), floor: "Ground floor", usage: "Residential", units: "", tenancyYear: "", rentalAssessment: "" },
  ],

  remarks: [
    { id: uid(), text: "The property is physically inspected by our Engineer/Representative." },
  ],

  gpsCoordinates: "",

  photographs: {
    applicantName: "",
    address: "",
    elevation: { id: uid(), caption: "Elevation of the property", image: "" },
    roadView: { id: uid(), caption: "Road view", image: "" },
    extra: [],
  },

  veritas: {
    product: "",
    inspected_by: "",
    authorised_signature: "",
    document_holder_name: "",
    nearest_landmark: "",
    civic_status: "",
    civic_status_other: "",
    nhb_1991: "",
    nhb_2011: "",
    owner_title_deed: "",
    title_deed_details: "",
    usage: "",
    usage_other: "",
    occupancy: "",
    approved_plan: "",
    deviation: "",
    residential_units: "",
    commercial_units: "",
    total_units: "",
    more_than_2_units: "",
    property_identification: "",
    building_age: "",
    future_life: "",
    documents_list: "",
    purchase_property: "",
    agreement_between: "",
    agreement_value: "",
    agreement_date: "",
    agreement_validity: "",
    roof: "",
    flooring: "",
    eb_service: "",
    meter_number: "",
    property_tax: "",
    plot_demarcated: "",
    road_width: "",
    passage_less_10ft: "",
    passage_width: "",
    distance_main_road: "",
    locality: "",
    location_surrounding: "",
    facilities: "",
    water_supply: "",
    drainage: "",
    condition: "",
    rental_value: "",
    glv_sft_sro: "",
    glv_land: "",
    market_range_sft: "",
    rate_sft: "",
    carpet_area: "",
    enhancement: "",
    additional_cost: "",
    temp_existing_bua: "",
    temp_carpet_area: "",
    temp_rate_sft: "",
    temp_existing_value: "",
    temp_additional_cost: "",
    temp_total_value: "",
    work_progress: "",
    construction_stage: "",
    insurance_value: "",
    proposal_number: "",
    existing_loan_amount: "",
    request_loan_amount: "",
    sanctioned_loan_amount: "",
    lcr: "",
    ltv: "",
    combined_ltv: "",
    structure: "",
    hazardous_zones: "",
    geometry: "",
    recommended: "",
    comments: "",
  },
};

export function cloneDefaultFormData() {
  return JSON.parse(JSON.stringify(defaultFormData));
}
