# Lender field mapping audit

Each template uses explicit field IDs. Separate inputs are not inferred from similar labels. Document, site, plan, approved and adopted values remain distinct. Dimensions are feet; fixed lender area and rate units are converted explicitly.

## H.E.M. Associates / Veritas

| Field | Label | Source |
| --- | --- | --- |
| application_number | Application number | Agent / case: application number |
| branch | Branch | Agent / case: branch |
| product | Product | Separate report input — no equivalent mobile field |
| phone | Phone number | Agent / case: phone number |
| applicant_name | Applicant name | Agent / case: applicant name |
| co_applicant_name | Co-applicant's name | Separate report input — no equivalent mobile field |
| inspection_date | Date of inspection | Agent / case: visit date |
| inspected_by | Inspected by | Separate report input — no equivalent mobile field |
| authorised_signature | Authorised signature | Separate report input — no equivalent mobile field |
| document_holder_name | Document holder name | Separate report input — no equivalent mobile field |
| property_type | Property type | Agent / case: property type |
| property_type_other | If others — property type | Separate report input — no equivalent mobile field |
| method_valuation | Method of valuation | Separate report input — no equivalent mobile field |
| property_address | Property address | Agent / case: property address |
| district | District | Agent / case: district |
| state | State | Agent / case: state |
| pincode | Pincode | Agent / case: pincode |
| latitude | Latitude | Agent / case: latitude |
| longitude | Longitude | Agent / case: longitude |
| nearest_landmark | Nearest landmark | Agent / case: landmark |
| branch_distance | Distance from nearest Veritas branch | Agent / case: distance from branch |
| civic_status | Civic status | Agent / case: civic status |
| civic_status_other | If others — civic status | Separate report input — no equivalent mobile field |
| nhb_1991 | NHB — 1991 | Agent / case: nhb 1991 |
| nhb_2011 | NHB — 2011 | Agent / case: nhb 2011 |
| owner_title_deed | Owner's name as per title deed / document number | Separate report input — no equivalent mobile field |
| title_deed_details | Number of title deed involved with details | Separate report input — no equivalent mobile field |
| ownership_type | Ownership type | Agent / case: ownership type |
| usage | Usage of property | Agent / case: property usage |
| usage_other | If others — usage | Separate report input — no equivalent mobile field |
| occupancy | Occupancy status | Agent / case: occupancy details |
| approved_plan | Approved plan | Separate report input — no equivalent mobile field |
| deviation | Deviation observed | Agent / case: deviation |
| floors | Number of floors | Agent / case: no of floors |
| residential_units | Residential units | Separate report input — no equivalent mobile field |
| commercial_units | Commercial units | Separate report input — no equivalent mobile field |
| total_units | Total number of units | Agent / case: no of units |
| more_than_2_units | More than 2 units (CRE) | Separate report input — no equivalent mobile field |
| property_identification | Property identification | Agent / case: property identified by |
| marketability | Marketability | Agent / case: marketability |
| building_age | Age of building | Agent / case: age of property |
| future_life | Estimated future life | Agent / case: residual life |
| east_title | East — as per title deed | Agent / case: boundaries document east |
| east_actual | East — as per actual | Agent / case: boundaries physical east |
| west_title | West — as per title deed | Agent / case: boundaries document west |
| west_actual | West — as per actual | Agent / case: boundaries physical west |
| north_title | North — as per title deed | Agent / case: boundaries document north |
| north_actual | North — as per actual | Agent / case: boundaries physical north |
| south_title | South — as per title deed | Agent / case: boundaries document south |
| south_actual | South — as per actual | Agent / case: boundaries physical south |
| documents_list | Documents given for site visit | Agent / case: property documents verified |
| purchase_property | Whether property is a purchase property | Separate report input — no equivalent mobile field |
| agreement_between | Agreement entered between | Separate report input — no equivalent mobile field |
| agreement_value | Agreement value | Separate report input — no equivalent mobile field |
| agreement_date | Agreement date | Separate report input — no equivalent mobile field |
| agreement_validity | Agreement validity | Separate report input — no equivalent mobile field |
| roof | Roof | Agent / case: roof |
| flooring | Flooring | Agent / case: flooring type |
| eb_service | EB service number | Agent / case: eb service |
| meter_number | Meter number | Agent / case: meter number |
| property_tax | Property tax | Agent / case: property tax |
| plot_demarcated | Plot demarcated | Agent / case: demarcation available |
| road_width | Approximate road width | Agent / case: road width |
| passage_less_10ft | Passage less than 10ft | Agent / case: passage less 10ft |
| passage_width | Passage width | Agent / case: passage width |
| distance_main_road | Distance from abutting main road / street | Agent / case: distance main road |
| locality | Nature of locality | Agent / case: class of locality |
| location_surrounding | Location & surrounding | Separate report input — no equivalent mobile field |
| facilities | Facility available | Agent / case: facilities |
| water_supply | Water supply arrangement | Agent / case: water supply |
| drainage | Drainage arrangement | Agent / case: drainage |
| condition | Condition of property | Agent / case: condition |
| rental_value | Approximate rental value per month | Agent / case: rental per month |
| land_sft | Land in Sft | Calculated from land area (sqft) |
| glv_sft_sro | GLV/SFT wrt SRO rates | Separate report input — no equivalent mobile field |
| glv_land | GLV of land | Separate report input — no equivalent mobile field |
| market_range_sft | Market value range per SFT | Separate report input — no equivalent mobile field |
| rate_sft | Rate per SQFT adopted | Calculated from land rate (sqft) |
| land_value | Land value | Calculated from land value |
| existing_bua | Existing BUA | Calculated from bua (sqft) |
| proposed_bua | Proposed BUA | Separate report input — no equivalent mobile field |
| total_bua | Total BUA | Calculated from this report’s valuation fields |
| carpet_area | Total carpet area | Separate report input — no equivalent mobile field |
| existing_building_value | Existing building value | Calculated from building value |
| proposed_building_value | Proposed building value | Separate report input — no equivalent mobile field |
| enhancement | Enhancement / improvements | Separate report input — no equivalent mobile field |
| additional_cost | Additional cost | Separate report input — no equivalent mobile field |
| total_building_value | Total building value | Calculated from this report’s valuation fields |
| temp_existing_bua | Temporary roof existing BUA | Separate report input — no equivalent mobile field |
| temp_carpet_area | Temporary roof carpet area | Separate report input — no equivalent mobile field |
| temp_rate_sft | Temporary roof rate per sqft | Separate report input — no equivalent mobile field |
| temp_existing_value | Temporary roof existing building value | Separate report input — no equivalent mobile field |
| temp_additional_cost | Temporary roof additional cost | Separate report input — no equivalent mobile field |
| temp_total_value | Temporary roof total building value | Separate report input — no equivalent mobile field |
| land_plus_rcc | Land value + RCC building value | Calculated from this report’s valuation fields |
| land_plus_temp | Land value + temporary building value | Calculated from this report’s valuation fields |
| total_property_value | Total property value | Calculated from this report’s valuation fields |
| forced_sale_value | Forced / distress sale value | Calculated from this report’s valuation fields |
| work_progress | Percentage of work progress | Agent / case: stage percentage |
| construction_stage | Stage of construction | Agent / case: stage of construction |
| insurance_value | Considered value for property insurance | Separate report input — no equivalent mobile field |
| proposal_number | Proposal number | Separate report input — no equivalent mobile field |
| existing_loan_amount | Existing sanctioned loan amount | Separate report input — no equivalent mobile field |
| request_loan_amount | Request loan amount | Separate report input — no equivalent mobile field |
| sanctioned_loan_amount | Sanctioned loan amount | Separate report input — no equivalent mobile field |
| lcr | LCR | Separate report input — no equivalent mobile field |
| ltv | LTV | Separate report input — no equivalent mobile field |
| combined_ltv | Combined LTV | Separate report input — no equivalent mobile field |
| structure | Type of structure | Agent / case: structure type |
| hazardous_zones | Hazardous zones applicable | Agent / case: near hazards |
| geometry | Geometry / design / structural configurations met | Separate report input — no equivalent mobile field |
| recommended | Recommended | Separate report input — no equivalent mobile field |
| comments | Comments | Agent / case: remarks and violations |

## ADITYA BIRLA LAP

| Field | Label | Source |
| --- | --- | --- |
| aditya-birla-lap_0 | Name of Valuer | Separate report input — no equivalent mobile field |
| aditya-birla-lap_1 | Client Name | Agent / case: applicant name |
| aditya-birla-lap_2 | Initiation Date | Agent / case: created at |
| aditya-birla-lap_3 | Vertical | Separate report input — no equivalent mobile field |
| aditya-birla-lap_4 | Visit Date | Agent / case: visit date |
| aditya-birla-lap_5 | Case Reference Number | Agent / case: application number |
| aditya-birla-lap_6 | Report Date | Separate report input — no equivalent mobile field |
| aditya-birla-lap_7 | Proposed Owner | Separate report input — no equivalent mobile field |
| aditya-birla-lap_8 | Property Owner | Agent / case: owner name |
| aditya-birla-lap_9 | Property Address as per TRF | Separate report input — no equivalent mobile field |
| aditya-birla-lap_10 | Property Address as per Visit | Agent / case: property address |
| aditya-birla-lap_11 | Property Address as per Documents | Agent / case: address docs |
| aditya-birla-lap_12 | Main Locality | Separate report input — no equivalent mobile field |
| aditya-birla-lap_13 | Sub Locality | Separate report input — no equivalent mobile field |
| aditya-birla-lap_14 | Micro Location | Separate report input — no equivalent mobile field |
| aditya-birla-lap_15 | Landmark | Agent / case: landmark |
| aditya-birla-lap_16 | Latitude | Agent / case: latitude |
| aditya-birla-lap_17 | Longitude | Agent / case: longitude |
| aditya-birla-lap_18 | Type of Property | Agent / case: property type |
| aditya-birla-lap_19 | Current Usage | Agent / case: property usage |
| aditya-birla-lap_20 | Previous Valuation | Agent / case: previous valuation |
| aditya-birla-lap_21 | If yes, when | Separate report input — no equivalent mobile field |
| aditya-birla-lap_22 | Property Sub Type | Separate report input — no equivalent mobile field |
| aditya-birla-lap_23 | Distance to Railway / Metro | Agent / case: dist railway |
| aditya-birla-lap_24 | Distance to Bus Stop | Agent / case: dist bus |
| aditya-birla-lap_25 | Distance of Plot from Main Road | Separate report input — no equivalent mobile field |
| aditya-birla-lap_26 | Distance from City Centre | Agent / case: dist city center |
| aditya-birla-lap_27 | Distance from ABFL Branch | Agent / case: distance from branch |
| aditya-birla-lap_28 | Width of Approach Road | Agent / case: approach road width |
| aditya-birla-lap_29 | Property Width | Separate report input — no equivalent mobile field |
| aditya-birla-lap_30 | Property Depth | Separate report input — no equivalent mobile field |
| aditya-birla-lap_31 | Occupancy | Agent / case: occupancy details |
| aditya-birla-lap_32 | Occupied Since | Separate report input — no equivalent mobile field |
| aditya-birla-lap_33 | Property Demarcated | Agent / case: demarcation available |
| aditya-birla-lap_34 | Identification Through | Agent / case: property identified by |
| aditya-birla-lap_35 | Flat Configuration | Separate report input — no equivalent mobile field |
| aditya-birla-lap_36 | Type of Structure | Agent / case: structure type |
| aditya-birla-lap_37 | Total No. of Floors | Agent / case: no of floors |
| aditya-birla-lap_38 | Amenities | Agent / case: basic amenities |
| aditya-birla-lap_39 | View of Property | Separate report input — no equivalent mobile field |
| aditya-birla-lap_40 | Quality of Construction | Agent / case: quality of construction |
| aditya-birla-lap_41 | Shape of Property | Separate report input — no equivalent mobile field |
| aditya-birla-lap_42 | Exteriors | Agent / case: interiors exteriors |
| aditya-birla-lap_43 | Age of Property | Agent / case: age of property |
| aditya-birla-lap_44 | Source of Property Age | Separate report input — no equivalent mobile field |
| aditya-birla-lap_45 | Maintenance of Property | Separate report input — no equivalent mobile field |
| aditya-birla-lap_46 | Occupied By | Separate report input — no equivalent mobile field |
| aditya-birla-lap_47 | Occupant Name | Separate report input — no equivalent mobile field |
| aditya-birla-lap_48 | Property Identification | Agent / case: property identified by |
| aditya-birla-lap_49 | Flat Type | Separate report input — no equivalent mobile field |
| aditya-birla-lap_50 | Property Holding | Agent / case: ownership type |
| aditya-birla-lap_51 | Area of Flat | Separate report input — no equivalent mobile field |
| aditya-birla-lap_52 | Lift Facility | Agent / case: lift available |
| aditya-birla-lap_53 | Marketability | Agent / case: marketability |
| aditya-birla-lap_54 | Parking Facility | Separate report input — no equivalent mobile field |
| aditya-birla-lap_55 | Type of Parking | Separate report input — no equivalent mobile field |
| aditya-birla-lap_56 | Property Placement | Separate report input — no equivalent mobile field |
| aditya-birla-lap_57 | Interiors | Agent / case: interiors exteriors |
| aditya-birla-lap_58 | Residual Age | Agent / case: residual life |
| aditya-birla-lap_59 | Cautious Location | Separate report input — no equivalent mobile field |
| aditya-birla-lap_60 | Ground Floor — As per Deed | Separate report input — no equivalent mobile field |
| aditya-birla-lap_61 | Ground Floor — Actual | Agent: ground floor measured plinth area (sq.fts) |
| aditya-birla-lap_62 | First Floor — As per Deed | Separate report input — no equivalent mobile field |
| aditya-birla-lap_63 | First Floor — Actual | Agent: first floor measured plinth area (sq.fts) |
| aditya-birla-lap_64 | Second Floor — As per Deed | Separate report input — no equivalent mobile field |
| aditya-birla-lap_65 | Second Floor — Actual | Agent: second floor measured plinth area (sq.fts) |
| aditya-birla-lap_66 | Third Floor — As per Deed | Separate report input — no equivalent mobile field |
| aditya-birla-lap_67 | Third Floor — Actual | Agent: third floor measured plinth area (sq.fts) |
| aditya-birla-lap_68 | Fourth Floor — As per Deed | Separate report input — no equivalent mobile field |
| aditya-birla-lap_69 | Fourth Floor — Actual | Agent: fourth floor measured plinth area (sq.fts) |
| aditya-birla-lap_70 | Sale Deed / Allotment Letter — Availability | Separate report input — no equivalent mobile field |
| aditya-birla-lap_71 | Sale Deed / Allotment Letter — Details | Separate report input — no equivalent mobile field |
| aditya-birla-lap_72 | Sanctioned Plan — Availability | Separate report input — no equivalent mobile field |
| aditya-birla-lap_73 | Sanctioned Plan — Details | Separate report input — no equivalent mobile field |
| aditya-birla-lap_74 | CC / OC — Availability | Separate report input — no equivalent mobile field |
| aditya-birla-lap_75 | CC / OC — Details | Separate report input — no equivalent mobile field |
| aditya-birla-lap_76 | Agreement to Sale — Availability | Separate report input — no equivalent mobile field |
| aditya-birla-lap_77 | Agreement to Sale — Details | Separate report input — no equivalent mobile field |
| aditya-birla-lap_78 | Mutation / Possession Letter — Availability | Separate report input — no equivalent mobile field |
| aditya-birla-lap_79 | Mutation / Possession Letter — Details | Separate report input — no equivalent mobile field |
| aditya-birla-lap_80 | Tax Receipt — Availability | Separate report input — no equivalent mobile field |
| aditya-birla-lap_81 | Tax Receipt — Details | Separate report input — no equivalent mobile field |
| aditya-birla-lap_82 | Electricity Bill — Availability | Separate report input — no equivalent mobile field |
| aditya-birla-lap_83 | Electricity Bill — Details | Separate report input — no equivalent mobile field |
| aditya-birla-lap_84 | Conversion — Availability | Separate report input — no equivalent mobile field |
| aditya-birla-lap_85 | Conversion — Details | Separate report input — no equivalent mobile field |
| aditya-birla-lap_86 | Ground Floor — As per Site | Agent: ground floor measured plinth area (sq.fts) |
| aditya-birla-lap_87 | Ground Floor — As per Plan / FAR / Document | Separate report input — no equivalent mobile field |
| aditya-birla-lap_88 | Ground Floor — Deviation | Separate report input — no equivalent mobile field |
| aditya-birla-lap_89 | Ground Floor — Remarks | Separate report input — no equivalent mobile field |
| aditya-birla-lap_90 | First Floor — As per Site | Agent: first floor measured plinth area (sq.fts) |
| aditya-birla-lap_91 | First Floor — As per Plan / FAR / Document | Separate report input — no equivalent mobile field |
| aditya-birla-lap_92 | First Floor — Deviation | Separate report input — no equivalent mobile field |
| aditya-birla-lap_93 | First Floor — Remarks | Separate report input — no equivalent mobile field |
| aditya-birla-lap_94 | Second Floor — As per Site | Agent: second floor measured plinth area (sq.fts) |
| aditya-birla-lap_95 | Second Floor — As per Plan / FAR / Document | Separate report input — no equivalent mobile field |
| aditya-birla-lap_96 | Second Floor — Deviation | Separate report input — no equivalent mobile field |
| aditya-birla-lap_97 | Second Floor — Remarks | Separate report input — no equivalent mobile field |
| aditya-birla-lap_98 | Third Floor — As per Site | Agent: third floor measured plinth area (sq.fts) |
| aditya-birla-lap_99 | Third Floor — As per Plan / FAR / Document | Separate report input — no equivalent mobile field |
| aditya-birla-lap_100 | Third Floor — Deviation | Separate report input — no equivalent mobile field |
| aditya-birla-lap_101 | Third Floor — Remarks | Separate report input — no equivalent mobile field |
| aditya-birla-lap_102 | Fourth Floor — As per Site | Agent: fourth floor measured plinth area (sq.fts) |
| aditya-birla-lap_103 | Fourth Floor — As per Plan / FAR / Document | Separate report input — no equivalent mobile field |
| aditya-birla-lap_104 | Fourth Floor — Deviation | Separate report input — no equivalent mobile field |
| aditya-birla-lap_105 | Fourth Floor — Remarks | Separate report input — no equivalent mobile field |
| aditya-birla-lap_106 | Total — As per Site | Separate report input — no equivalent mobile field |
| aditya-birla-lap_107 | Total — As per Plan / FAR / Document | Separate report input — no equivalent mobile field |
| aditya-birla-lap_108 | Total — Deviation | Separate report input — no equivalent mobile field |
| aditya-birla-lap_109 | Total — Remarks | Separate report input — no equivalent mobile field |
| aditya-birla-lap_110 | Plot Area (Deed) — Area | Separate report input — no equivalent mobile field |
| aditya-birla-lap_111 | Plot Area (Deed) — Rate | Separate report input — no equivalent mobile field |
| aditya-birla-lap_112 | Plot Area (Deed) — Value | Separate report input — no equivalent mobile field |
| aditya-birla-lap_113 | Plot Area (Physical) — Area | Calculated from land area (sqft) |
| aditya-birla-lap_114 | Plot Area (Physical) — Rate | Calculated from land rate (sqft) |
| aditya-birla-lap_115 | Plot Area (Physical) — Value | Calculated from land value |
| aditya-birla-lap_116 | Plot Area (Plan) — Area | Separate report input — no equivalent mobile field |
| aditya-birla-lap_117 | Plot Area (Plan) — Rate | Separate report input — no equivalent mobile field |
| aditya-birla-lap_118 | Plot Area (Plan) — Value | Separate report input — no equivalent mobile field |
| aditya-birla-lap_119 | Carpet Area — Area | Separate report input — no equivalent mobile field |
| aditya-birla-lap_120 | Carpet Area — Rate | Separate report input — no equivalent mobile field |
| aditya-birla-lap_121 | Carpet Area — Value | Separate report input — no equivalent mobile field |
| aditya-birla-lap_122 | Built-up Area (Norms) — Area | Separate report input — no equivalent mobile field |
| aditya-birla-lap_123 | Built-up Area (Norms) — Rate | Separate report input — no equivalent mobile field |
| aditya-birla-lap_124 | Built-up Area (Norms) — Value | Separate report input — no equivalent mobile field |
| aditya-birla-lap_125 | Built-up Area (Measurement) — Area | Calculated from bua (sqft) |
| aditya-birla-lap_126 | Built-up Area (Measurement) — Rate | Calculated from construction rate (sqft) |
| aditya-birla-lap_127 | Built-up Area (Measurement) — Value | Calculated from building value |
| aditya-birla-lap_128 | Super Built-up Area — Area | Separate report input — no equivalent mobile field |
| aditya-birla-lap_129 | Super Built-up Area — Rate | Separate report input — no equivalent mobile field |
| aditya-birla-lap_130 | Super Built-up Area — Value | Separate report input — no equivalent mobile field |
| aditya-birla-lap_131 | Car Park — Area | Separate report input — no equivalent mobile field |
| aditya-birla-lap_132 | Car Park — Rate | Separate report input — no equivalent mobile field |
| aditya-birla-lap_133 | Car Park — Value | Separate report input — no equivalent mobile field |
| aditya-birla-lap_134 | Depreciation — Area | Separate report input — no equivalent mobile field |
| aditya-birla-lap_135 | Depreciation — Rate | Separate report input — no equivalent mobile field |
| aditya-birla-lap_136 | Depreciation — Value | Separate report input — no equivalent mobile field |
| aditya-birla-lap_137 | Amenities — Area | Separate report input — no equivalent mobile field |
| aditya-birla-lap_138 | Amenities — Rate | Separate report input — no equivalent mobile field |
| aditya-birla-lap_139 | Amenities — Value | Separate report input — no equivalent mobile field |
| aditya-birla-lap_140 | Front Setback — As per Plan | Separate report input — no equivalent mobile field |
| aditya-birla-lap_141 | Front Setback — Actual | Agent / case: setback front |
| aditya-birla-lap_142 | Front Setback — Deviation | Separate report input — no equivalent mobile field |
| aditya-birla-lap_143 | Front Setback — Remarks | Separate report input — no equivalent mobile field |
| aditya-birla-lap_144 | Left Side Setback — As per Plan | Separate report input — no equivalent mobile field |
| aditya-birla-lap_145 | Left Side Setback — Actual | Agent / case: setback left |
| aditya-birla-lap_146 | Left Side Setback — Deviation | Separate report input — no equivalent mobile field |
| aditya-birla-lap_147 | Left Side Setback — Remarks | Separate report input — no equivalent mobile field |
| aditya-birla-lap_148 | Right Side Setback — As per Plan | Separate report input — no equivalent mobile field |
| aditya-birla-lap_149 | Right Side Setback — Actual | Agent / case: setback right |
| aditya-birla-lap_150 | Right Side Setback — Deviation | Separate report input — no equivalent mobile field |
| aditya-birla-lap_151 | Right Side Setback — Remarks | Separate report input — no equivalent mobile field |
| aditya-birla-lap_152 | Rear Setback — As per Plan | Separate report input — no equivalent mobile field |
| aditya-birla-lap_153 | Rear Setback — Actual | Agent / case: setback rear |
| aditya-birla-lap_154 | Rear Setback — Deviation | Separate report input — no equivalent mobile field |
| aditya-birla-lap_155 | Rear Setback — Remarks | Separate report input — no equivalent mobile field |
| aditya-birla-lap_156 | Total Value | Calculated from total value |
| aditya-birla-lap_157 | Distress Value (80%) | Separate report input — no equivalent mobile field |
| aditya-birla-lap_158 | Insurance Value | Separate report input — no equivalent mobile field |
| aditya-birla-lap_159 | Government Value | Separate report input — no equivalent mobile field |
| aditya-birla-lap_160 | Percentage Completion | Agent / case: stage percentage |
| aditya-birla-lap_161 | Percentage Recommendation | Agent / case: recommended percentage |
| aditya-birla-lap_162 | As per Document — North | Agent / case: boundaries document north |
| aditya-birla-lap_163 | As per Document — South | Agent / case: boundaries document south |
| aditya-birla-lap_164 | As per Document — East | Agent / case: boundaries document east |
| aditya-birla-lap_165 | As per Document — West | Agent / case: boundaries document west |
| aditya-birla-lap_166 | As per Actual — North | Agent / case: boundaries physical north |
| aditya-birla-lap_167 | As per Actual — South | Agent / case: boundaries physical south |
| aditya-birla-lap_168 | As per Actual — East | Agent / case: boundaries physical east |
| aditya-birla-lap_169 | As per Actual — West | Agent / case: boundaries physical west |
| aditya-birla-lap_170 | Boundary Matching | Agent / case: boundaries matching |
| aditya-birla-lap_171 | Remarks | Agent / case: remarks and violations |
| aditya-birla-lap_172 | Engineer Visited | Separate report input — no equivalent mobile field |
| aditya-birla-lap_173 | Supporting Document Details | Agent / case: property documents verified |

