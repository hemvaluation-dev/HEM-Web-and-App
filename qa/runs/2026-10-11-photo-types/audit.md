# Photo types and report placeholders

Completed 12 October 2026. Sources: the supplied filled lender reports in Downloads/SOFTWARE FORMATS 2, KREDITBEE and VERITAS, compared with all 14 checked-in templates.

## Application changes

- Mobile and portal share 27 photo categories, including general screenshots, maps, route sketches, satellite views, cadastral/BhuNaksha maps, government rates, prohibited-property searches, electricity-bill screenshots, property-tax screenshots, approved plans/layouts and document screenshots.
- Report selection matches saved photos by type, reserves specialized placeholders first and never reuses a photo automatically. General screenshots require the user to select their intended slot. Users can select any saved case photo or upload a replacement.
- 200 individually selectable photo slots, including 72 full-width screenshot slots. Blank slots remain blank; the supplied sample images are not reused in generated reports.
- Full-width frames respect the report's printable width and preserve the existing screenshot height. Images are fitted inside frames with white padding. A portrait screenshot may therefore have space at its sides.
- Spreadsheet photo sections were reflowed; manual page breaks keep caption/image groups together. ICICI's hidden columns and fixed image sizes required measured frames; a reused image asset was split into independently selectable slots.
- PNG screenshots below the upload limit retain their original bytes and correct MIME type. Larger images are resized below 5 MB off the UI thread. Gallery screenshots are no longer initially downscaled to 1920 px.
- The generic PDF layout also gives Others screenshot categories full-width frames.
- Supabase's existing photo_type text column supports these values. No schema change or existing-data deletion was performed.

## Verification

- Portal: 57 tests pass after the live missing-location fix, TypeScript passes, lint regression gate passes; production build, standalone PDF rendering and live unauthenticated production smoke tests pass. Existing lint debt remains (178 errors/35 warnings in the baseline).
- Mobile: 46 tests pass, including PNG preservation, invalid-image handling, size limits and the picker at 360 px in both themes. Android debug APK builds. Analyzer: 115 existing informational findings, no errors or warnings.
- All 14 templates generate successfully with synthetic fields/photos, with no field mismatches or flagged retained sample values in blank-output checks. JSON evidence: generated/template-results.json.
- All 14 generated report formats rendered through the bundled LibreOffice converter. Evidence-page previews were inspected; image bounds and overlaps pass in render-checks.json (reviewed full-page letterhead backgrounds excluded). Native Microsoft Office pagination can vary with installed fonts/printer settings.
- Authenticated QA on 12 October: created QA-PHOTO-20261012-VERITAS (5d2508c9-a603-4d87-8069-9ba846720f99), assigned the existing test agent, uploaded the synthetic fixture as Others - Satellite View, and confirmed persistence after reload. No existing customer case was modified.
- Saved a deliberately incomplete dossier through Data review. 30 × 40 foot land dimensions calculated 133.333333 sq.yards and ₹1,200,000 at ₹9,000/sq.yard. Saving moved the case from Assigned to Inspection.
- Live QA exposed a null-location crash in report field mapping before GPS capture. Fixed the shared mapper and added regression coverage for all 14 templates, preserving case fallbacks and blank location fields.
- Confirmed that only the Satellite view slot automatically selected the saved satellite image; other 16 Veritas slots remained blank. Generated Veritas DOCX with incomplete data/no GPS. Saved report c34dd571-6f0f-42a5-b1a3-de8f45233bc7 appeared in report history; case remained Inspection. Proof: live-saved-report.png.
- Browser download capture timed out, so the live persisted report's bytes were not inspected. Offline render coverage above remains valid. End-to-end mobile device upload was not repeated during this signed-in portal check.

## Per-template coverage

| Template | Photo slots | Full-width screenshot slots | Screenshot/document placeholders |
|---|---:|---:|---|
| Veritas | 17 | 5 | Government rate, prohibited property, cadastral/BhuNaksha, map/route sketch, satellite |
| ADITYA BIRLA LAP | 11 | 5 | Map Screenshot, Satellite View, Prohibited Property Screenshot, Government Rate Screenshot, Approved Plan / Layout |
| AXIS FINANCE | 14 | 3 | Satellite View, Map Screenshot, Electricity Bill Screenshot |
| CHOLA SME | 15 | 5 | Map Screenshot, Satellite View, Cadastral / BhuNaksha Map, Government Rate Screenshot, Prohibited Property Screenshot |
| EQUITAS | 16 | 4 | Satellite View, Map Screenshot, Government Rate Screenshot, Prohibited Property Screenshot |
| ICICI | 5 | 1 | Satellite View |
| JM FINANCE | 17 | 6 | Satellite View, Map Screenshot, Prohibited Property Screenshot, Government Rate Screenshot, Electricity Bill Screenshot, Cadastral / BhuNaksha Map |
| NIWAS FINANCE | 15 | 6 | Map Screenshot, Satellite View, Government Rate Screenshot, Prohibited Property Screenshot, Electricity Bill Screenshot, Property Tax Screenshot |
| SMFG LAP | 14 | 6 | Cadastral / BhuNaksha Map, Map Screenshot, Satellite View, Government Rate Screenshot, Prohibited Property Screenshot, Electricity Bill Screenshot |
| SMFG RURAL LAP | 14 | 6 | Satellite View, Map Screenshot, Cadastral / BhuNaksha Map, Government Rate Screenshot, Prohibited Property Screenshot, Electricity Bill Screenshot |
| TYGER FINANCE | 18 | 7 | Electricity Bill Screenshot, Satellite View, Map Screenshot, Cadastral / BhuNaksha Map, Government Rate Screenshot, Prohibited Property Screenshot, Electricity Bill Screenshot |
| UGROW | 16 | 7 | Satellite View, Map Screenshot, Cadastral / BhuNaksha Map, Property Tax Screenshot, Electricity Bill Screenshot, Prohibited Property Screenshot, Government Rate Screenshot |
| UMMEED | 15 | 6 | Satellite View, Map Screenshot, Prohibited Property Screenshot, Government Rate Screenshot, Cadastral / BhuNaksha Map, Electricity Bill Screenshot |
| KreditBee | 13 | 5 | Property Tax Screenshot, Satellite View, Cadastral / BhuNaksha Map, Government Rate Screenshot, Prohibited Property Screenshot |

## Duplicate field cleanup — 12 October

- Removed repeated mobile inputs for south physical boundary, document address, railway/bus/city distances and approach road width. Existing keys and stored values are unchanged.
- Calculated template values now appear in an expandable read-only summary instead of duplicate input boxes. They remain in generated reports. Lender-specific document/approved/proposed areas remain editable and separate.
- Clarified calculated area/value labels, individual-floor units, and independently stored legacy entries. No database migration or data deletion.
- Fixed round-trip area display drift by mapping complete foot dimensions directly into lender units.
- Mobile review tests: 29 passed; updated debug APK built. Portal verification/build logs: duplicate-fields-checks.log and duplicate-fields-build.log.
