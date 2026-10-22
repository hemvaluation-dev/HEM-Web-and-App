# KreditBee and Veritas template alignment

The supplied blank and filled files were compared with the installed report assets. Veritas uses the same 121-row primary table; KreditBee uses the Individual worksheet. Existing photo-capable assets are retained, with the blank Veritas disclaimer restored during generation. Customer reference files are not copied into test fixtures.

The original Supabase project had KREDITBEE linked to `kreditbee_template`, VERITAS-HL to `veritas_hl_template`, and VERITAS-EEL to `veritas_eel_template`. On 2026-10-10, only those three template_name values were changed to `kreditbee` or `veritas` and read back successfully. Institution IDs, names, cases and existing reports were preserved. No schema change was needed.

Portal settings, new institution creation, report selection and report APIs now use the same resolver. Existing spaced names, capitalized names and legacy suffixes are supported. Mobile Veritas requirements recognize HL and EEL aliases. KreditBee uses the shared mobile inspection fields; explicit source mappings populate identity and directional boundaries, while valuation areas/rates require review to avoid guessing units.

KreditBee adds 44 editable cells, including all three area columns for eight floors, plan boundaries, building approval details and valuation inputs. Existing field IDs are retained. Derived workbook totals remain formulas. Numeric inputs replace shared-string placeholders correctly. Empty photo slots render white.

Validation commands:

```sh
cd hem_portal
npm test
npm run typecheck
npm run build
# Provide fixtures/synthetic-property.png under QA_OUTPUT first.
QA_OUTPUT=/tmp/hem-template-qa node ../qa/template-audit.cjs
cd ../HEM_Agent
flutter test test/workflow_test.dart
```

Use the existing KREDITBEE, VERITAS-HL or VERITAS-EEL institution when creating a case. The case report page offers XLSX for KreditBee and DOCX for Veritas. Rebuild/restart production portal processes and rebuild the mobile app to load code changes.