## AXIS FINANCE

| Field | Label | Source |
| --- | --- | --- |
| axis-finance_0 | Application Number | Agent / case: application number |
| axis-finance_1 | Customer Name | Agent / case: applicant name |
| axis-finance_2 | Property Owner | Agent / case: owner name |
| axis-finance_3 | Collateral Ownership | Agent / case: ownership type |
| axis-finance_4 | Collateral Category | Separate report input — no equivalent mobile field |
| axis-finance_5 | Property Documents Received | Agent / case: property documents verified |
| axis-finance_6 | Property Details | Separate report input — no equivalent mobile field |
| axis-finance_7 | Property Address | Agent / case: property address |
| axis-finance_8 | City / Mandal | Agent / case: city |
| axis-finance_9 | District | Agent / case: district |
| axis-finance_10 | State | Agent / case: state |
| axis-finance_11 | Pin Code | Agent / case: pincode |
| axis-finance_12 | Nearby Landmark | Agent / case: landmark |
| axis-finance_13 | Distance from City Center | Agent / case: dist city center |
| axis-finance_14 | Classification of Locality | Agent / case: class of locality |
| axis-finance_15 | Approved by Town | Separate report input — no equivalent mobile field |
| axis-finance_16 | Locality Classification | Separate report input — no equivalent mobile field |
| axis-finance_17 | Building Type | Separate report input — no equivalent mobile field |
| axis-finance_18 | Class of Locality | Agent / case: class of locality |
| axis-finance_19 | Type of Locality | Separate report input — no equivalent mobile field |
| axis-finance_20 | Condition of Building | Agent / case: condition |
| axis-finance_21 | Occupancy Details | Agent / case: occupancy details |
| axis-finance_22 | Monthly Rentals | Agent / case: rental per month |
| axis-finance_23 | Name of Lease | Separate report input — no equivalent mobile field |
| axis-finance_24 | Type of Property | Agent / case: property type |
| axis-finance_25 | Status of Property | Separate report input — no equivalent mobile field |
| axis-finance_26 | Actual Usage | Agent / case: property usage |
| axis-finance_27 | Approved Usage | Separate report input — no equivalent mobile field |
| axis-finance_28 | Property Demarcation | Agent / case: demarcation available |
| axis-finance_29 | Distance to transportation | Separate report input — no equivalent mobile field |
| axis-finance_30 | Nearness to recreation facilities | Separate report input — no equivalent mobile field |
| axis-finance_31 | Quality of Interiors | Agent / case: interiors exteriors |
| axis-finance_32 | Vasthu compliance / entrance direction | Separate report input — no equivalent mobile field |
| axis-finance_33 | East boundary — Document part 1 | Agent / case: boundaries document east |
| axis-finance_34 | South boundary — Document part 1 | Agent / case: boundaries document south |
| axis-finance_35 | West boundary — Document part 1 | Agent / case: boundaries document west |
| axis-finance_36 | North boundary — Document part 1 | Agent / case: boundaries document north |
| axis-finance_37 | East boundary — Document part 2 | Separate report input — no equivalent mobile field |
| axis-finance_38 | South boundary — Document part 2 | Separate report input — no equivalent mobile field |
| axis-finance_39 | West boundary — Document part 2 | Separate report input — no equivalent mobile field |
| axis-finance_40 | North boundary — Document part 2 | Separate report input — no equivalent mobile field |
| axis-finance_41 | East boundary — Document part 3 | Separate report input — no equivalent mobile field |
| axis-finance_42 | South boundary — Document part 3 | Separate report input — no equivalent mobile field |
| axis-finance_43 | West boundary — Document part 3 | Separate report input — no equivalent mobile field |
| axis-finance_44 | North boundary — Document part 3 | Separate report input — no equivalent mobile field |
| axis-finance_45 | East boundary — Document part 4 | Separate report input — no equivalent mobile field |
| axis-finance_46 | South boundary — Document part 4 | Separate report input — no equivalent mobile field |
| axis-finance_47 | West boundary — Document part 4 | Separate report input — no equivalent mobile field |
| axis-finance_48 | North boundary — Document part 4 | Separate report input — no equivalent mobile field |
| axis-finance_49 | East boundary — Document part 5 | Separate report input — no equivalent mobile field |
| axis-finance_50 | South boundary — Document part 5 | Separate report input — no equivalent mobile field |
| axis-finance_51 | West boundary — Document part 5 | Separate report input — no equivalent mobile field |
| axis-finance_52 | North boundary — Document part 5 | Separate report input — no equivalent mobile field |
| axis-finance_53 | East boundary — Document part 6 | Separate report input — no equivalent mobile field |
| axis-finance_54 | South boundary — Document part 6 | Separate report input — no equivalent mobile field |
| axis-finance_55 | West boundary — Document part 6 | Separate report input — no equivalent mobile field |
| axis-finance_56 | North boundary — Document part 6 | Separate report input — no equivalent mobile field |
| axis-finance_57 | East boundary — Document part 7 | Separate report input — no equivalent mobile field |
| axis-finance_58 | South boundary — Document part 7 | Separate report input — no equivalent mobile field |
| axis-finance_59 | West boundary — Document part 7 | Separate report input — no equivalent mobile field |
| axis-finance_60 | North boundary — Document part 7 | Separate report input — no equivalent mobile field |
| axis-finance_61 | East boundary — Document part 8 | Separate report input — no equivalent mobile field |
| axis-finance_62 | South boundary — Document part 8 | Separate report input — no equivalent mobile field |
| axis-finance_63 | West boundary — Document part 8 | Separate report input — no equivalent mobile field |
| axis-finance_64 | North boundary — Document part 8 | Separate report input — no equivalent mobile field |
| axis-finance_65 | East boundary — Site | Agent / case: boundaries physical east |
| axis-finance_66 | South boundary — Site | Agent / case: boundaries physical south |
| axis-finance_67 | West boundary — Site | Agent / case: boundaries physical west |
| axis-finance_68 | North boundary — Site | Agent / case: boundaries physical north |
| axis-finance_69 | Latitude | Agent / case: latitude |
| axis-finance_70 | Longitude | Agent / case: longitude |
| axis-finance_71 | Layout Plan — Approval Authority | Separate report input — no equivalent mobile field |
| axis-finance_72 | Layout Plan — Approval No | Separate report input — no equivalent mobile field |
| axis-finance_73 | Layout Plan — Approval Date | Separate report input — no equivalent mobile field |
| axis-finance_74 | Building Plan — Approval Authority | Separate report input — no equivalent mobile field |
| axis-finance_75 | Building Plan — Approval No | Separate report input — no equivalent mobile field |
| axis-finance_76 | Building Plan — Approval Date | Separate report input — no equivalent mobile field |
| axis-finance_77 | Age of Building | Agent / case: age of property |
| axis-finance_78 | Estimated Life of Building | Agent / case: residual life |
| axis-finance_79 | Construction Year | Separate report input — no equivalent mobile field |
| axis-finance_80 | Construction Type | Agent / case: structure type |
| axis-finance_81 | Comments on Feasibility | Separate report input — no equivalent mobile field |
| axis-finance_82 | Depreciation % | Separate report input — no equivalent mobile field |
| axis-finance_83 | No. of Floors as per Plan | Separate report input — no equivalent mobile field |
| axis-finance_84 | No. of Floors as per Site | Agent / case: no of floors |
| axis-finance_85 | Approved Carpet Area | Separate report input — no equivalent mobile field |
| axis-finance_86 | Agreement Carpet Area | Separate report input — no equivalent mobile field |
| axis-finance_87 | Saleable Area of Unit | Separate report input — no equivalent mobile field |
| axis-finance_88 | Floor Rise Rate | Separate report input — no equivalent mobile field |
| axis-finance_89 | Adopted Building Rate | Separate report input — no equivalent mobile field |
| axis-finance_90 | Car Parking Available | Separate report input — no equivalent mobile field |
| axis-finance_91 | No. of Car Parks | Separate report input — no equivalent mobile field |
| axis-finance_92 | Parking Area | Separate report input — no equivalent mobile field |
| axis-finance_93 | Car Parking Price | Separate report input — no equivalent mobile field |
| axis-finance_94 | Amenities Value | Separate report input — no equivalent mobile field |
| axis-finance_95 | Plot Area | Separate report input — no equivalent mobile field |
| axis-finance_96 | As per Site Area — Stilt | Agent: stilt floor measured plinth area (sq.fts) |
| axis-finance_97 | As per Site Area — GF-1 | Agent: gf1 floor measured plinth area (sq.fts) |
| axis-finance_98 | As per Site Area — GF-2 | Agent: gf2 floor measured plinth area (sq.fts) |
| axis-finance_99 | As per Site Area — GF-3 | Agent: gf3 floor measured plinth area (sq.fts) |
| axis-finance_100 | As per Site Area — Third | Agent: third floor measured plinth area (sq.fts) |
| axis-finance_101 | As per Site Area — Fourth | Agent: fourth floor measured plinth area (sq.fts) |
| axis-finance_102 | As per Approved Plan — Stilt | Separate report input — no equivalent mobile field |
| axis-finance_103 | As per Approved Plan — GF-1 | Separate report input — no equivalent mobile field |
| axis-finance_104 | As per Approved Plan — GF-2 | Separate report input — no equivalent mobile field |
| axis-finance_105 | As per Approved Plan — GF-3 | Separate report input — no equivalent mobile field |
| axis-finance_106 | As per Approved Plan — Third | Separate report input — no equivalent mobile field |
| axis-finance_107 | As per Approved Plan — Fourth | Separate report input — no equivalent mobile field |
| axis-finance_108 | Side Margin as per Approval — Front | Separate report input — no equivalent mobile field |
| axis-finance_109 | Side Margin as per Approval — Left | Separate report input — no equivalent mobile field |
| axis-finance_110 | Side Margin as per Approval — Right | Separate report input — no equivalent mobile field |
| axis-finance_111 | Side Margin as per Approval — Rear | Separate report input — no equivalent mobile field |
| axis-finance_112 | Side Margin Actual — Front | Agent / case: setback front |
| axis-finance_113 | Side Margin Actual — Left | Agent / case: setback left |
| axis-finance_114 | Side Margin Actual — Right | Agent / case: setback right |
| axis-finance_115 | Side Margin Actual — Rear | Agent / case: setback rear |
| axis-finance_116 | Side Margin Deviation % — Front | Separate report input — no equivalent mobile field |
| axis-finance_117 | Side Margin Deviation % — Left | Separate report input — no equivalent mobile field |
| axis-finance_118 | Side Margin Deviation % — Right | Separate report input — no equivalent mobile field |
| axis-finance_119 | Side Margin Deviation % — Rear | Separate report input — no equivalent mobile field |
| axis-finance_120 | Quality of Construction | Agent / case: quality of construction |
| axis-finance_121 | Maintenance of Property | Agent / case: condition |
| axis-finance_122 | Land Area (Sq.yds) | Calculated from land area (sqyd) |
| axis-finance_123 | Market Rate of Land | Calculated from land rate (sqyd) |
| axis-finance_124 | Proposed Approved Area — Stilt | Separate report input — no equivalent mobile field |
| axis-finance_125 | Proposed Approved Area — GF-1 | Separate report input — no equivalent mobile field |
| axis-finance_126 | Proposed Approved Area — GF-2 | Separate report input — no equivalent mobile field |
| axis-finance_127 | Proposed Approved Area — GF-3 | Separate report input — no equivalent mobile field |
| axis-finance_128 | Proposed Approved Area — Fourth | Separate report input — no equivalent mobile field |
| axis-finance_129 | Construction Rate — Stilt | Separate report input — no equivalent mobile field |
| axis-finance_130 | Construction Rate — GF-1 | Separate report input — no equivalent mobile field |
| axis-finance_131 | Construction Rate — GF-2 | Separate report input — no equivalent mobile field |
| axis-finance_132 | Construction Rate — GF-3 | Separate report input — no equivalent mobile field |
| axis-finance_133 | Construction Rate — Fourth | Separate report input — no equivalent mobile field |
| axis-finance_134 | Construction Rate — Total | Separate report input — no equivalent mobile field |
| axis-finance_135 | Construction Cost — GF-1 | Separate report input — no equivalent mobile field |
| axis-finance_136 | Construction Cost — GF-2 | Separate report input — no equivalent mobile field |
| axis-finance_137 | Amenities Description | Separate report input — no equivalent mobile field |
| axis-finance_138 | Amenities Amount | Separate report input — no equivalent mobile field |
| axis-finance_139 | Stage of Construction | Agent / case: stage of construction |
| axis-finance_140 | Recommended for Disbursement | Separate report input — no equivalent mobile field |
| axis-finance_141 | Recommended Construction Rate | Separate report input — no equivalent mobile field |
| axis-finance_142 | Recommended Cost of Construction | Separate report input — no equivalent mobile field |
| axis-finance_143 | Government Valuation — Land Area | Separate report input — no equivalent mobile field |
| axis-finance_144 | Government Rate | Separate report input — no equivalent mobile field |
| axis-finance_145 | Government Value of Unit | Separate report input — no equivalent mobile field |
| axis-finance_146 | Red Flag Comments | Separate report input — no equivalent mobile field |
| axis-finance_147 | Technical Status | Separate report input — no equivalent mobile field |
| axis-finance_148 | Person Visited Site | Separate report input — no equivalent mobile field |
| axis-finance_149 | Date of Inspection | Agent / case: visit date |

## CHOLA SME

