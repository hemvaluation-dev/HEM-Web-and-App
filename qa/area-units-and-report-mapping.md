# Area units and report mapping

Implemented on 11 October 2026.

- Data Review and report forms share measurements and valuation controls.
- Four side measurements remain in feet. Calculated area is average east/west multiplied by average north/south. This is an estimate for irregular plots, not a substitute for a surveyed polygon area.
- Land, build-up and slab have independent area and rate units: sq.fts, sq.yards and sq.mtr. Rates are INR per selected unit. Changing units converts the existing value instead of changing the valuation.
- Each component has an independently calculated amount and an inclusion checkbox for the total. Land and building default to included; slab defaults to excluded to avoid double counting.
- Old records without units retain the existing convention: areas and land rates in square yards; construction rates per square foot.
- Incomplete measurements produce blank calculated areas and amounts. Zero is preserved. A partially entered set of dimensions never produces an invented complete area.
- Shared mappings populate report fields from current agent data, explicit per-lender field bindings. Documentary/approved areas are not assumed to equal physical measurements.
- Fixed-unit lender fields receive converted areas and rates. Every DOCX/XLSX report includes an additional measurement summary page/sheet; the generic PDF includes a measurement summary page. These show all three areas, units, rates, amounts and the selected total components even when the lender form has no matching field.
- The report API recalculates values and saves both mapped fields and the calculation inputs in the report snapshot. Review saves persist units and calculations in existing extracted_data JSON; no database migration or old-record rewrite is needed.
- Report form edits affect that generated report. Save Data Review to update the underlying case data.

Validation: 44 portal tests, including all 14 lender file generators; TypeScript; production build with standalone PDF render check; 6 Flutter tests. Flutter analysis has existing informational notices, no errors or warnings. Repository lint check still flags existing findings in export-media, MultiSelectFilter, and workflows.test.cjs. Authenticated browser testing was not performed because no signed-in portal tab was available.

Per-lender follow-up: see [the complete mapping audit](lender-field-mapping.md). Corrected UGRO, JM, Niwas, Tyger, Axis and SMFG boundary labels/positions; matched actual floor areas by floor name; kept approved/adopted values separate; corrected JM square-metre area and feet-to-metres road width, and SMFG Rural adopted-rate mapping. The report form explains each field’s source. Regression checks inspect mapped values in generated lender cells across all 14 templates. TypeScript, all 44 portal tests and the production build pass. No live database data was changed.