| Field | Label | Source |
| --- | --- | --- |
| chola-sme_0 | Application / LOS ID | Agent / case: application number |
| chola-sme_1 | Applicant / Co-applicant Name | Agent / case: applicant name |
| chola-sme_2 | Contact Number | Agent / case: phone number |
| chola-sme_3 | Credit Manager Contact | Separate report input — no equivalent mobile field |
| chola-sme_4 | Branch Name | Agent / case: branch |
| chola-sme_5 | Date of Initiation | Agent / case: created at |
| chola-sme_6 | Done By | Separate report input — no equivalent mobile field |
| chola-sme_7 | Date of Completion | Separate report input — no equivalent mobile field |
| chola-sme_8 | Property Owner | Agent / case: owner name |
| chola-sme_9 | Property Address | Agent / case: property address |
| chola-sme_10 | Site Address — Plot Number | Separate report input — no equivalent mobile field |
| chola-sme_11 | Site Address — Door Number | Separate report input — no equivalent mobile field |
| chola-sme_12 | Site Address — Building / House Name | Separate report input — no equivalent mobile field |
| chola-sme_13 | Site Address — Street Name | Separate report input — no equivalent mobile field |
| chola-sme_14 | Site Address — Locality | Separate report input — no equivalent mobile field |
| chola-sme_15 | Site Address — Survey Number | Separate report input — no equivalent mobile field |
| chola-sme_16 | Site Address — Pin Code | Agent / case: pincode |
| chola-sme_17 | Site Address — City | Agent / case: city |
| chola-sme_18 | Site Address — State | Agent / case: state |
| chola-sme_19 | Document Address — Plot Number | Separate report input — no equivalent mobile field |
| chola-sme_20 | Document Address — Door Number | Separate report input — no equivalent mobile field |
| chola-sme_21 | Document Address — Building / House Name | Separate report input — no equivalent mobile field |
| chola-sme_22 | Document Address — Street Name | Separate report input — no equivalent mobile field |
| chola-sme_23 | Document Address — Locality | Separate report input — no equivalent mobile field |
| chola-sme_24 | Document Address — Survey Number | Separate report input — no equivalent mobile field |
| chola-sme_25 | Document Address — Pin Code | Separate report input — no equivalent mobile field |
| chola-sme_26 | Document Address — City | Separate report input — no equivalent mobile field |
| chola-sme_27 | Document Address — State | Separate report input — no equivalent mobile field |
| chola-sme_28 | Landmark | Agent / case: landmark |
| chola-sme_29 | Property Type | Agent / case: property type |
| chola-sme_30 | Building Type | Separate report input — no equivalent mobile field |
| chola-sme_31 | Date of Inspection | Agent / case: visit date |
| chola-sme_32 | Property Location | Separate report input — no equivalent mobile field |
| chola-sme_33 | Proximity to Civic Amenities | Agent / case: proximity amenities |
| chola-sme_34 | Locality | Agent / case: class of locality |
| chola-sme_35 | Amenities within 3 Kms | Separate report input — no equivalent mobile field |
| chola-sme_36 | Neighbourhood | Separate report input — no equivalent mobile field |
| chola-sme_37 | Property Comments | Separate report input — no equivalent mobile field |
| chola-sme_38 | Occupancy Details | Agent / case: occupancy details |
| chola-sme_39 | Actual Property Usage | Agent / case: property usage |
| chola-sme_40 | Usage Comments | Separate report input — no equivalent mobile field |
| chola-sme_41 | Approved Property Usage | Separate report input — no equivalent mobile field |
| chola-sme_42 | Construction Type | Agent / case: structure type |
| chola-sme_43 | Condition Comments | Agent / case: condition |
| chola-sme_44 | Status of Property | Agent / case: stage of construction |
| chola-sme_45 | No. of Floors | Agent / case: no of floors |
| chola-sme_46 | Units per Floor | Separate report input — no equivalent mobile field |
| chola-sme_47 | Demolition List Status | Separate report input — no equivalent mobile field |
| chola-sme_48 | Distance to Railway Station | Agent / case: dist railway |
| chola-sme_49 | Distance to Bus Station | Agent / case: dist bus |
| chola-sme_50 | Airport / Distance | Separate report input — no equivalent mobile field |
| chola-sme_51 | Layout Plan Details | Separate report input — no equivalent mobile field |
| chola-sme_52 | Building Plan Details | Separate report input — no equivalent mobile field |
| chola-sme_53 | Sale Deed Details | Separate report input — no equivalent mobile field |
| chola-sme_54 | Construction Permission Details | Separate report input — no equivalent mobile field |
| chola-sme_55 | Valuation Approach | Separate report input — no equivalent mobile field |
| chola-sme_56 | Construction Commencement Date | Separate report input — no equivalent mobile field |
| chola-sme_57 | Construction Deviation | Separate report input — no equivalent mobile field |
| chola-sme_58 | Deviation Details | Agent / case: deviation |
| chola-sme_59 | Assessment No. | Separate report input — no equivalent mobile field |
| chola-sme_60 | SC No. | Separate report input — no equivalent mobile field |
| chola-sme_61 | Document Boundary — North — Boundary | Agent / case: boundaries document north |
| chola-sme_62 | Document Boundary — South — Boundary | Agent / case: boundaries document south |
| chola-sme_63 | Document Boundary — East — Boundary | Agent / case: boundaries document east |
| chola-sme_64 | Document Boundary — West — Boundary | Agent / case: boundaries document west |
| chola-sme_65 | Document Boundary — North — Dimension | Separate report input — no equivalent mobile field |
| chola-sme_66 | Document Boundary — South — Dimension | Separate report input — no equivalent mobile field |
| chola-sme_67 | Document Boundary — East — Dimension | Separate report input — no equivalent mobile field |
| chola-sme_68 | Document Boundary — West — Dimension | Separate report input — no equivalent mobile field |
| chola-sme_69 | Site Boundary — North — Boundary | Agent / case: boundaries physical north |
| chola-sme_70 | Site Boundary — South — Boundary | Agent / case: boundaries physical south |
| chola-sme_71 | Site Boundary — East — Boundary | Agent / case: boundaries physical east |
| chola-sme_72 | Site Boundary — West — Boundary | Agent / case: boundaries physical west |
| chola-sme_73 | Site Boundary — North — Dimension | Agent / case: land measurements north |
| chola-sme_74 | Site Boundary — South — Dimension | Agent / case: land measurements south |
| chola-sme_75 | Site Boundary — East — Dimension | Agent / case: land measurements east |
| chola-sme_76 | Site Boundary — West — Dimension | Agent / case: land measurements west |
| chola-sme_77 | Quality of Construction | Agent / case: quality of construction |
| chola-sme_78 | Nature of Building | Separate report input — no equivalent mobile field |
| chola-sme_79 | Floorwise Usage | Separate report input — no equivalent mobile field |
| chola-sme_80 | Maintenance of Property | Agent / case: condition |
| chola-sme_81 | Present Age | Agent / case: age of property |
| chola-sme_82 | Residual Age | Agent / case: residual life |
| chola-sme_83 | Year of Construction | Separate report input — no equivalent mobile field |
| chola-sme_84 | Flooring | Agent / case: flooring type |
| chola-sme_85 | Finishing | Separate report input — no equivalent mobile field |
| chola-sme_86 | Doors / Windows | Separate report input — no equivalent mobile field |
| chola-sme_87 | Roof | Agent / case: roof |
| chola-sme_88 | Amenities | Agent / case: basic amenities |
| chola-sme_89 | Encroachment Details | Separate report input — no equivalent mobile field |
| chola-sme_90 | Land Extent — Area as per Plan / Document | Separate report input — no equivalent mobile field |
| chola-sme_91 | Land Extent — Area as per Actual | Calculated from land area (sqyd) |
| chola-sme_92 | Land Extent — Rate per Sq.yd | Calculated from land rate (sqyd) |
| chola-sme_93 | Land Extent — Amount as per Plan / Document | Separate report input — no equivalent mobile field |
| chola-sme_94 | Land Extent — Amount as per Actual | Calculated from land value |
| chola-sme_95 | Cupboards Amount | Separate report input — no equivalent mobile field |
| chola-sme_96 | Interiors Amount | Separate report input — no equivalent mobile field |
| chola-sme_97 | Elevation Amount | Separate report input — no equivalent mobile field |
| chola-sme_98 | Borewell Amount | Separate report input — no equivalent mobile field |
| chola-sme_99 | Total Property Value | Separate report input — no equivalent mobile field |
| chola-sme_100 | Total Estimated Value | Separate report input — no equivalent mobile field |
| chola-sme_101 | Distress Sale Value | Separate report input — no equivalent mobile field |
| chola-sme_102 | Guideline Value | Separate report input — no equivalent mobile field |
| chola-sme_103 | Remarks | Agent / case: remarks and violations |
| chola-sme_104 | Stage of Construction | Agent / case: stage of construction |
| chola-sme_105 | Percentage Completed | Agent / case: stage percentage |
| chola-sme_106 | FSI as per Law | Separate report input — no equivalent mobile field |
| chola-sme_107 | Actual FSI | Separate report input — no equivalent mobile field |
| chola-sme_108 | Additional Construction at Site | Separate report input — no equivalent mobile field |
| chola-sme_109 | Document Submitted | Agent / case: property documents verified |
| chola-sme_110 | Representative Who Inspected | Separate report input — no equivalent mobile field |
| chola-sme_111 | No Direct / Indirect Interest | Separate report input — no equivalent mobile field |
| chola-sme_112 | Information Declaration | Separate report input — no equivalent mobile field |

## EQUITAS

| Field | Label | Source |
| --- | --- | --- |
| equitas_0 | Request ID | Agent / case: application number |
| equitas_1 | Date | Separate report input — no equivalent mobile field |
| equitas_2 | Applicant Name | Agent / case: applicant name |
| equitas_3 | Owner Name | Agent / case: owner name |
| equitas_4 | Branch Name | Agent / case: branch |
| equitas_5 | Visit Done By | Separate report input — no equivalent mobile field |
| equitas_6 | Contact Number | Agent / case: phone number |
| equitas_7 | Product | Separate report input — no equivalent mobile field |
| equitas_8 | Property Age | Agent / case: age of property |
| equitas_9 | Residual Age | Agent / case: residual life |
| equitas_10 | Property Type | Agent / case: property type |
| equitas_11 | Property Usage | Agent / case: property usage |
| equitas_12 | Address as per Document | Agent / case: address docs |
| equitas_13 | Address as per Site | Agent / case: property address |
| equitas_14 | Nearest Landmark | Agent / case: landmark |
| equitas_15 | Latitude / Longitude | Agent / case: latitude + longitude |
| equitas_16 | Property Identifiable | Separate report input — no equivalent mobile field |
| equitas_17 | Clearly Demarcated | Agent / case: demarcation available |
| equitas_18 | Nature of Locality | Agent / case: class of locality |
| equitas_19 | Locality Development | Agent / case: site developed |
| equitas_20 | % Residential Usage | Separate report input — no equivalent mobile field |
| equitas_21 | % Commercial Usage | Separate report input — no equivalent mobile field |
| equitas_22 | Near Water / Railway / Buffer Zone | Agent / case: near hazards |
| equitas_23 | Distance from Hazard | Separate report input — no equivalent mobile field |
| equitas_24 | Electricity Meter No. | Agent / case: meter number |
| equitas_25 | Installation in Favour Of | Agent / case: meter owner name |
| equitas_26 | Nearest ESFB Branch | Separate report input — no equivalent mobile field |
| equitas_27 | Distance from Nearest Branch | Agent / case: distance from branch |
| equitas_28 | Document Boundary — North | Agent / case: boundaries document north |
| equitas_29 | Document Boundary — South | Agent / case: boundaries document south |
| equitas_30 | Document Boundary — East | Agent / case: boundaries document east |
| equitas_31 | Document Boundary — West | Agent / case: boundaries document west |
| equitas_32 | Site Boundary — North | Agent / case: boundaries physical north |
| equitas_33 | Site Boundary — South | Agent / case: boundaries physical south |
| equitas_34 | Site Boundary — East | Agent / case: boundaries physical east |
| equitas_35 | Site Boundary — West | Agent / case: boundaries physical west |
| equitas_36 | Document Dimension — North | Separate report input — no equivalent mobile field |
| equitas_37 | Document Dimension — South | Separate report input — no equivalent mobile field |
| equitas_38 | Document Dimension — East | Separate report input — no equivalent mobile field |
| equitas_39 | Document Dimension — West | Separate report input — no equivalent mobile field |
| equitas_40 | Site Dimension — North | Agent / case: land measurements north |
| equitas_41 | Site Dimension — South | Agent / case: land measurements south |
| equitas_42 | Site Dimension — East | Agent / case: land measurements east |
| equitas_43 | Site Dimension — West | Agent / case: land measurements west |
| equitas_44 | Boundary Matching — North | Separate report input — no equivalent mobile field |
| equitas_45 | Boundary Matching — South | Separate report input — no equivalent mobile field |
| equitas_46 | Boundary Matching — East | Separate report input — no equivalent mobile field |
| equitas_47 | Boundary Matching — West | Separate report input — no equivalent mobile field |
| equitas_48 | Boundary Mismatch Remarks | Agent / case: boundary mismatch reason |
| equitas_49 | Plot — Plan / Deed Area | Separate report input — no equivalent mobile field |
| equitas_50 | Construction — Plan / Deed Area | Separate report input — no equivalent mobile field |
| equitas_51 | Plot — Site Area | Calculated from land area (sqft) |
| equitas_52 | Construction — Site Area | Calculated from bua (sqft) |
| equitas_53 | Plot — Adopted Area | Separate report input — no equivalent mobile field |
| equitas_54 | Construction — Adopted Area | Separate report input — no equivalent mobile field |
| equitas_55 | Plot — Rate | Calculated from land rate (sqft) |
| equitas_56 | Construction — Rate | Calculated from construction rate (sqft) |
| equitas_57 | Plot — % Completion | Separate report input — no equivalent mobile field |
| equitas_58 | Construction — % Completion | Agent / case: stage percentage |
| equitas_59 | Plot — Valuation | Calculated from land value |
| equitas_60 | Construction — Valuation | Calculated from building value |
| equitas_61 | Amenities Description | Separate report input — no equivalent mobile field |
| equitas_62 | Amenities Amount | Separate report input — no equivalent mobile field |
| equitas_63 | Final Market Value | Calculated from total value |
| equitas_64 | As-on-Date Value | Separate report input — no equivalent mobile field |
| equitas_65 | Forced Sale Value | Separate report input — no equivalent mobile field |
| equitas_66 | Approved Layout Plan — Record Type | Separate report input — no equivalent mobile field |
| equitas_67 | Approved Layout Plan — Reference No. | Separate report input — no equivalent mobile field |
| equitas_68 | Approved Layout Plan — Reference Date | Separate report input — no equivalent mobile field |
| equitas_69 | Approved Layout Plan — Approval / Details | Separate report input — no equivalent mobile field |
| equitas_70 | Approved Plan — Record Type | Separate report input — no equivalent mobile field |
| equitas_71 | Approved Plan — Reference No. | Separate report input — no equivalent mobile field |
| equitas_72 | Approved Plan — Reference Date | Separate report input — no equivalent mobile field |
| equitas_73 | Approved Plan — Approval / Details | Separate report input — no equivalent mobile field |
| equitas_74 | Title Document / Sale Deed — Record Type | Separate report input — no equivalent mobile field |
| equitas_75 | Title Document / Sale Deed — Reference No. | Separate report input — no equivalent mobile field |
| equitas_76 | Title Document / Sale Deed — Reference Date | Separate report input — no equivalent mobile field |
| equitas_77 | Title Document / Sale Deed — Approval / Details | Separate report input — no equivalent mobile field |
| equitas_78 | NA Order — Record Type | Separate report input — no equivalent mobile field |
| equitas_79 | NA Order — Reference No. | Separate report input — no equivalent mobile field |
| equitas_80 | NA Order — Reference Date | Separate report input — no equivalent mobile field |
| equitas_81 | NA Order — Approval / Details | Separate report input — no equivalent mobile field |
| equitas_82 | Sale Agreement — Record Type | Separate report input — no equivalent mobile field |
| equitas_83 | Sale Agreement — Reference No. | Separate report input — no equivalent mobile field |
| equitas_84 | Sale Agreement — Reference Date | Separate report input — no equivalent mobile field |
| equitas_85 | Sale Agreement — Approval / Details | Separate report input — no equivalent mobile field |
| equitas_86 | Katha / Patta — Record Type | Separate report input — no equivalent mobile field |
| equitas_87 | Katha / Patta — Reference No. | Separate report input — no equivalent mobile field |
| equitas_88 | Katha / Patta — Reference Date | Separate report input — no equivalent mobile field |
| equitas_89 | Katha / Patta — Approval / Details | Separate report input — no equivalent mobile field |
| equitas_90 | Tax Paid Receipt — Record Type | Separate report input — no equivalent mobile field |
| equitas_91 | Tax Paid Receipt — Reference No. | Separate report input — no equivalent mobile field |
| equitas_92 | Tax Paid Receipt — Reference Date | Separate report input — no equivalent mobile field |
| equitas_93 | Tax Paid Receipt — Approval / Details | Separate report input — no equivalent mobile field |
| equitas_94 | Building Permit — Record Type | Separate report input — no equivalent mobile field |
| equitas_95 | Building Permit — Reference No. | Separate report input — no equivalent mobile field |
| equitas_96 | Building Permit — Reference Date | Separate report input — no equivalent mobile field |
| equitas_97 | Building Permit — Approval / Details | Separate report input — no equivalent mobile field |
| equitas_98 | Cash Receipt / Estimation — Record Type | Separate report input — no equivalent mobile field |
| equitas_99 | Cash Receipt / Estimation — Reference No. | Separate report input — no equivalent mobile field |
| equitas_100 | Cash Receipt / Estimation — Reference Date | Separate report input — no equivalent mobile field |
| equitas_101 | Cash Receipt / Estimation — Approval / Details | Separate report input — no equivalent mobile field |
| equitas_102 | Other Documents — Record Type | Separate report input — no equivalent mobile field |
| equitas_103 | Other Documents — Reference No. | Separate report input — no equivalent mobile field |
| equitas_104 | Other Documents — Reference Date | Separate report input — no equivalent mobile field |
| equitas_105 | Other Documents — Approval / Details | Separate report input — no equivalent mobile field |
| equitas_106 | Builder Name | Separate report input — no equivalent mobile field |
| equitas_107 | RERA Number | Separate report input — no equivalent mobile field |
| equitas_108 | Technically Acceptable | Separate report input — no equivalent mobile field |
| equitas_109 | Marketability | Agent / case: marketability |
| equitas_110 | Actual FSI | Separate report input — no equivalent mobile field |
| equitas_111 | Allowable FSI | Separate report input — no equivalent mobile field |
| equitas_112 | Approved Plan Available | Separate report input — no equivalent mobile field |
| equitas_113 | Plan Approving Authority | Separate report input — no equivalent mobile field |
| equitas_114 | Plan Approval No | Separate report input — no equivalent mobile field |
| equitas_115 | Approval Date | Separate report input — no equivalent mobile field |
| equitas_116 | Occupancy Status | Agent / case: occupancy details |
| equitas_117 | Person Met at Site | Agent / case: person met at site |
| equitas_118 | Relationship with Owner | Agent / case: relationship with customer |
| equitas_119 | Occupied Since | Separate report input — no equivalent mobile field |
| equitas_120 | Approach Road Type | Separate report input — no equivalent mobile field |
| equitas_121 | Approach Road Width | Agent / case: approach road width |
| equitas_122 | Road Widening Proposal | Separate report input — no equivalent mobile field |
| equitas_123 | Approved Land Use | Separate report input — no equivalent mobile field |
| equitas_124 | Current Usage | Agent / case: property usage |
| equitas_125 | No. of Tenants | Separate report input — no equivalent mobile field |
| equitas_126 | Floors Permitted | Separate report input — no equivalent mobile field |
| equitas_127 | Floors Constructed | Agent / case: no of floors |
| equitas_128 | Structure Type | Agent / case: structure type |
| equitas_129 | Setback Deviation | Separate report input — no equivalent mobile field |
| equitas_130 | Vertical Deviation | Separate report input — no equivalent mobile field |
| equitas_131 | Risk of Demolition | Separate report input — no equivalent mobile field |
| equitas_132 | Rental Information | Agent / case: rental per month |
| equitas_133 | Property Remarks | Agent / case: remarks and violations |

## ICICI

| Field | Label | Source |
| --- | --- | --- |
| icici_0 | Request ID | Agent / case: application number |
| icici_1 | Customer Name | Agent / case: applicant name |
| icici_2 | Application No | Agent / case: application number |
| icici_3 | Channel Name | Separate report input — no equivalent mobile field |
| icici_4 | Report Type | Separate report input — no equivalent mobile field |
| icici_5 | Business Group | Separate report input — no equivalent mobile field |
| icici_6 | Product Type | Separate report input — no equivalent mobile field |
| icici_7 | Product Name | Separate report input — no equivalent mobile field |
| icici_8 | Project Name | Separate report input — no equivalent mobile field |
| icici_9 | Building Name | Separate report input — no equivalent mobile field |
| icici_10 | Property Type | Agent / case: property type |
| icici_11 | Unit Type | Separate report input — no equivalent mobile field |
| icici_12 | Unit No | Separate report input — no equivalent mobile field |
| icici_13 | Images | Separate report input — no equivalent mobile field |
| icici_14 | Property Address | Agent / case: property address |
| icici_15 | Country | Separate report input — no equivalent mobile field |
| icici_16 | State | Agent / case: state |
| icici_17 | City | Agent / case: city |
| icici_18 | Nearby Landmark | Agent / case: landmark |
| icici_19 | Pincode | Agent / case: pincode |
| icici_20 | Contact Name | Separate report input — no equivalent mobile field |
| icici_21 | Mobile 2 / Landline 2 | Separate report input — no equivalent mobile field |
| icici_22 | Request Initiator Name | Separate report input — no equivalent mobile field |
| icici_23 | Document Name | Separate report input — no equivalent mobile field |
| icici_24 | Document Number | Separate report input — no equivalent mobile field |
| icici_25 | Document Date | Separate report input — no equivalent mobile field |
| icici_26 | East — Sale Deed | Agent / case: boundaries document east |
| icici_27 | East — Actual Site | Agent / case: boundaries physical east |
| icici_28 | West — Sale Deed | Agent / case: boundaries document west |
| icici_29 | West — Actual Site | Agent / case: boundaries physical west |
| icici_30 | North — Sale Deed | Agent / case: boundaries document north |
| icici_31 | North — Actual Site | Agent / case: boundaries physical north |
| icici_32 | South — Sale Deed | Agent / case: boundaries document south |
| icici_33 | South — Actual Site | Agent / case: boundaries physical south |
| icici_34 | Boundary Matching | Agent / case: boundaries matching |
| icici_35 | Plot Area | Separate report input — no equivalent mobile field |
| icici_36 | Plot Demarcated at Site | Agent / case: demarcation available |
| icici_37 | Infrastructure of Surrounding Area | Agent / case: site developed |
| icici_38 | Class of Locality | Agent / case: class of locality |
| icici_39 | Property Area | Separate report input — no equivalent mobile field |
| icici_40 | Property Location | Separate report input — no equivalent mobile field |
| icici_41 | Distance from City Center | Agent / case: dist city center |
| icici_42 | Type of Property | Agent / case: property type |
| icici_43 | No. of Floors | Agent / case: no of floors |
| icici_44 | Realisable Value (85%) | Separate report input — no equivalent mobile field |
| icici_45 | Cost of Construction | Separate report input — no equivalent mobile field |
| icici_46 | Distress Value (75%) | Separate report input — no equivalent mobile field |
| icici_47 | Carpet Area Measured | Separate report input — no equivalent mobile field |
| icici_48 | To Be Billed | Separate report input — no equivalent mobile field |
| icici_49 | No. of Rooms | Separate report input — no equivalent mobile field |
| icici_50 | No. of Kitchens | Separate report input — no equivalent mobile field |
| icici_51 | No. of Bathrooms | Separate report input — no equivalent mobile field |
| icici_52 | Structure | Agent / case: structure type |
| icici_53 | Interior | Agent / case: interiors exteriors |
| icici_54 | Exterior | Agent / case: interiors exteriors |
| icici_55 | Maintenance Level | Agent / case: condition |
| icici_56 | Approx. Age of Property | Agent / case: age of property |
| icici_57 | Occupancy Status | Agent / case: occupancy details |
| icici_58 | Occupied By | Separate report input — no equivalent mobile field |
| icici_59 | Relationship with Customer | Agent / case: relationship with customer |
| icici_60 | Occupied Since | Separate report input — no equivalent mobile field |
| icici_61 | Residual Age | Agent / case: residual life |
| icici_62 | Land — Area | Calculated from land area (sqft) |
| icici_63 | Land — Rate | Calculated from land rate (sqft) |
| icici_64 | Land — Amount | Calculated from land value |
| icici_65 | BUA — Area | Calculated from bua (sqft) |
| icici_66 | BUA — Rate | Calculated from construction rate (sqft) |
| icici_67 | BUA — Amount | Calculated from building value |
| icici_68 | Total | Calculated from total value |
| icici_69 | Round Off Total | Separate report input — no equivalent mobile field |
| icici_70 | Round Off Total in Words | Separate report input — no equivalent mobile field |
| icici_71 | Govt. Valuation — Area | Separate report input — no equivalent mobile field |
| icici_72 | Govt. Valuation — Rate | Separate report input — no equivalent mobile field |
| icici_73 | Constructed Area | Separate report input — no equivalent mobile field |
| icici_74 | Constructed Rate | Separate report input — no equivalent mobile field |
| icici_75 | Government Total Value | Separate report input — no equivalent mobile field |
| icici_76 | Floorwise Building Usage | Separate report input — no equivalent mobile field |
| icici_77 | Request Date | Agent / case: created at |
| icici_78 | Parent Product Type | Separate report input — no equivalent mobile field |
| icici_79 | Product Type | Separate report input — no equivalent mobile field |
| icici_80 | Stage of Construction | Agent / case: stage of construction |
| icici_81 | Stage Description | Separate report input — no equivalent mobile field |
| icici_82 | % Completion | Agent / case: stage percentage |
| icici_83 | % Recommended | Agent / case: recommended percentage |
| icici_84 | Completion Status | Separate report input — no equivalent mobile field |
| icici_85 | Violations Observed | Agent / case: remarks and violations |
| icici_86 | Remark 1 | Separate report input — no equivalent mobile field |
| icici_87 | Remark 2 | Separate report input — no equivalent mobile field |
| icici_88 | Remark 3 | Separate report input — no equivalent mobile field |
| icici_89 | Remark 4 | Separate report input — no equivalent mobile field |
| icici_90 | Remark 5 | Separate report input — no equivalent mobile field |
| icici_91 | Visited By | Separate report input — no equivalent mobile field |
| icici_92 | Visited On | Agent / case: visit date |
| icici_93 | Visited User Type | Separate report input — no equivalent mobile field |
| icici_94 | Entered By | Separate report input — no equivalent mobile field |
| icici_95 | Entered On | Separate report input — no equivalent mobile field |
| icici_96 | Approver ID | Separate report input — no equivalent mobile field |
| icici_97 | Approver Name | Separate report input — no equivalent mobile field |
| icici_98 | Approver Designation | Separate report input — no equivalent mobile field |
| icici_99 | Approver Remarks | Separate report input — no equivalent mobile field |
| icici_100 | Declaration Date | Separate report input — no equivalent mobile field |
| icici_101 | Declaration Place | Separate report input — no equivalent mobile field |

## JM FINANCE

| Field | Label | Source |
| --- | --- | --- |
| jm-finance_0 | JMFHL BRANCH NAME | Agent / case: branch |
| jm-finance_1 | NAME OF APPLICANT (S) | Agent / case: applicant name |
| jm-finance_2 | NAME & NUMBER OF CONTACT PERSON FOR PROPERTY VISIT | Agent / case: person met at site |
| jm-finance_3 | TRANSACTION TYPE | Separate report input — no equivalent mobile field |
| jm-finance_4 | PROJECT APPROVAL STATUS | Separate report input — no equivalent mobile field |
| jm-finance_5 | PROJECT NAME | Separate report input — no equivalent mobile field |
| jm-finance_6 | BUILDING NAME & NO. | Separate report input — no equivalent mobile field |
| jm-finance_7 | WING NAME & NO. | Separate report input — no equivalent mobile field |
| jm-finance_8 | HOUSE/FLAT/UNIT NO. | Separate report input — no equivalent mobile field |
| jm-finance_9 | BUILDER GROUP NAME | Separate report input — no equivalent mobile field |
| jm-finance_10 | COMPANY NAME FOR PROJECT | Separate report input — no equivalent mobile field |
| jm-finance_11 | REMARKS ON REPUTATION OF BUILDER AND PROJECT | Separate report input — no equivalent mobile field |
| jm-finance_12 | RERA APPLICABLE | Separate report input — no equivalent mobile field |
| jm-finance_13 | IF APPLICABLE, RERA REGISTRATION STATUS | Separate report input — no equivalent mobile field |
| jm-finance_14 | RERA REGISTRATION NO | Separate report input — no equivalent mobile field |
| jm-finance_15 | IF ANY LITIGATION RECORD ON PROJECT AS PER RERA | Separate report input — no equivalent mobile field |
| jm-finance_16 | ENTER DETAILED ADDRESS IN BELOW FORM AS PER PROPERTY VISIT | Agent / case: property address |
| jm-finance_17 | HOUSE/FLAT NO. | Separate report input — no equivalent mobile field |
| jm-finance_18 | FLOOR NO. | Separate report input — no equivalent mobile field |
| jm-finance_19 | WING NAME & NO. | Separate report input — no equivalent mobile field |
| jm-finance_20 | BUILDING NAME & NO. | Separate report input — no equivalent mobile field |
| jm-finance_21 | PROJECT NAME/SOCIETY NAME | Separate report input — no equivalent mobile field |
| jm-finance_22 | PLOT NO. | Separate report input — no equivalent mobile field |
| jm-finance_23 | SUERVEY NO. | Separate report input — no equivalent mobile field |
| jm-finance_24 | STAGE/SECTOR/WARD NO. | Separate report input — no equivalent mobile field |
| jm-finance_25 | STREET NAME &/NO. | Separate report input — no equivalent mobile field |
| jm-finance_26 | VILLAGE/LOCATION | Separate report input — no equivalent mobile field |
| jm-finance_27 | LANDMARK 1 | Agent / case: landmark |
| jm-finance_28 | LANDMARK 2 | Separate report input — no equivalent mobile field |
| jm-finance_29 | PIN CODE | Agent / case: pincode |
| jm-finance_30 | PIN CODE AREA | Separate report input — no equivalent mobile field |
| jm-finance_31 | CITY / TALUKA/TOWN | Agent / case: city |
| jm-finance_32 | LATITUDE VALUE | Agent / case: latitude |
| jm-finance_33 | LONGITUDE VALUE | Agent / case: longitude |
| jm-finance_34 | ADDRESS AS PER DOC | Agent / case: address docs |
| jm-finance_35 | ADDRESS AS ACTUAL ON SITE | Agent / case: property address |
| jm-finance_36 | LEGAL DOCUMENT(S) VERIFIED FOR ADDRESS | Agent / case: property documents verified |
| jm-finance_37 | AS PER APPROVED PLAN | Separate report input — no equivalent mobile field |
| jm-finance_38 | West boundary — Site | Agent / case: boundaries physical west |
| jm-finance_39 | North boundary — Document | Agent / case: boundaries document north |
| jm-finance_40 | West boundary — Document | Agent / case: boundaries document west |
| jm-finance_41 | AS PER APPROVED PLAN | Separate report input — no equivalent mobile field |
| jm-finance_42 | MUNICIPAL AUTHORITY (NAME) | Agent / case: panchayat name |
| jm-finance_43 | AGE OF PROPERTY (YEARS) | Agent / case: age of property |
| jm-finance_44 | RESIDUAL AGE OF PROPERTY (YEARS) | Agent / case: residual life |
| jm-finance_45 | APPROACH ROAD TO PROPERTY | Agent / case: site access |
| jm-finance_46 | TYPE OF APPROACH ROAD | Separate report input — no equivalent mobile field |
| jm-finance_47 | WIDTH OF APPROACH ROAD (MTRS) | Agent / case: approach road width (converted from feet to metres) |
| jm-finance_48 | CLASS OF LOCALITY | Agent / case: class of locality |
| jm-finance_49 | SURROUNDING INFRASTRUCTURE | Agent / case: site developed |
| jm-finance_50 | PROPERTY/DWELLING UNIT TYPE | Agent / case: property type |
| jm-finance_51 | OCCUPANCY STATUS | Agent / case: occupancy details |
| jm-finance_52 | PROPERTY FURNISHED/UNFURNISHED | Separate report input — no equivalent mobile field |
| jm-finance_53 | OCCUPANT NAME | Separate report input — no equivalent mobile field |
| jm-finance_54 | SELLER NAME | Separate report input — no equivalent mobile field |
| jm-finance_55 | WHETHER PROPERTY LEASEHOLD OR FREEHOLD | Agent / case: ownership type |
| jm-finance_56 | IF LEASEHOLD, NAME OF THE LEASOR | Separate report input — no equivalent mobile field |
| jm-finance_57 | IF LEASEHOLD,END DATE & BALANCE TENURE OF LEASE | Separate report input — no equivalent mobile field |
| jm-finance_58 | NO. OF ROOM & INTERNAL AMENITIES DETAILS | Separate report input — no equivalent mobile field |
| jm-finance_59 | ZONING AS PER DEVELOPMENT PLAN | Separate report input — no equivalent mobile field |
| jm-finance_60 | FALLING IN RESERVATION AS PER DEVELOPMENT PLAN | Separate report input — no equivalent mobile field |
| jm-finance_61 | FALLING IN PRESENT OR PROPOSED ROAD WIDENING | Separate report input — no equivalent mobile field |
| jm-finance_62 | PROPERTY WITHIN 30 MTRS FROM RAILWAY BOUNDARY ? | Separate report input — no equivalent mobile field |
| jm-finance_63 | IF YES, APPROX DISTANCE FROM RAILWAY BOUNDARY (MTRS) | Separate report input — no equivalent mobile field |
| jm-finance_64 | IF YES, DETAILS OF NOC AVAILABLE FROM RAILWAY | Separate report input — no equivalent mobile field |
| jm-finance_65 | PROPERTY NEAR HIGH/LOW TENSION (HT)/(LT) LINES ? | Agent / case: high tension wires |
| jm-finance_66 | IF YES, APPROX VERTICAL DISTANCE FROM (HT)/(LT) LINES | Separate report input — no equivalent mobile field |
| jm-finance_67 | CURRENT PROPERTY USAGE | Agent / case: property usage |
| jm-finance_68 | APPROVED PROPERTY USAGE | Separate report input — no equivalent mobile field |
| jm-finance_69 | FSI DEVIATION | Separate report input — no equivalent mobile field |
| jm-finance_70 | VERTICAL DEVIATION | Separate report input — no equivalent mobile field |
| jm-finance_71 | REMARKS IF PROPERTY AFFECTED BY ANY OF CRITICAL PARAMETER | Separate report input — no equivalent mobile field |
| jm-finance_72 | HABITATION % WITHIN 500 MTRS AROUND PROPERTY | Separate report input — no equivalent mobile field |
| jm-finance_73 | PROPERTY ABUTTING AGRICULTURAL LAND? | Separate report input — no equivalent mobile field |
| jm-finance_74 | IF YES, RATE (psf) OF THE AGRICULTURAL LAND | Separate report input — no equivalent mobile field |
| jm-finance_75 | PERCENTAGE OF SURROUNDING DEVELOPMENT CONSIDERING CONNECTIVITY, BASIC AMENITIES, CONSTRUCTION ACTIVITY & OCCUPANCY* | Separate report input — no equivalent mobile field |
| jm-finance_76 | FLOOD PRONE AREA | Separate report input — no equivalent mobile field |
| jm-finance_77 | NATURE OF BUILDING/WING | Separate report input — no equivalent mobile field |
| jm-finance_78 | STRUCTURE TYPE | Agent / case: structure type |
| jm-finance_79 | FOOTING TYPE | Separate report input — no equivalent mobile field |
| jm-finance_80 | SHAPE OF BUILDING | Separate report input — no equivalent mobile field |
| jm-finance_81 | MORTAR TYPE | Separate report input — no equivalent mobile field |
| jm-finance_82 | ROOF TYPE | Agent / case: roof |
| jm-finance_83 | FLOOD PRONE AREA | Separate report input — no equivalent mobile field |
| jm-finance_84 | SOIL TYPE | Separate report input — no equivalent mobile field |
| jm-finance_85 | NEAREST HIGHWAY/MAJOR ROAD | Separate report input — no equivalent mobile field |
| jm-finance_86 | PLOT AREA (i) | Calculated from land area (sqm) |
| jm-finance_87 | TOTAL REALIZABLE VALUATION OF THE PROPERTY (RS.) IN WORDS | Separate report input — no equivalent mobile field |
| jm-finance_88 | DISTRESS VALUE (RS.) IN WORDS | Separate report input — no equivalent mobile field |
| jm-finance_89 | GROSS MONTHLY RENTAL FOR SIMILAR PROPERTIES IN LOCALITY IN (RS.) | Agent / case: rental per month |
| jm-finance_90 | Government Guideline Rate Per sq.ft. | Separate report input — no equivalent mobile field |
| jm-finance_91 | NO. OF UPPER FLOOR(S) | Separate report input — no equivalent mobile field |
| jm-finance_92 | PROPERTY TAX RECIEPTS | Agent / case: property tax |
| jm-finance_93 | OWNERSHIP DOCUMENT VERIFIED 1 (PLS SPECIFY NAME OF DOCUMENT IN DETAILS OF APPROVAL) | Separate report input — no equivalent mobile field |
| jm-finance_94 | OWNERSHIP DOCUMENT VERIFIED 2 (PLS SPECIFY NAME OF DOCUMENT IN DETAILS OF APPROVAL) | Separate report input — no equivalent mobile field |
| jm-finance_95 | PROPERTY TECHNICALLY ACCEPTABLE ? | Separate report input — no equivalent mobile field |
| jm-finance_96 | REMARKS ON THE PROPERTY | Agent / case: remarks and violations |
| jm-finance_97 | MARKETABILITY OF PROPERTY | Agent / case: marketability |
| jm-finance_98 | PROPERTY VISITED BY | Separate report input — no equivalent mobile field |
| jm-finance_99 | REPORT PREPARED BY | Separate report input — no equivalent mobile field |
| jm-finance_100 | REPORT SUBMITTED TO | Separate report input — no equivalent mobile field |
| jm-finance_101 | VISITED ON(DATE) | Agent / case: visit date |
| jm-finance_102 | PREPARED ON(DATE) | Separate report input — no equivalent mobile field |
| jm-finance_103 | SUBMITTED ON (DATE) | Separate report input — no equivalent mobile field |
| jm-finance_104 | APPROACH ROAD TO PROPERTY | Agent / case: site access |
| jm-finance_105 | MAIN DOOR OF PROPERTY | Separate report input — no equivalent mobile field |
| jm-finance_106 | Supporting document detail 1 | Separate report input — no equivalent mobile field |
| jm-finance_107 | Supporting document detail 2 | Separate report input — no equivalent mobile field |
| jm-finance_108 | Supporting document detail 3 | Separate report input — no equivalent mobile field |
| jm-finance_109 | Person Met at Site / Contact No | Agent / case: person met at site |
| jm-finance_address_line_2 | Property Visit Address - Line 2 | Separate report input — no equivalent mobile field |
| jm-finance_address_line_3 | Property Visit Address - Line 3 | Separate report input — no equivalent mobile field |
| jm-finance_site_e66 | North boundary — Site | Agent / case: boundaries physical north |
| jm-finance_site_g66 | South boundary — Site | Agent / case: boundaries physical south |
| jm-finance_site_g67 | South boundary — Document | Agent / case: boundaries document south |
| jm-finance_site_i66 | East boundary — Site | Agent / case: boundaries physical east |
| jm-finance_site_i67 | East boundary — Document | Agent / case: boundaries document east |
| jm-finance_site_e161 | Plot area (sq.fts) | Calculated from land area (sqft) |
| jm-finance_site_g161 | Land rate per sq.ft | Calculated from land rate (sqft) |

## NIWAS FINANCE

| Field | Label | Source |
| --- | --- | --- |
| niwas-finance_0 | Valuers name, Contact Details, Email ID & Code | Separate report input — no equivalent mobile field |
| niwas-finance_1 | Date of report (dd-mm-yyyy) | Separate report input — no equivalent mobile field |
| niwas-finance_2 | Valuation requested by & Branch name | Separate report input — no equivalent mobile field |
| niwas-finance_3 | Deal Number (mandatory) | Agent / case: application number |
| niwas-finance_4 | Loan Product (HL/LAP/MSME LAP) | Separate report input — no equivalent mobile field |
| niwas-finance_5 | Date & Time of visit (dd-mm-yyyy & hh:mm) | Agent / case: visit date |
| niwas-finance_6 | Visiting engineer name & Mobile number | Separate report input — no equivalent mobile field |
| niwas-finance_7 | Details (Name, contact details and relation to applicant) of the person available at the time of technical visit. | Agent / case: person met at site |
| niwas-finance_8 | Has the valuer done valuation of this property before for IHFPL? If yes, share details | Agent / case: previous valuation |
| niwas-finance_9 | Name of the borrower | Agent / case: applicant name |
| niwas-finance_10 | Name of document holder / Name of the property owner | Agent / case: owner name |
| niwas-finance_11 | Type of loan (scheme : Self Construction/P+C/Builder Purchase/Resale Purchase/HL BT&Top Up/Extension/Repair & Renovation/Additional Top up/LAP SORP/LAP SOCP/LAP Refinance/MSME LAP SORP/LAP BT& TOP UP) | Separate report input — no equivalent mobile field |
| niwas-finance_12 | Type of property (Independent House/Flat in Apartment/Under construction property/Open Plot/row house) | Agent / case: property type |
| niwas-finance_13 | Usage as per Approved plans & Permission (Residential / Industrial / Commercial / Mixed Usage) | Separate report input — no equivalent mobile field |
| niwas-finance_14 | For Completed Properties - Specify if Usage is in line with approvals. If not mention area segregation as per usage (Residential / Industrial / Commercial / Mixed Usage) | Agent / case: property usage |
| niwas-finance_15 | Property occupation status (Self occupied/Let out/Vacant/Partially occupied/Under Construction) | Agent / case: occupancy details |
| niwas-finance_16 | Complete detailed address as per the the legal documentation | Agent / case: address docs |
| niwas-finance_17 | District | Agent / case: district |
| niwas-finance_18 | State | Agent / case: state |
| niwas-finance_19 | Pincode | Agent / case: pincode |
| niwas-finance_20 | East boundary — physical | Agent / case: boundaries physical east |
| niwas-finance_21 | Do the Boundaries match? Actual vs the Legal Documentation. Specify in detail if there is a mismatch (As per site) / Boundaries matching with Sale Deed (Yes/No) | Agent / case: boundaries matching |
| niwas-finance_22 | Longitude & Latitude of the property | Agent / case: longitude + latitude |
| niwas-finance_23 | Nearest Railway Station from property and Distance | Separate report input — no equivalent mobile field |
| niwas-finance_24 | Nearest Bus Station from property and Distance | Separate report input — no equivalent mobile field |
| niwas-finance_25 | Nearest State Highway from property and Distance | Separate report input — no equivalent mobile field |
| niwas-finance_26 | Road | Separate report input — no equivalent mobile field |
| niwas-finance_27 | Nearest School from property and Distance | Separate report input — no equivalent mobile field |
| niwas-finance_28 | Nearest University from property and Distance | Separate report input — no equivalent mobile field |
| niwas-finance_29 | Nearest Police Station from property and Distance | Separate report input — no equivalent mobile field |
| niwas-finance_30 | Nearest Hospital from property and Distance | Separate report input — no equivalent mobile field |
| niwas-finance_31 | LIST OF DOCUMENTS PROVIDED for Valuation | Agent / case: property documents verified |
| niwas-finance_32 | Name of Approving Authority & Approval no. | Separate report input — no equivalent mobile field |
| niwas-finance_33 | Name of Approving Authority & Approval No. | Separate report input — no equivalent mobile field |
| niwas-finance_34 | Specify Document provided for Non Agriculture usage, Non Agriculture Converted Area & the Approving Authority (if any) | Separate report input — no equivalent mobile field |
| niwas-finance_35 | Is the location inside the Municipal Corporation Limits? Specify Yes / No. If yes, Specify its name | Agent / case: within municipal limits |
| niwas-finance_36 | Is the location inside the Gram Panchayat Limits? Specify Yes / No. If yes, Specify its name | Separate report input — no equivalent mobile field |
| niwas-finance_37 | Applicable Authority for Approval of Plot Layout Plan | Separate report input — no equivalent mobile field |
| niwas-finance_38 | Applicable Authority for Approval of Construction Layout Plan | Separate report input — no equivalent mobile field |
| niwas-finance_39 | Name of the Authority approving the Plot Layout with Approval Details Designation of the Authority, Date & Year ) | Separate report input — no equivalent mobile field |
| niwas-finance_40 | Name of the Authority approving the Construction Layout with Approval Details (Designation of the Authority, Date & Year ) | Separate report input — no equivalent mobile field |
| niwas-finance_41 | Approximate percentage of habitation / occupancy in the locality (please mention %) | Separate report input — no equivalent mobile field |
| niwas-finance_42 | Width of the passage leading to the actual property in Feet (For Individual House Types) | Agent / case: passage width |
| niwas-finance_43 | If the property has multiple tenants, please provide the area wise occupation & usage details | Separate report input — no equivalent mobile field |
| niwas-finance_44 | Is the property situated in the violated vertical portion? (Yes/No) | Separate report input — no equivalent mobile field |
| niwas-finance_45 | Is the property partly / completely situated in the violated horizontal portion? Yes / No. ( If partly, mention Area in SqFt& the percentage ) | Separate report input — no equivalent mobile field |
| niwas-finance_46 | Specify Any factors that would affect the Saleability / Marketability of the property | Agent / case: marketability |
| niwas-finance_47 | Is the Location Sketch provided from the nearest permanent landmark? (Yes/No) | Separate report input — no equivalent mobile field |
| niwas-finance_48 | Nearest Landmark as per Engineer physical visit | Agent / case: landmark |
| niwas-finance_49 | Does a part or whole of the property figure in any of the illegal / unauthorised list of constructions / properties maintained / circulated / declared by the government? If Yes, please provide relevant details | Separate report input — no equivalent mobile field |
| niwas-finance_50 | Does the property have a proper Electrical connection from the government / or an government authorised service provider? Please provide details. | Agent / case: eb service |
| niwas-finance_51 | Does the property have a proper Water Supply connection from the government / or an government authorised service provider? Please provide details | Agent / case: water supply |
| niwas-finance_52 | Does the property have a proper Waste Water / Sewage Disposal System provided by the government / or an government authorised service provider? Please provide details. | Agent / case: drainage |
| niwas-finance_53 | Has there been any legal / punitive action ( Serving of Notices, Demolitions etc ) on any properties in the vicinity? If yes, please provide details. | Separate report input — no equivalent mobile field |
| niwas-finance_54 | Has there been any government notification issued or in the making which would affect the legal status of the property &it's saleability / marketability? If yes, please provide relevant details. | Separate report input — no equivalent mobile field |
| niwas-finance_55 | Is the property (Part/Whole ) in contravention to the current Zoning Regulations as per the Development Control Regulations or the Development Plan? If yes, please provide details.(Yes/No) | Separate report input — no equivalent mobile field |
| niwas-finance_56 | If Yes, Please provide details | Separate report input — no equivalent mobile field |
| niwas-finance_57 | Land use of property as per zoning regulations? (Residential/Commercial/Industrial/Agricultural/Mixed use/Institutional/Recreational/Conservation) | Separate report input — no equivalent mobile field |
| niwas-finance_58 | Was there any kind of notification displayed in the vicinity that would affect the legal / authorised status & / or saleability / marketability of the property offered as a collateral? If yes, please provide details | Separate report input — no equivalent mobile field |
| niwas-finance_59 | Whether property/collateral to be mortgaged is National Disaster Management Authority (NDMA) norms compiled (Yes/No) | Separate report input — no equivalent mobile field |
| niwas-finance_60 | Is the property affected by road widening as per Master plan (Yes/No) | Separate report input — no equivalent mobile field |
| niwas-finance_61 | Can plot Demarcated / Identified on site (Yes / No) | Agent / case: demarcation available |
| niwas-finance_62 | Ownership Type (Free hold/Lease hold) | Agent / case: ownership type |
| niwas-finance_63 | Agreement Value | Separate report input — no equivalent mobile field |
| niwas-finance_64 | Land Area considered for Valuation (in Sq. ft/Sq.yd) | Separate report input — no equivalent mobile field |
| niwas-finance_65 | Prevailing Market Rate Range (in Rs per Sq.ft/Sq.yd) | Separate report input — no equivalent mobile field |
| niwas-finance_66 | Developer name (Self/Contractor/Builder name) | Separate report input — no equivalent mobile field |
| niwas-finance_67 | Number of floors | Agent / case: no of floors |
| niwas-finance_68 | Number of Flats / Units in the Building | Agent / case: no of units |
| niwas-finance_69 | Number of Lifts | Separate report input — no equivalent mobile field |
| niwas-finance_70 | Floor in which property is situated | Agent / case: floor valued |
| niwas-finance_71 | Property status (Complete/Incomplete) | Agent / case: stage of construction |
| niwas-finance_72 | Year of Construction of building | Separate report input — no equivalent mobile field |
| niwas-finance_73 | Age of the property (for completed properties) (no of years) | Agent / case: age of property |
| niwas-finance_74 | Residual age of the property (in Years) | Agent / case: residual life |
| niwas-finance_75 | Type of construction (Load Bearing/RCC/ACC/Composite) | Agent / case: structure type |
| niwas-finance_76 | Type of Roofing (RCC/ACC/Others) | Agent / case: roof |
| niwas-finance_77 | Construction Status / Work Completion Status | Agent / case: stage of construction |
| niwas-finance_78 | Land Area /Plot area (in Sq.ft/in Sq Yd) (As per document) | Separate report input — no equivalent mobile field |
| niwas-finance_79 | Land Area/Plot area (in Sq.ft/in Sq Yd) (As per plan) | Separate report input — no equivalent mobile field |
| niwas-finance_80 | Land Area/Plot area (in Sq.ft/in Sq Yd) (As per site) | Separate report input — no equivalent mobile field |
| niwas-finance_81 | Final land/Plot area considered for valuation (in Sq.ft/in Sq Yd) | Separate report input — no equivalent mobile field |
| niwas-finance_82 | Value of land (per sq yd) for similar properties in the vicinity and surroundings (as inquired from local agents) (in Rs/Sq yd) | Separate report input — no equivalent mobile field |
| niwas-finance_83 | Government Guideline / Circle rate for land (in Rs per Sq.ft/Sq yd) | Separate report input — no equivalent mobile field |
| niwas-finance_84 | Total Land Value As per Government Guidelines (in Rs) | Separate report input — no equivalent mobile field |
| niwas-finance_85 | Rate adopted for valuation for LAND (per Sq yard/Sq ft)( in Rs.) | Separate report input — no equivalent mobile field |
| niwas-finance_86 | Construction Estimation given by customer (Yes/No/NA) | Separate report input — no equivalent mobile field |
| niwas-finance_87 | Groun Floor (in SFt) | Agent: ground floor measured plinth area (sq.fts) |
| niwas-finance_88 | First Floor (in Sft) | Agent: first floor measured plinth area (sq.fts) |
| niwas-finance_89 | Second Floor (in sft) | Agent: second floor measured plinth area (sq.fts) |
| niwas-finance_90 | Third floor (in sft) | Agent: third floor measured plinth area (sq.fts) |
| niwas-finance_91 | Construction Cost/Rate considered for construction (in Rs per Sq.ft) | Separate report input — no equivalent mobile field |
| niwas-finance_92 | Current Stage of Construction (%) | Agent / case: stage percentage |
| niwas-finance_93 | Approach road condition leading to the property (Good/Bad) | Separate report input — no equivalent mobile field |
| niwas-finance_94 | Development of surrounding areas of property (Underdeveloped/Developing/Developed) | Agent / case: site developed |
| niwas_municipal_name | Municipal corporation name | Separate report input — no equivalent mobile field |
| remarks_and_violations | Inspection remarks | Agent / case: remarks and violations |
| niwas-finance_site_c31 | North boundary — document | Agent / case: boundaries document north |
| niwas-finance_site_d31 | North boundary — physical | Agent / case: boundaries physical north |
| niwas-finance_site_c32 | East boundary — document | Agent / case: boundaries document east |
| niwas-finance_site_c33 | West boundary — document | Agent / case: boundaries document west |
| niwas-finance_site_d33 | West boundary — physical | Agent / case: boundaries physical west |
| niwas-finance_site_c34 | South boundary — document | Agent / case: boundaries document south |
| niwas-finance_site_d34 | South boundary — physical | Agent / case: boundaries physical south |

## SMFG LAP

| Field | Label | Source |
| --- | --- | --- |
| smfg-lap_0 | Vertical | Separate report input — no equivalent mobile field |
| smfg-lap_1 | Branch Name | Agent / case: branch |
| smfg-lap_2 | Type of Case | Separate report input — no equivalent mobile field |
| smfg-lap_3 | Date Initiated | Agent / case: created at |
| smfg-lap_4 | Date of Visit | Agent / case: visit date |
| smfg-lap_5 | Date of Report | Separate report input — no equivalent mobile field |
| smfg-lap_6 | Contacted Person / ID Details | Agent / case: person met at site |
| smfg-lap_7 | Applicant Name | Agent / case: applicant name |
| smfg-lap_8 | Owner Name | Agent / case: owner name |
| smfg-lap_9 | Property Type | Agent / case: property type |
| smfg-lap_10 | Current Usage | Agent / case: property usage |
| smfg-lap_11 | Address as per Filing | Separate report input — no equivalent mobile field |
| smfg-lap_12 | Address at Site | Agent / case: property address |
| smfg-lap_13 | Address as per Document | Agent / case: address docs |
| smfg-lap_14 | Previous Valuation | Agent / case: previous valuation |
| smfg-lap_15 | Distance from Branch | Agent / case: distance from branch |
| smfg-lap_16 | Sanctioned Plan Verification | Separate report input — no equivalent mobile field |
| smfg-lap_17 | Property Documents Verified | Agent / case: property documents verified |
| smfg-lap_18 | Ownership Type | Agent / case: ownership type |
| smfg-lap_19 | Construction as per Plan | Separate report input — no equivalent mobile field |
| smfg-lap_20 | Permissible Usage | Separate report input — no equivalent mobile field |
| smfg-lap_21 | Demolition List Status | Separate report input — no equivalent mobile field |
| smfg-lap_22 | Land Boundary — Document — East | Agent / case: boundaries document east |
| smfg-lap_23 | Land Boundary — Document — West | Agent / case: boundaries document west |
| smfg-lap_24 | Land Boundary — Document — North | Agent / case: boundaries document north |
| smfg-lap_25 | Land Boundary — Document — South | Agent / case: boundaries document south |
| smfg-lap_26 | Flat Boundary — Document — East | Separate report input — no equivalent mobile field |
| smfg-lap_27 | Flat Boundary — Document — West | Separate report input — no equivalent mobile field |
| smfg-lap_28 | Flat Boundary — Document — North | Separate report input — no equivalent mobile field |
| smfg-lap_29 | Flat Boundary — Document — South | Separate report input — no equivalent mobile field |
| smfg-lap_30 | Boundary — Site — East | Agent / case: boundaries physical east |
| smfg-lap_31 | Boundary — Site — West | Agent / case: boundaries physical west |
| smfg-lap_32 | Boundary — Site — North | Agent / case: boundaries physical north |
| smfg-lap_33 | Boundary — Site — South | Agent / case: boundaries physical south |
| smfg-lap_34 | Boundary Matching | Agent / case: boundaries matching |
| smfg-lap_35 | Occupancy Status | Agent / case: occupancy details |
| smfg-lap_36 | Occupant Name | Separate report input — no equivalent mobile field |
| smfg-lap_37 | Occupied Since | Separate report input — no equivalent mobile field |
| smfg-lap_38 | Relationship with Applicant | Agent / case: relationship with customer |
| smfg-lap_39 | Property Demarcation | Agent / case: demarcation available |
| smfg-lap_40 | Property Identification | Agent / case: property identified by |
| smfg-lap_41 | Structure Type | Agent / case: structure type |
| smfg-lap_42 | Plot Area | Separate report input — no equivalent mobile field |
| smfg-lap_43 | No. of Floors | Agent / case: no of floors |
| smfg-lap_44 | Floor Valued | Agent / case: floor valued |
| smfg-lap_45 | Units per Floor | Separate report input — no equivalent mobile field |
| smfg-lap_46 | No. of Lifts | Separate report input — no equivalent mobile field |
| smfg-lap_47 | No. of Rooms | Separate report input — no equivalent mobile field |
| smfg-lap_48 | Built-up Area | Separate report input — no equivalent mobile field |
| smfg-lap_49 | Carpet Area | Separate report input — no equivalent mobile field |
| smfg-lap_50 | View Remarks | Separate report input — no equivalent mobile field |
| smfg-lap_51 | Quality of Construction | Agent / case: quality of construction |
| smfg-lap_52 | Interiors / Exteriors | Agent / case: interiors exteriors |
| smfg-lap_53 | Property Age | Agent / case: age of property |
| smfg-lap_54 | Residual Life | Agent / case: residual life |
| smfg-lap_55 | Location Type | Separate report input — no equivalent mobile field |
| smfg-lap_56 | Class of Locality | Agent / case: class of locality |
| smfg-lap_57 | Development Status | Agent / case: site developed |
| smfg-lap_58 | Civic Amenities / Transport | Agent / case: proximity amenities |
| smfg-lap_59 | Landmark | Agent / case: landmark |
| smfg-lap_60 | Within Municipal Limits | Agent / case: within municipal limits |
| smfg-lap_61 | Municipality Name | Agent / case: panchayat name |
| smfg-lap_62 | Site Access | Agent / case: site access |
| smfg-lap_63 | Basic Amenities | Agent / case: basic amenities |
| smfg-lap_64 | Marketability | Agent / case: marketability |
| smfg-lap_65 | Electricity Meter / Service No. | Agent / case: meter number |
| smfg-lap_66 | Actual Area — Base | Agent: basement floor measured plinth area (sq.fts) |
| smfg-lap_67 | Actual Area — Stilt | Agent: stilt floor measured plinth area (sq.fts) |
| smfg-lap_68 | Actual Area — Ground | Agent: ground floor measured plinth area (sq.fts) |
| smfg-lap_69 | Actual Area — First | Agent: first floor measured plinth area (sq.fts) |
| smfg-lap_70 | Actual Area — Second | Agent: second floor measured plinth area (sq.fts) |
| smfg-lap_71 | Actual Area — Third | Agent: third floor measured plinth area (sq.fts) |
| smfg-lap_72 | Actual Area — Fourth | Agent: fourth floor measured plinth area (sq.fts) |
| smfg-lap_73 | Permissible Area — Base | Separate report input — no equivalent mobile field |
| smfg-lap_74 | Permissible Area — Stilt | Separate report input — no equivalent mobile field |
| smfg-lap_75 | Permissible Area — Ground | Separate report input — no equivalent mobile field |
| smfg-lap_76 | Permissible Area — First | Separate report input — no equivalent mobile field |
| smfg-lap_77 | Permissible Area — Second | Separate report input — no equivalent mobile field |
| smfg-lap_78 | Permissible Area — Third | Separate report input — no equivalent mobile field |
| smfg-lap_79 | Permissible Area — Fourth | Separate report input — no equivalent mobile field |
| smfg-lap_80 | Extra Coverage % — Base | Separate report input — no equivalent mobile field |
| smfg-lap_81 | Extra Coverage % — Stilt | Separate report input — no equivalent mobile field |
| smfg-lap_82 | Extra Coverage % — Ground | Separate report input — no equivalent mobile field |
| smfg-lap_83 | Extra Coverage % — First | Separate report input — no equivalent mobile field |
| smfg-lap_84 | Extra Coverage % — Second | Separate report input — no equivalent mobile field |
| smfg-lap_85 | Extra Coverage % — Third | Separate report input — no equivalent mobile field |
| smfg-lap_86 | Extra Coverage % — Fourth | Separate report input — no equivalent mobile field |
| smfg-lap_87 | Risk of Demolition | Separate report input — no equivalent mobile field |
| smfg-lap_88 | Total Actual Area | Separate report input — no equivalent mobile field |
| smfg-lap_89 | Total Permissible Area | Separate report input — no equivalent mobile field |
| smfg-lap_90 | Saleable Area | Separate report input — no equivalent mobile field |
| smfg-lap_91 | Composite Extra Coverage | Separate report input — no equivalent mobile field |
| smfg-lap_92 | Land — Area | Calculated from land area (sqyd) |
| smfg-lap_93 | Land — Rate | Calculated from land rate (sqyd) |
| smfg-lap_94 | Land — Amount | Calculated from land value |
| smfg-lap_95 | Construction — Area | Calculated from bua (sqft) |
| smfg-lap_96 | Construction — Rate | Calculated from construction rate (sqft) |
| smfg-lap_97 | Construction — Amount | Calculated from building value |
| smfg-lap_98 | Stage of Construction | Agent / case: stage of construction |
| smfg-lap_99 | Stage % | Agent / case: stage percentage |
| smfg-lap_100 | Recommended % | Agent / case: recommended percentage |
| smfg-lap_101 | Amenity — Car Parking | Separate report input — no equivalent mobile field |
| smfg-lap_102 | Amenity — PLC | Separate report input — no equivalent mobile field |
| smfg-lap_103 | Amenity — IDC | Separate report input — no equivalent mobile field |
| smfg-lap_104 | Amenity — EDC | Separate report input — no equivalent mobile field |
| smfg-lap_105 | Amenity — Power Backup | Separate report input — no equivalent mobile field |
| smfg-lap_106 | Amenity — Club Membership | Separate report input — no equivalent mobile field |
| smfg-lap_107 | Amenity — Other | Separate report input — no equivalent mobile field |
| smfg-lap_108 | Total Amenities Charges | Separate report input — no equivalent mobile field |
| smfg-lap_109 | Market Value | Calculated from total value |
| smfg-lap_110 | Forced Sale Value | Separate report input — no equivalent mobile field |
| smfg-lap_111 | Circle Rate | Separate report input — no equivalent mobile field |
| smfg-lap_112 | Approx. Rental | Agent / case: rental per month |
| smfg-lap_113 | Seismic Zone | Separate report input — no equivalent mobile field |
| smfg-lap_114 | Structure Type | Agent / case: structure type |
| smfg-lap_115 | Footing Type | Separate report input — no equivalent mobile field |
| smfg-lap_116 | Roof Type | Agent / case: roof |
| smfg-lap_117 | Masonry Type | Separate report input — no equivalent mobile field |
| smfg-lap_118 | Soil Type | Separate report input — no equivalent mobile field |
| smfg-lap_119 | Floor | Separate report input — no equivalent mobile field |
| smfg-lap_120 | Usage | Separate report input — no equivalent mobile field |
| smfg-lap_121 | Units | Separate report input — no equivalent mobile field |
| smfg-lap_122 | Tenancy Year | Separate report input — no equivalent mobile field |
| smfg-lap_123 | Rental Assessment | Separate report input — no equivalent mobile field |
| smfg-lap_124 | Remarks | Agent / case: remarks and violations |
| smfg-lap_125 | Photo Page Applicant / Address | Separate report input — no equivalent mobile field |
| smfg-lap_126 | Final Photo Page Applicant / Address | Separate report input — no equivalent mobile field |

## SMFG RURAL LAP

| Field | Label | Source |
| --- | --- | --- |
| smfg-rural-lap_0 | Purpose of Valuation | Separate report input — no equivalent mobile field |
| smfg-rural-lap_1 | a. Date of inspection | Agent / case: visit date |
| smfg-rural-lap_2 | b. Date on which the valuation is made | Separate report input — no equivalent mobile field |
| smfg-rural-lap_3 | Valuation Requested by | Separate report input — no equivalent mobile field |
| smfg-rural-lap_4 | Suburb Name | Separate report input — no equivalent mobile field |
| smfg-rural-lap_5 | Type of Loan | Separate report input — no equivalent mobile field |
| smfg-rural-lap_6 | Project Type (if any) | Separate report input — no equivalent mobile field |
| smfg-rural-lap_7 | Applicant Mobile No. | Agent / case: phone number |
| smfg-rural-lap_8 | Name of the Applicant Co Applicant | Agent / case: applicant name |
| smfg-rural-lap_9 | Property Address | Agent / case: property address |
| smfg-rural-lap_10 | Property Owner(as per Doc) | Agent / case: owner name |
| smfg-rural-lap_11 | Documents Submitted Sale DEED | Separate report input — no equivalent mobile field |
| smfg-rural-lap_12 | Dated | Separate report input — no equivalent mobile field |
| smfg-rural-lap_13 | Other Documents Provided | Separate report input — no equivalent mobile field |
| smfg-rural-lap_14 | Brief description of the property | Separate report input — no equivalent mobile field |
| smfg-rural-lap_15 | Name of the access Road | Separate report input — no equivalent mobile field |
| smfg-rural-lap_16 | S. No. Plot. No .and C.T.S No. | Separate report input — no equivalent mobile field |
| smfg-rural-lap_17 | Mode of Transport to the Property | Separate report input — no equivalent mobile field |
| smfg-rural-lap_18 | Approvals for drawings from mun, Authorities/ occupation certificate. ULC clearance/F.S.I. available and lease rent | Separate report input — no equivalent mobile field |
| smfg-rural-lap_19 | Name of the co-operative Housing Society Registration No. of Society No. of Shares held and certificate no. outgoes per Month | Separate report input — no equivalent mobile field |
| smfg-rural-lap_20 | East boundary — Document | Agent / case: boundaries document east |
| smfg-rural-lap_21 | West boundary — Document | Agent / case: boundaries document west |
| smfg-rural-lap_22 | North boundary — Document | Agent / case: boundaries document north |
| smfg-rural-lap_23 | South boundary — Document | Agent / case: boundaries document south |
| smfg-rural-lap_24 | East boundary — Site | Agent / case: boundaries physical east |
| smfg-rural-lap_25 | West boundary — Site | Agent / case: boundaries physical west |
| smfg-rural-lap_26 | North boundary — Site | Agent / case: boundaries physical north |
| smfg-rural-lap_27 | South boundary — Site | Agent / case: boundaries physical south |
| smfg-rural-lap_28 | Whether Property falls in the list published by M/C for Unauthorized Properties | Separate report input — no equivalent mobile field |
| smfg-rural-lap_29 | Property is easily identifiable | Separate report input — no equivalent mobile field |
| smfg-rural-lap_30 | Whether Property was identified on Our Own | Separate report input — no equivalent mobile field |
| smfg-rural-lap_31 | If No. Your representative was accompanied with Customer/Sales | Separate report input — no equivalent mobile field |
| smfg-rural-lap_32 | Property is Demarcated | Agent / case: demarcation available |
| smfg-rural-lap_33 | Geo Positioning of the Property (Longitude & Latitude) | Agent / case: latitude + longitude |
| smfg-rural-lap_34 | Separate Land Area | Separate report input — no equivalent mobile field |
| smfg-rural-lap_35 | Dedicated And Separate Access | Separate report input — no equivalent mobile field |
| smfg-rural-lap_36 | Year Of Construction | Separate report input — no equivalent mobile field |
| smfg-rural-lap_37 | Age Of The Property YEARS | Agent / case: age of property |
| smfg-rural-lap_38 | NOC Requirement From Owner Of Adjoining Property | Separate report input — no equivalent mobile field |
| smfg-rural-lap_39 | Requirement Of A Clear And Marketable Property Document With Dimensions Clearly Demarcated | Separate report input — no equivalent mobile field |
| smfg-rural-lap_40 | Electric Meter | Agent / case: meter number |
| smfg-rural-lap_41 | Valuation | Separate report input — no equivalent mobile field |
| smfg-rural-lap_42 | Type of construction | Agent / case: structure type |
| smfg-rural-lap_43 | If Under Construction(then mentioned The level of construction/slab) | Separate report input — no equivalent mobile field |
| smfg-rural-lap_44 | Stage of Construction | Agent / case: stage of construction |
| smfg-rural-lap_45 | Estimated date of Completion | Separate report input — no equivalent mobile field |
| smfg-rural-lap_46 | Permitted use of property | Separate report input — no equivalent mobile field |
| smfg-rural-lap_47 | Actual use of the property | Agent / case: property usage |
| smfg-rural-lap_48 | No. of floors for building and additional Structures | Agent / case: no of floors |
| smfg-rural-lap_49 | No. of lifts with capacity and type | Agent / case: lift |
| smfg-rural-lap_50 | Type of Underground, overhead tanks and pumps | Separate report input — no equivalent mobile field |
| smfg-rural-lap_51 | Flooring in open space/stilts and staircase | Separate report input — no equivalent mobile field |
| smfg-rural-lap_52 | No. of Floors | Agent / case: no of floors |
| smfg-rural-lap_53 | No. of flats on each floor | Separate report input — no equivalent mobile field |
| smfg-rural-lap_54 | Accommodations details | Separate report input — no equivalent mobile field |
| smfg-rural-lap_55 | Balconies to rooms separate or merged | Separate report input — no equivalent mobile field |
| smfg-rural-lap_56 | Type of flooring | Agent / case: flooring type |
| smfg-rural-lap_57 | Flooring in toilets/W.C/bath, dado | Separate report input — no equivalent mobile field |
| smfg-rural-lap_58 | Kitchen platform type and sink | Separate report input — no equivalent mobile field |
| smfg-rural-lap_59 | Toilets plumbing lines concealed/open type of plumbing and san. fittings, ceiling | Separate report input — no equivalent mobile field |
| smfg-rural-lap_60 | Electricals installation open or concealed wiring type of switches tel. points, TV/Cable points | Separate report input — no equivalent mobile field |
| smfg-rural-lap_61 | AS PER SETTLEMENT DEED PLOT AREA -SQ.YDS | Separate report input — no equivalent mobile field |
| smfg-rural-lap_62 | AS PER ACTUAL PLOT AREA -SQ.YDS | Separate report input — no equivalent mobile field |
| smfg-rural-lap_63 | Floor | Separate report input — no equivalent mobile field |
| smfg-rural-lap_64 | Land area as per sale agreement/legal report | Separate report input — no equivalent mobile field |
| smfg-rural-lap_65 | Risk of demolition(Valuer’s Views)(Low, Medium, High) | Separate report input — no equivalent mobile field |
| smfg-rural-lap_66 | In case the property has mixed use define the area being used for purpose | Separate report input — no equivalent mobile field |
| smfg-rural-lap_67 | Is the mixed use of the property permitted or is it unauthorized | Separate report input — no equivalent mobile field |
| smfg-rural-lap_68 | Present condition of property and structure | Agent / case: condition |
| smfg-rural-lap_69 | Market rates of land for similar properties in the vicinity and surroundings areas (as inquired from local estates agents) PER SQ.YDS | Separate report input — no equivalent mobile field |
| smfg-rural-lap_70 | Land Area SQ.YDS | Calculated from land area (sqyd) |
| smfg-rural-lap_71 | Rate Adopted for Valuation | Calculated from land rate (sqyd) |
| smfg-rural-lap_72 | Built up Area FF RCC | Separate report input — no equivalent mobile field |
| smfg-rural-lap_73 | Built up Area SS RCC | Separate report input — no equivalent mobile field |
| smfg-rural-lap_74 | Govt. Land Value | Separate report input — no equivalent mobile field |
| smfg-rural-lap_75 | Govt. Building Value GF RCC ROOF | Separate report input — no equivalent mobile field |
| smfg-rural-lap_76 | Total Govt. Value (Land + Building) | Separate report input — no equivalent mobile field |
| smfg-rural-lap_77 | Insurance Value | Separate report input — no equivalent mobile field |
| smfg-rural-lap_78 | Date: | Separate report input — no equivalent mobile field |
| smfg-rural-lap_79 | Property Currently Occupied By | Agent / case: occupancy details |
| remarks_and_violations | Inspection remarks | Agent / case: remarks and violations |
| smfg_gps_repeat | GPS coordinates (continued) | Separate report input — no equivalent mobile field |

## TYGER FINANCE

| Field | Label | Source |
| --- | --- | --- |
| tyger-finance_0 | BRANCH NAME | Agent / case: branch |
| tyger-finance_1 | APPLICANT NAME | Agent / case: applicant name |
| tyger-finance_2 | TRANSACTION TYPE | Separate report input — no equivalent mobile field |
| tyger-finance_3 | ADDRESS DETAILS ( AS PER SITE INSPECTION ) | Agent / case: property address |
| tyger-finance_4 | HOUSE/FLAT PLOT/PATTA NO. | Separate report input — no equivalent mobile field |
| tyger-finance_5 | FLOOR NO./KHATA NO. | Separate report input — no equivalent mobile field |
| tyger-finance_6 | BUILDING/WING NAME & NO. | Separate report input — no equivalent mobile field |
| tyger-finance_7 | STAGE/SECTOR/WARD NO. | Separate report input — no equivalent mobile field |
| tyger-finance_8 | STREET NAME & NO. | Separate report input — no equivalent mobile field |
| tyger-finance_9 | SURVEY NO/KHASRA NO. | Separate report input — no equivalent mobile field |
| tyger-finance_10 | VILLAGE NAME | Separate report input — no equivalent mobile field |
| tyger-finance_11 | CITY/TEHSIL/TOWN | Agent / case: city |
| tyger-finance_12 | PIN CODE | Agent / case: pincode |
| tyger-finance_13 | NEAREST AHFL BARNCH NAME | Separate report input — no equivalent mobile field |
| tyger-finance_14 | DISTANCE FROM NEAREST BRANCH | Agent / case: distance from branch |
| tyger-finance_15 | PROPERTY TYPE | Agent / case: property type |
| tyger-finance_16 | PERSON MET AT SITE | Agent / case: person met at site |
| tyger-finance_17 | RELENSHIP WITH APPLICANT/CUSTOMER | Agent / case: relationship with customer |
| tyger-finance_18 | CONTACT NUMBER | Agent / case: phone number |
| tyger-finance_19 | North boundary — Document | Agent / case: boundaries document north |
| tyger-finance_20 | East boundary — Site | Agent / case: boundaries physical east |
| tyger-finance_21 | APPROVAL AUTHORITY (NAME IF APPROVED) | Separate report input — no equivalent mobile field |
| tyger-finance_22 | APPROVAL AUTHORITY LIMIT | Separate report input — no equivalent mobile field |
| tyger-finance_23 | AGE OF PROPERTY | Agent / case: age of property |
| tyger-finance_24 | SELLER NAME | Separate report input — no equivalent mobile field |
| tyger-finance_25 | OCCUPANCY STATUS | Agent / case: occupancy details |
| tyger-finance_26 | OCCUPANT NAME | Separate report input — no equivalent mobile field |
| tyger-finance_27 | RESIDUAL AGE OF PROPERTY | Agent / case: residual life |
| tyger-finance_28 | PROPERTY/DWELLING UNIT TYPE | Agent / case: property type |
| tyger-finance_29 | APPROACH ROAD TO PROPERTY | Agent / case: site access |
| tyger-finance_30 | PROPERTY FINISHED/UNFINISHED | Separate report input — no equivalent mobile field |
| tyger-finance_31 | RISK OF DEMOLITIONIN CASE OF VIOLATION | Separate report input — no equivalent mobile field |
| tyger-finance_32 | PROPERTY FALLING IN CAUTION AREA | Separate report input — no equivalent mobile field |
| tyger-finance_33 | CLASS OF LOCALITY | Agent / case: class of locality |
| tyger-finance_34 | PROPERTY INTERIORS | Agent / case: interiors exteriors |
| tyger-finance_35 | PROPERTY EXTERIORS | Agent / case: interiors exteriors |
| tyger-finance_36 | DEVELOPMENT IN PARTICULAR COLONY/AREA | Agent / case: site developed |
| tyger-finance_37 | BASIC AMENITIES (ROAD,ELECTRICITY,DRAINAGE ) | Agent / case: basic amenities |
| tyger-finance_38 | NEAREST HIGHWAY/CONECTING ROAD | Separate report input — no equivalent mobile field |
| tyger-finance_39 | PROPERTY LENGTH | Separate report input — no equivalent mobile field |
| tyger-finance_40 | PROPERTY WIDTH | Separate report input — no equivalent mobile field |
| tyger-finance_41 | PROPERTY LATITUDE AND LONGITUDE. | Agent / case: latitude + longitude |
| tyger-finance_42 | PLOT AREA AS PER DOCUMENT/AS PER MEASUREMENT | Separate report input — no equivalent mobile field |
| tyger-finance_43 | LAND AREA/UDS AREA | Separate report input — no equivalent mobile field |
| tyger-finance_44 | PROPOSED/ESTIMATE BUILT-UP AREA BUA As per Site Visit | Separate report input — no equivalent mobile field |
| tyger-finance_45 | ON SITE VERIFICATION AREA | Separate report input — no equivalent mobile field |
| tyger-finance_46 | CONSTRUCTION/EXTENSION/IMPROVEMENT COST | Separate report input — no equivalent mobile field |
| tyger-finance_47 | EXISTING BUILT-UP AREA (Ground Floor) | Agent: ground floor measured plinth area (sq.fts) |
| tyger-finance_48 | CONSTRUCTION/EXTENSION/IMPROVEMENT COST | Separate report input — no equivalent mobile field |
| tyger-finance_49 | EXISTING BUILT-UP AREA (Frist Floor) | Agent: first floor measured plinth area (sq.fts) |
| tyger-finance_50 | PROPOSED/ESTIMATE BUILT-UP AREA | Separate report input — no equivalent mobile field |
| tyger-finance_51 | DLC RATE/GOVT. VALUE | Separate report input — no equivalent mobile field |
| tyger-finance_52 | LAND/PROPERTY | Separate report input — no equivalent mobile field |
| tyger-finance_53 | AREA/QUANTITY | Separate report input — no equivalent mobile field |
| tyger-finance_54 | NO. OF BASEMENT | Separate report input — no equivalent mobile field |
| tyger-finance_55 | NO. OF GROUND/PARKING/STILT FLOOR | Separate report input — no equivalent mobile field |
| tyger-finance_56 | NO. OF UPPER FLOOR | Separate report input — no equivalent mobile field |
| tyger-finance_57 | TOTAL NO. OF FLOOR | Agent / case: no of floors |
| tyger-finance_58 | DOCUMENT NAME | Separate report input — no equivalent mobile field |
| tyger-finance_59 | REF/APPROVAL NO. | Separate report input — no equivalent mobile field |
| tyger-finance_60 | REF/APPROVAL DATE | Separate report input — no equivalent mobile field |
| tyger-finance_61 | APPROVAL AUTHORITY NAME | Separate report input — no equivalent mobile field |
| tyger-finance_62 | LAYOUT PLAN | Separate report input — no equivalent mobile field |
| tyger-finance_63 | APPROVED FLOOR PLAN | Separate report input — no equivalent mobile field |
| tyger-finance_64 | CONSTRUCTION PERMISSION/BUILDING PERMISSION | Separate report input — no equivalent mobile field |
| tyger-finance_65 | Asst. No. 1138002013 | Separate report input — no equivalent mobile field |
| tyger-finance_66 | BUILDING COMPLETION | Separate report input — no equivalent mobile field |
| tyger-finance_67 | CONSTRUCTION/EXTENSION/IMPROVEMENT ESTIMATE FROM REGISTERED ENGINEER/ARCHITECH | Separate report input — no equivalent mobile field |
| tyger-finance_68 | SALES DEED DETAIL | Separate report input — no equivalent mobile field |
| tyger-finance_69 | REMARKS ON DOCUMENT VERIFIED | Separate report input — no equivalent mobile field |
| tyger-finance_70 | STRUCTURE TYPE | Agent / case: structure type |
| tyger-finance_71 | FOOTING/FOUNDATION TYPE | Separate report input — no equivalent mobile field |
| tyger-finance_72 | ROOF TYPE | Agent / case: roof |
| tyger-finance_73 | TYPE OF MASONARY | Separate report input — no equivalent mobile field |
| tyger-finance_74 | SOIL TYPE | Separate report input — no equivalent mobile field |
| tyger-finance_75 | ZONE AS PER CITY DEVELOPMENT PLAN | Separate report input — no equivalent mobile field |
| tyger-finance_76 | S. NO. | Separate report input — no equivalent mobile field |
| tyger-finance_77 | ALLOTED CONSTRUCTION STAGE IN % | Separate report input — no equivalent mobile field |
| tyger-finance_78 | PRESENT COMPLETION IN % | Agent / case: stage percentage |
| tyger-finance_79 | NO OF FLOOR COMPLETED | Separate report input — no equivalent mobile field |
| tyger-finance_80 | IS THE PROPERTY TECHNICALLY ACCEPTABLE | Separate report input — no equivalent mobile field |
| tyger-finance_81 | MARKETABILITY OF PROPERTY | Agent / case: marketability |
| tyger-finance_82 | S.NO. | Separate report input — no equivalent mobile field |
| tyger-finance_83 | SR. NO. | Separate report input — no equivalent mobile field |
| tyger-finance_84 | TYPE OF DEVIATION | Agent / case: deviation |
| tyger-finance_85 | TECHNICAL REPORT PREPARED BY | Separate report input — no equivalent mobile field |
| tyger-finance_86 | VIST DATE | Agent / case: visit date |
| tyger-finance_87 | METER BOARD | Agent / case: meter number |
| tyger-finance_site_b22 | North boundary — Site | Agent / case: boundaries physical north |
| tyger-finance_site_c21 | South boundary — Document | Agent / case: boundaries document south |
| tyger-finance_site_c22 | South boundary — Site | Agent / case: boundaries physical south |
| tyger-finance_site_d21 | East boundary — Document | Agent / case: boundaries document east |
| tyger-finance_site_e21 | West boundary — Document | Agent / case: boundaries document west |
| tyger-finance_site_e22 | West boundary — Site | Agent / case: boundaries physical west |

## UGROW

| Field | Label | Source |
| --- | --- | --- |
| ugrow_0 | Ref. No: | Agent / case: application number |
| ugrow_1 | Name of the Customer | Agent / case: applicant name |
| ugrow_2 | Registered owner same as the proposed Customer | Separate report input — no equivalent mobile field |
| ugrow_3 | Name of the Property holder | Agent / case: owner name |
| ugrow_4 | Property Address as per documents submitted Legal Address of Property (SURVEY_NO / GAT No./ Khasra No./ Khewat No/ Patta No, etc) | Agent / case: address docs |
| ugrow_5 | Property address as per site visit | Agent / case: property address |
| ugrow_6 | PIN Code | Agent / case: pincode |
| ugrow_7 | Date of inspection | Agent / case: visit date |
| ugrow_8 | Nature of Property (Land and Building / Vacant Land) | Agent / case: property type |
| ugrow_9 | Property Usage (Residential/Commercial/Mixed/Industrial/Vacant Land/Others) | Agent / case: property usage |
| ugrow_10 | Property Sub Type (Occupancy) (Selfoccupied/Tenanted/Vacant/Under- Construction ) | Agent / case: occupancy details |
| ugrow_11 | Developer/Builder name (if Apartment) | Separate report input — no equivalent mobile field |
| ugrow_12 | Flat/House/Plot no. | Separate report input — no equivalent mobile field |
| ugrow_13 | No. of Stories | Agent / case: no of floors |
| ugrow_14 | If Multi-Storied, Total No. of units | Agent / case: no of units |
| ugrow_15 | Unit Details | Separate report input — no equivalent mobile field |
| ugrow_16 | Name of the Occupant if rented | Separate report input — no equivalent mobile field |
| ugrow_17 | Property Leasehold/ Freehold | Agent / case: ownership type |
| ugrow_18 | Year of Construction of the Building | Separate report input — no equivalent mobile field |
| ugrow_19 | Age of the property (years) | Agent / case: age of property |
| ugrow_20 | Plot Demarcated | Agent / case: demarcation available |
| ugrow_21 | Property Identified through | Agent / case: property identified by |
| ugrow_22 | Approach Road width (ft) | Agent / case: approach road width |
| ugrow_23 | North boundary — Document | Agent / case: boundaries document north |
| ugrow_24 | East boundary — Document | Agent / case: boundaries document east |
| ugrow_25 | West boundary — Document | Agent / case: boundaries document west |
| ugrow_26 | South boundary — Document | Agent / case: boundaries document south |
| ugrow_27 | Location Vicinity (Developed, Developing, Undeveloped, Semi-Urban, Rural) | Agent / case: site developed |
| ugrow_28 | Landmark | Agent / case: landmark |
| ugrow_29 | a) Nearest Railway Station: | Separate report input — no equivalent mobile field |
| ugrow_30 | Condition of approach Road (Good/Fair/Poor/Kacha Sadak) | Separate report input — no equivalent mobile field |
| ugrow_31 | Mode of Transport to the Property | Separate report input — no equivalent mobile field |
| ugrow_32 | Type of Construction (RCC, Load Bearing, Steel Structure/Others) | Agent / case: structure type |
| ugrow_33 | Quality of Construction | Agent / case: quality of construction |
| ugrow_34 | No. of Flats in each Floor (If Apartment) | Separate report input — no equivalent mobile field |
| ugrow_35 | Common areas -Reception /Staircase /Overhead water tank/Sanitation/ Water Supply | Separate report input — no equivalent mobile field |
| ugrow_36 | Flooring & Finishing | Agent / case: flooring type |
| ugrow_37 | Flooring in toilets/ W.C./ bath, dado | Separate report input — no equivalent mobile field |
| ugrow_38 | Toilets plumbing lines concealed /open Type of plumbing and san. Fittings, any special fittings, ceiling | Separate report input — no equivalent mobile field |
| ugrow_39 | Electrical installation open or concealed wiring Type of switches tel. points,T.V./ cable points | Separate report input — no equivalent mobile field |
| ugrow_40 | Construction as per Approved/sanction plan | Separate report input — no equivalent mobile field |
| ugrow_41 | Details of Approved plan & plans with Approval no & Date | Separate report input — no equivalent mobile field |
| ugrow_42 | Construction Permission number & Date / Commencement Certificate | Separate report input — no equivalent mobile field |
| ugrow_43 | Ownership Documents | Agent / case: property documents verified |
| ugrow_44 | Deviations on the property (Percentage of Deviation to be captured as below- if Applicable) | Agent / case: deviation |
| ugrow_45 | Usage Violation | Separate report input — no equivalent mobile field |
| ugrow_46 | Land area as per Deed / UDS area as per deed | Separate report input — no equivalent mobile field |
| ugrow_47 | Land area as per actual | Separate report input — no equivalent mobile field |
| ugrow_48 | Land area adopted | Separate report input — no equivalent mobile field |
| ugrow_49 | Rate adopted for valuation | Separate report input — no equivalent mobile field |
| ugrow_50 | Built up Area / Super Built up Area as per actual (GF RCC) | Agent: ground floor measured plinth area (sq.fts) |
| ugrow_51 | Built up Area / Super Built up Area as per actual (FF RCC) | Agent: first floor measured plinth area (sq.fts) |
| ugrow_52 | Built up Area / Super Built up Area as per actual (SF RCC) | Agent: second floor measured plinth area (sq.fts) |
| ugrow_53 | Carpet area (approx.) | Separate report input — no equivalent mobile field |
| ugrow_54 | Construction cost adopted for valuation (G) | Separate report input — no equivalent mobile field |
| ugrow_55 | Fair market value of the property (in Words) | Separate report input — no equivalent mobile field |
| ugrow_56 | Circle rate (i.e.) Guide line rate for Land | Separate report input — no equivalent mobile field |
| ugrow_57 | Volatility of property prices (Good/Average/Poor) | Separate report input — no equivalent mobile field |
| ugrow_58 | 1. Details in case if property going for Re devlopment | Separate report input — no equivalent mobile field |
| ugrow_59 | 4. Adverse comments about the property if observed (like dispute with tenant, etc ) | Separate report input — no equivalent mobile field |
| ugrow_60 | Photo of the property | Separate report input — no equivalent mobile field |
| ugrow_61 | Occupant Name as per Society / Name Plate | Separate report input — no equivalent mobile field |
| ugrow_occupancy_repeat | Occupancy (continued) | Separate report input — no equivalent mobile field |
| ugrow_condition_repeat | Construction condition | Separate report input — no equivalent mobile field |
| ugrow_north_document | West boundary — Site | Agent / case: boundaries physical west |
| ugrow_south_document | South boundary — Site | Agent / case: boundaries physical south |
| remarks_and_violations | Inspection remarks | Agent / case: remarks and violations |
| ugrow_site_c38 | North boundary — Site | Agent / case: boundaries physical north |
| ugrow_site_c39 | East boundary — Site | Agent / case: boundaries physical east |

## UMMEED

| Field | Label | Source |
| --- | --- | --- |
| ummeed_0 | Date | Separate report input — no equivalent mobile field |
| ummeed_1 | Deal Number | Agent / case: application number |
| ummeed_2 | Type of Loan | Separate report input — no equivalent mobile field |
| ummeed_3 | Customer Name | Agent / case: applicant name |
| ummeed_4 | Property Owner | Agent / case: owner name |
| ummeed_5 | Provided Document Details | Agent / case: property documents verified |
| ummeed_6 | Property Address as per Site | Agent / case: property address |
| ummeed_7 | Legal Address | Agent / case: address docs |
| ummeed_8 | Landmark | Agent / case: landmark |
| ummeed_9 | Technical Visit Date | Agent / case: visit date |
| ummeed_10 | Occupancy | Agent / case: occupancy details |
| ummeed_11 | Demolition List Status | Separate report input — no equivalent mobile field |
| ummeed_12 | Marketability | Agent / case: marketability |
| ummeed_13 | Front Road Width | Agent / case: road width |
| ummeed_14 | Owner Contact | Separate report input — no equivalent mobile field |
| ummeed_15 | Tenant | Separate report input — no equivalent mobile field |
| ummeed_16 | Property Usage — Documents | Separate report input — no equivalent mobile field |
| ummeed_17 | Property Usage — Site | Agent / case: property usage |
| ummeed_18 | Ward / Municipal Land No. | Separate report input — no equivalent mobile field |
| ummeed_19 | Type of Locality | Agent / case: class of locality |
| ummeed_20 | Colony Occupancy | Separate report input — no equivalent mobile field |
| ummeed_21 | Property Type | Agent / case: property type |
| ummeed_22 | Distance from Branch | Agent / case: distance from branch |
| ummeed_23 | Site Access | Agent / case: site access |
| ummeed_24 | Approving Authority | Separate report input — no equivalent mobile field |
| ummeed_25 | Corporation Limit | Separate report input — no equivalent mobile field |
| ummeed_26 | Within Municipal Limit / DA | Agent / case: within municipal limits |
| ummeed_27 | Town Panchayat | Agent / case: panchayat name |
| ummeed_28 | Village Panchayat | Separate report input — no equivalent mobile field |
| ummeed_29 | Approach Road Condition | Separate report input — no equivalent mobile field |
| ummeed_30 | Road Width | Agent / case: road width |
| ummeed_31 | No. of Floors | Agent / case: no of floors |
| ummeed_32 | Floorwise Usage | Separate report input — no equivalent mobile field |
| ummeed_33 | Property Age | Agent / case: age of property |
| ummeed_34 | Residual Age | Agent / case: residual life |
| ummeed_35 | North Boundary — Document | Agent / case: boundaries document north |
| ummeed_36 | North Boundary — Site | Agent / case: boundaries physical north |
| ummeed_37 | North Boundary — Plan | Separate report input — no equivalent mobile field |
| ummeed_38 | South Boundary — Document | Agent / case: boundaries document south |
| ummeed_39 | South Boundary — Site | Agent / case: boundaries physical south |
| ummeed_40 | South Boundary — Plan | Separate report input — no equivalent mobile field |
| ummeed_41 | East Boundary — Document | Agent / case: boundaries document east |
| ummeed_42 | East Boundary — Site | Agent / case: boundaries physical east |
| ummeed_43 | East Boundary — Plan | Separate report input — no equivalent mobile field |
| ummeed_44 | West Boundary — Document | Agent / case: boundaries document west |
| ummeed_45 | West Boundary — Site | Agent / case: boundaries physical west |
| ummeed_46 | West Boundary — Plan | Separate report input — no equivalent mobile field |
| ummeed_47 | Boundary Matching | Agent / case: boundaries matching |
| ummeed_48 | Property Identified Through | Agent / case: property identified by |
| ummeed_49 | Dominated Area | Agent / case: community dominated |
| ummeed_50 | Domination % | Separate report input — no equivalent mobile field |
| ummeed_51 | Electricity Meter Matching | Agent / case: meter owner matching |
| ummeed_52 | Electricity Meter Number | Agent / case: meter number |
| ummeed_53 | Plot Demarcated | Agent / case: demarcation available |
| ummeed_54 | Sewage / Drainage | Agent / case: drainage |
| ummeed_55 | Water Supply | Agent / case: water supply |
| ummeed_56 | Structure Type | Agent / case: structure type |
| ummeed_57 | No. of Floors | Agent / case: no of floors |
| ummeed_58 | No. of Wings | Separate report input — no equivalent mobile field |
| ummeed_59 | Units per Floor | Separate report input — no equivalent mobile field |
| ummeed_60 | Quality of Construction | Agent / case: quality of construction |
| ummeed_61 | Structural Observations | Separate report input — no equivalent mobile field |
| ummeed_62 | Configuration | Separate report input — no equivalent mobile field |
| ummeed_63 | Flooring & Finishing | Agent / case: flooring type |
| ummeed_64 | Roofing & Terracing | Agent / case: roof |
| ummeed_65 | Fixtures & Fittings | Separate report input — no equivalent mobile field |
| ummeed_66 | Doors & Windows | Separate report input — no equivalent mobile field |
| ummeed_67 | Construction as per Plans | Separate report input — no equivalent mobile field |
| ummeed_68 | Plan Details with Date | Separate report input — no equivalent mobile field |
| ummeed_69 | Violations / Demolition Risk | Separate report input — no equivalent mobile field |
| ummeed_70 | Ground Floor — Permissible | Separate report input — no equivalent mobile field |
| ummeed_71 | Ground Floor — At Site | Agent: ground floor measured plinth area (sq.fts) |
| ummeed_72 | Ground Floor — Deviation | Separate report input — no equivalent mobile field |
| ummeed_73 | First Floor — Permissible | Separate report input — no equivalent mobile field |
| ummeed_74 | First Floor — At Site | Agent: first floor measured plinth area (sq.fts) |
| ummeed_75 | First Floor — Deviation | Separate report input — no equivalent mobile field |
| ummeed_76 | Second Floor — Permissible | Separate report input — no equivalent mobile field |
| ummeed_77 | Second Floor — At Site | Agent: second floor measured plinth area (sq.fts) |
| ummeed_78 | Second Floor — Deviation | Separate report input — no equivalent mobile field |
| ummeed_79 | Third Floor — Permissible | Separate report input — no equivalent mobile field |
| ummeed_80 | Third Floor — At Site | Agent: third floor measured plinth area (sq.fts) |
| ummeed_81 | Third Floor — Deviation | Separate report input — no equivalent mobile field |
| ummeed_82 | Total — Permissible | Separate report input — no equivalent mobile field |
| ummeed_83 | Total — At Site | Separate report input — no equivalent mobile field |
| ummeed_84 | Total — Deviation | Separate report input — no equivalent mobile field |
| ummeed_85 | Architect Certified Estimate | Separate report input — no equivalent mobile field |
| ummeed_86 | Certified Construction Amount | Separate report input — no equivalent mobile field |
| ummeed_87 | Other Self-construction Details | Separate report input — no equivalent mobile field |
| ummeed_88 | Valuation Methodology | Separate report input — no equivalent mobile field |
| ummeed_89 | Land Area | Calculated from land area (sqft) |
| ummeed_90 | Land Rate | Calculated from land rate (sqft) |
| ummeed_91 | Land Value | Calculated from land value |
| ummeed_92 | Carpet Area | Separate report input — no equivalent mobile field |
| ummeed_93 | Built-up Area | Calculated from bua (sqft) |
| ummeed_94 | Construction Cost / Sq.ft | Calculated from construction rate (sqft) |
| ummeed_95 | Composite Area | Separate report input — no equivalent mobile field |
| ummeed_96 | Composite Area Rate | Separate report input — no equivalent mobile field |
| ummeed_97 | Construction Value | Calculated from building value |
| ummeed_98 | Amenities Value | Separate report input — no equivalent mobile field |
| ummeed_99 | Depreciation Amount | Separate report input — no equivalent mobile field |
| ummeed_100 | Realizable Value | Separate report input — no equivalent mobile field |
| ummeed_101 | Distress Sale Value | Separate report input — no equivalent mobile field |
| ummeed_102 | Ground Floor — Usage | Separate report input — no equivalent mobile field |
| ummeed_103 | Ground Floor — Units | Separate report input — no equivalent mobile field |
| ummeed_104 | Ground Floor — Value | Separate report input — no equivalent mobile field |
| ummeed_105 | Ground Floor — Tenancy Year | Separate report input — no equivalent mobile field |
| ummeed_106 | Ground Floor — Rental Assessment | Separate report input — no equivalent mobile field |
| ummeed_107 | First Floor — Usage | Separate report input — no equivalent mobile field |
| ummeed_108 | First Floor — Units | Separate report input — no equivalent mobile field |
| ummeed_109 | First Floor — Value | Separate report input — no equivalent mobile field |
| ummeed_110 | First Floor — Tenancy Year | Separate report input — no equivalent mobile field |
| ummeed_111 | First Floor — Rental Assessment | Separate report input — no equivalent mobile field |
| ummeed_112 | Second Floor — Usage | Separate report input — no equivalent mobile field |
| ummeed_113 | Second Floor — Units | Separate report input — no equivalent mobile field |
| ummeed_114 | Second Floor — Value | Separate report input — no equivalent mobile field |
| ummeed_115 | Second Floor — Tenancy Year | Separate report input — no equivalent mobile field |
| ummeed_116 | Second Floor — Rental Assessment | Separate report input — no equivalent mobile field |
| ummeed_117 | Third Floor — Usage | Separate report input — no equivalent mobile field |
| ummeed_118 | Third Floor — Units | Separate report input — no equivalent mobile field |
| ummeed_119 | Third Floor — Value | Separate report input — no equivalent mobile field |
| ummeed_120 | Third Floor — Tenancy Year | Separate report input — no equivalent mobile field |
| ummeed_121 | Third Floor — Rental Assessment | Separate report input — no equivalent mobile field |
| ummeed_122 | Construction Progress % | Agent / case: stage percentage |
| ummeed_123 | Recommendation % | Agent / case: recommended percentage |
| ummeed_124 | Government Guideline Value | Separate report input — no equivalent mobile field |
| ummeed_125 | Demolition Risk | Separate report input — no equivalent mobile field |
| ummeed_126 | Latitude / Longitude | Agent / case: latitude + longitude |
| ummeed_127 | Seismic Zone | Separate report input — no equivalent mobile field |
| ummeed_128 | Cyclone Zone | Separate report input — no equivalent mobile field |
| ummeed_129 | Flood Area | Separate report input — no equivalent mobile field |
| ummeed_130 | Landslide Area | Separate report input — no equivalent mobile field |
| ummeed_131 | Portion of Property | Separate report input — no equivalent mobile field |
| ummeed_132 | Balcony | Separate report input — no equivalent mobile field |
| ummeed_133 | Toilet & Bath | Separate report input — no equivalent mobile field |
| ummeed_134 | Room | Separate report input — no equivalent mobile field |
| ummeed_135 | Kitchen | Separate report input — no equivalent mobile field |
| ummeed_136 | Staircase | Separate report input — no equivalent mobile field |
| ummeed_137 | Other | Separate report input — no equivalent mobile field |
| ummeed_138 | Deviation Remarks | Agent / case: deviation |
| ummeed_139 | Actual Height | Separate report input — no equivalent mobile field |
| ummeed_140 | Permissible Height | Separate report input — no equivalent mobile field |
| ummeed_141 | Observations | Separate report input — no equivalent mobile field |
| ummeed_142 | Negative Market Remarks | Separate report input — no equivalent mobile field |
| ummeed_143 | Comments / Remarks | Agent / case: remarks and violations |
| ummeed_144 | Declaration Date | Separate report input — no equivalent mobile field |
| ummeed_145 | Declaration Place | Separate report input — no equivalent mobile field |
| ummeed_146 | NATURE OF BUILDING/WING | Separate report input — no equivalent mobile field |
| ummeed_147 | PLAN ASPECT RATIO | Separate report input — no equivalent mobile field |
| ummeed_148 | STRUCTURE TYPE | Agent / case: structure type |
| ummeed_149 | SHAPE OF BUILDING | Separate report input — no equivalent mobile field |
| ummeed_150 | TYPE OF MASONARY | Separate report input — no equivalent mobile field |
| ummeed_151 | EXPANSION JOINT AVAILABLE | Separate report input — no equivalent mobile field |
| ummeed_152 | PROJECTED PARTS AVAILABLE | Separate report input — no equivalent mobile field |
| ummeed_153 | STRUCTURAL SYSTEM | Separate report input — no equivalent mobile field |
| ummeed_154 | MORTAR TYPE | Separate report input — no equivalent mobile field |
| ummeed_155 | ROOF TYPE | Agent / case: roof |
| ummeed_156 | STEEL GRADE | Separate report input — no equivalent mobile field |
| ummeed_157 | FOOTING TYPE | Separate report input — no equivalent mobile field |
| ummeed_158 | CONCRETE GRADE | Separate report input — no equivalent mobile field |
| ummeed_159 | CYCLONE ZONE- WIND SPEED (M/S) | Separate report input — no equivalent mobile field |
| ummeed_160 | COSTAL REGULATORY ZONE | Separate report input — no equivalent mobile field |
| ummeed_161 | SEISMIC ZONE | Separate report input — no equivalent mobile field |
| ummeed_162 | ENVIRONMENT EXPOSURE CONDITION | Separate report input — no equivalent mobile field |
| ummeed_163 | SOIL TYPE | Separate report input — no equivalent mobile field |
| ummeed_164 | SOIL STRATA | Separate report input — no equivalent mobile field |
| ummeed_165 | SOIL LIQUEFIABLE | Separate report input — no equivalent mobile field |
| ummeed_166 | GROUND SLOPE MORE THAN 20% | Separate report input — no equivalent mobile field |
| ummeed_167 | SOIL SLOPE VULNERABLE TO LANDSLIDE | Separate report input — no equivalent mobile field |
| ummeed_168 | FLOOD PRONE AREA | Separate report input — no equivalent mobile field |
| ummeed_169 | FIRE EXIT | Separate report input — no equivalent mobile field |
| ummeed_170 | Secondary Portion of Property | Separate report input — no equivalent mobile field |
| ummeed_171 | Secondary Balcony | Separate report input — no equivalent mobile field |
| ummeed_172 | Secondary Toilet & Bath | Separate report input — no equivalent mobile field |
| ummeed_173 | Secondary Room | Separate report input — no equivalent mobile field |
| ummeed_174 | Secondary Kitchen | Separate report input — no equivalent mobile field |
| ummeed_175 | Secondary Staircase | Separate report input — no equivalent mobile field |
| ummeed_176 | Secondary Other | Separate report input — no equivalent mobile field |
| ummeed_177 | Secondary Remarks | Separate report input — no equivalent mobile field |
| ummeed_178 | Secondary Actual Height | Separate report input — no equivalent mobile field |
| ummeed_179 | Secondary Permissible Height | Separate report input — no equivalent mobile field |
| ummeed_180 | Secondary Observations | Separate report input — no equivalent mobile field |
| ummeed_181 | Secondary Negative Remarks | Separate report input — no equivalent mobile field |
| ummeed_182 | Valuer Name | Separate report input — no equivalent mobile field |
| ummeed_183 | Final Date | Separate report input — no equivalent mobile field |
| ummeed_184 | Final Place | Separate report input — no equivalent mobile field |

## KreditBee

| Field | Label | Source |
| --- | --- | --- |
| kreditbee_e11 | Type of property | Agent / case: property type |
| kreditbee_j11 | Current usage | Agent / case: property usage |
| kreditbee_f24 | Plan boundary — West | Separate report input — no equivalent mobile field |
| kreditbee_h24 | Plan boundary — North | Separate report input — no equivalent mobile field |
| kreditbee_j24 | Plan boundary — South | Separate report input — no equivalent mobile field |
| kreditbee_d26 | Boundaries matching | Agent / case: boundaries matching |
| kreditbee_d29 | Property demarcated | Agent / case: demarcation available |
| kreditbee_i32 | Location type | Separate report input — no equivalent mobile field |
| kreditbee_i55 | Unit configuration | Separate report input — no equivalent mobile field |
| kreditbee_i61 | Unit located on floor | Separate report input — no equivalent mobile field |
| kreditbee_i62 | Units on present floor | Separate report input — no equivalent mobile field |
| kreditbee_i71 | Building plan approved by | Separate report input — no equivalent mobile field |
| kreditbee_i72 | Building approval number and date | Separate report input — no equivalent mobile field |
| kreditbee_j88 | Type of structure | Agent / case: structure type |
| kreditbee_f99 | Building area (sq ft) | Calculated from bua (sqft) |
| kreditbee_h99 | Building rate per sq ft | Calculated from construction rate (sqft) |
| kreditbee_h100 | Depreciation rate | Separate report input — no equivalent mobile field |
| kreditbee_j100 | Building value after depreciation | Separate report input — no equivalent mobile field |
| kreditbee_h101 | Saleable rate | Separate report input — no equivalent mobile field |
| kreditbee_j101 | Saleable value | Separate report input — no equivalent mobile field |
| kreditbee_d78 | Basement floor — Sanctioned area (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_f78 | Basement floor — Actual area (sq ft) | Agent: basement floor measured plinth area (sq.fts) |
| kreditbee_h78 | Basement floor — Final area considered (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_d79 | Stilt floor — Sanctioned area (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_f79 | Stilt floor — Actual area (sq ft) | Agent: stilt floor measured plinth area (sq.fts) |
| kreditbee_h79 | Stilt floor — Final area considered (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_d80 | Ground floor — Sanctioned area (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_f80 | Ground floor — Actual area (sq ft) | Agent: ground floor measured plinth area (sq.fts) |
| kreditbee_h80 | Ground floor — Final area considered (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_d81 | First floor — Sanctioned area (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_f81 | First floor — Actual area (sq ft) | Agent: first floor measured plinth area (sq.fts) |
| kreditbee_h81 | First floor — Final area considered (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_d82 | Second floor — Sanctioned area (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_f82 | Second floor — Actual area (sq ft) | Agent: second floor measured plinth area (sq.fts) |
| kreditbee_h82 | Second floor — Final area considered (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_d83 | Third floor — Sanctioned area (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_f83 | Third floor — Actual area (sq ft) | Agent: third floor measured plinth area (sq.fts) |
| kreditbee_h83 | Third floor — Final area considered (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_d84 | Fourth floor — Sanctioned area (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_f84 | Fourth floor — Actual area (sq ft) | Agent: fourth floor measured plinth area (sq.fts) |
| kreditbee_h84 | Fourth floor — Final area considered (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_d85 | Fifth floor — Sanctioned area (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_f85 | Fifth floor — Actual area (sq ft) | Agent: fifth floor measured plinth area (sq.fts) |
| kreditbee_h85 | Fifth floor — Final area considered (sq ft) | Separate report input — no equivalent mobile field |
| kreditbee_0 | Branch Name | Agent / case: branch |
| kreditbee_1 | Report Date : | Separate report input — no equivalent mobile field |
| kreditbee_2 | Visit Date | Agent / case: visit date |
| kreditbee_3 | Agency Name | Separate report input — no equivalent mobile field |
| kreditbee_4 | Type of Case/ Transaction | Separate report input — no equivalent mobile field |
| kreditbee_5 | Type of Case/ Transaction | Separate report input — no equivalent mobile field |
| kreditbee_6 | Name of Valuer visited & contact  no. | Separate report input — no equivalent mobile field |
| kreditbee_7 | Distance from the Branch | Agent / case: distance from branch |
| kreditbee_8 | Contact person name & Nmber | Agent / case: person met at site |
| kreditbee_9 | Applicant/s Name/s / Owner Name | Agent / case: applicant name |
| kreditbee_10 | Address as per Title document | Agent / case: address docs |
| kreditbee_11 | Address as per Site | Agent / case: property address |
| kreditbee_12 | Landmark | Agent / case: landmark |
| kreditbee_13 | Main Locality of the
Property: | Separate report input — no equivalent mobile field |
| kreditbee_14 | City | Agent / case: city |
| kreditbee_15 | State | Agent / case: state |
| kreditbee_16 | Pincode | Agent / case: pincode |
| kreditbee_17 | Latitude & Longitude | Agent / case: latitude + longitude |
| kreditbee_18 | Address Matching | Separate report input — no equivalent mobile field |
| kreditbee_19 | As per deed | Agent / case: boundaries document east |
| kreditbee_20 | As per deed | Agent / case: boundaries document west |
| kreditbee_21 | As per deed | Agent / case: boundaries document north |
| kreditbee_22 | As per deed | Agent / case: boundaries document south |
| kreditbee_23 | At site | Agent / case: boundaries physical east |
| kreditbee_24 | At site | Agent / case: boundaries physical west |
| kreditbee_25 | At site | Agent / case: boundaries physical north |
| kreditbee_26 | At site | Agent / case: boundaries physical south |
| kreditbee_27 | Property Identified | Separate report input — no equivalent mobile field |
| kreditbee_28 | Property Identified through | Agent / case: property identified by |
| kreditbee_29 | Site is | Agent / case: site developed |
| kreditbee_30 | Proximity to civic
amenities/public
transport (kms) | Agent / case: proximity amenities |
| kreditbee_31 | Railway Station (kms) | Agent / case: dist railway |
| kreditbee_32 | Bus Stop (kms) | Agent / case: dist bus |
| kreditbee_33 | Type of road | Separate report input — no equivalent mobile field |
| kreditbee_34 | Width  of road | Agent / case: approach road width |
| kreditbee_35 | Vacant/Occupied | Agent / case: occupancy details |
| kreditbee_36 | Land/Plot Area as site | Separate report input — no equivalent mobile field |
| kreditbee_37 | Land/Plot Area as per title documents | Separate report input — no equivalent mobile field |
| kreditbee_38 | Type of plot | Separate report input — no equivalent mobile field |
| kreditbee_39 | Age of Building | Agent / case: age of property |
| kreditbee_40 | Residual life of Building | Agent / case: residual life |
| kreditbee_41 | Layout/ Land | Separate report input — no equivalent mobile field |
| kreditbee_42 | property Coming under which limits | Separate report input — no equivalent mobile field |
| kreditbee_43 | Whether property under
demolition list as per authority
(Y/N) | Separate report input — no equivalent mobile field |
| kreditbee_44 | Nature of Building/Wing/ Tower | Separate report input — no equivalent mobile field |
| kreditbee_45 | Function of Use | Separate report input — no equivalent mobile field |
| kreditbee_46 | Horizontal floor type | Separate report input — no equivalent mobile field |
| kreditbee_47 | Concrete Grade | Separate report input — no equivalent mobile field |
| kreditbee_48 | Steel Grade | Separate report input — no equivalent mobile field |
| kreditbee_49 | Land area (sq ft) | Calculated from land area (sqft) |
| kreditbee_50 | Land rate per sq ft | Calculated from land rate (sqft) |
| kreditbee_51 | Total Amenities Charges (Amenities + Fixed Interiors) | Separate report input — no equivalent mobile field |
| kreditbee_52 | Stage of construction (Descriptive) | Agent / case: stage of construction |
| kreditbee_53 | Guideline Value of The Property | Separate report input — no equivalent mobile field |
| kreditbee_54 | House Delivery Agency | Separate report input — no equivalent mobile field |
| kreditbee_55 | Scope of valuation | Separate report input — no equivalent mobile field |
| kreditbee_56 | Relationship with applicant | Agent / case: relationship with customer |
| kreditbee_57 | Usage approved as per
 Plan | Separate report input — no equivalent mobile field |
| kreditbee_58 | Usage as per CDP/Master plan | Separate report input — no equivalent mobile field |
| kreditbee_59 | Address as per Plan | Separate report input — no equivalent mobile field |
| kreditbee_60 | Plan boundary — East | Separate report input — no equivalent mobile field |
| kreditbee_61 | Remarks If any | Separate report input — no equivalent mobile field |
| kreditbee_62 | Class of Locality | Agent / case: class of locality |
| kreditbee_63 | Distance from drain/ waterbody/ railway land/ high-tension wire/ Center of road (in case of NH/SH) | Separate report input — no equivalent mobile field |
| kreditbee_64 | Negative / adverse issues in Property and/or locality (if any) | Separate report input — no equivalent mobile field |
| kreditbee_65 | If Vacant, Since how long | Separate report input — no equivalent mobile field |
| kreditbee_66 | Reason for being vacant as per local enquiry | Separate report input — no equivalent mobile field |
| kreditbee_67 | Land/Plot Area as per plan | Separate report input — no equivalent mobile field |
| kreditbee_68 | Final Land area / UDS considered for valuation | Separate report input — no equivalent mobile field |
| kreditbee_69 | No of Blocks/Wings | Separate report input — no equivalent mobile field |
| kreditbee_70 | No. of floors (if plan available) / Height / FSI Norm (in absence of plan) | Separate report input — no equivalent mobile field |
| kreditbee_71 | Total No. of units floorwise | Separate report input — no equivalent mobile field |
| kreditbee_72 | No. Of lifts | Separate report input — no equivalent mobile field |
| kreditbee_73 | Amenities Available (e.g.
Swimming Pool, Club House, Borewell, Jacuzzi
etc.) | Separate report input — no equivalent mobile field |
| kreditbee_74 | Details on interiors | Agent / case: interiors exteriors |
| kreditbee_75 | No. of rooms | Separate report input — no equivalent mobile field |
| kreditbee_76 | Measured Area | Separate report input — no equivalent mobile field |
| kreditbee_77 | Document Area as per title deed | Separate report input — no equivalent mobile field |
| kreditbee_78 | Approved Area as per plan | Separate report input — no equivalent mobile field |
| kreditbee_79 | Final Area considered for valuation | Separate report input — no equivalent mobile field |
| kreditbee_80 | Exteriors | Agent / case: interiors exteriors |
| kreditbee_81 | Interiors | Agent / case: interiors exteriors |
| kreditbee_82 | Plan approved by | Separate report input — no equivalent mobile field |
| kreditbee_83 | Number and Date | Separate report input — no equivalent mobile field |
| kreditbee_84 | Any developments like road widening / Govt takeover as per master plan/ local enquiry. | Separate report input — no equivalent mobile field |
| kreditbee_85 | Height of Building above ground level | Separate report input — no equivalent mobile field |
| kreditbee_86 | Building Value after depreciation | Separate report input — no equivalent mobile field |
| kreditbee_87 | Saleable Value | Separate report input — no equivalent mobile field |
| kreditbee_88 | No of Car Parking | Separate report input — no equivalent mobile field |
| kreditbee_89 | Rate per Parking | Separate report input — no equivalent mobile field |
| kreditbee_90 | Value of Car Parking | Separate report input — no equivalent mobile field |
| kreditbee_91 | Approx. Rentals in case of 100% complete property | Agent / case: rental per month |
| kreditbee_92 | Documents / title details | Agent / case: property documents verified |
| kreditbee_93 | Remarks | Agent / case: remarks and violations |
