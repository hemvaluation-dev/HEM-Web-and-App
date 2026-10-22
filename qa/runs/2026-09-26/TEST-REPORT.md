# HEM Portal and HEM Agent QA report

Run date: 26 September 2026

Scope: authenticated website and Android HEM Agent workflows, using synthetic QA records only. Every generated test case uses the `QA-20260926-` prefix. The property image and document are conspicuously marked synthetic and must not be used for lending or valuation decisions.

## Test data and evidence

- 14 lender templates were exercised: 6 DOCX and 8 XLSX.
- 14 QA cases were created and assigned to the existing field-agent test account.
- Veritas, Aditya Birla LAP, and Axis were created through the portal case-management form. The remaining 11 were created by the scoped QA fixture loader so the full template matrix could be exercised without repeating slow UI entry.
- 135 synthetic property-photo attachments were uploaded (the template photo count for each case).
- Synthetic field data, coordinates, and a synthetic document were loaded into the QA records.
- Case IDs, storage paths, fixtures, generated files, and raw logs are in this run folder.

## Results

| Area | Result | Evidence |
|---|---|---|
| Portal typecheck | PASS | `hem_portal npm run verify` |
| Portal automated tests | 22 PASS | `hem_portal/tests/*.test.cjs` |
| Portal lint gate | PASS with baseline debt | 216 existing errors and 45 warnings are reported by the repository's lint gate |
| Android debug build | PASS | `HEM_Agent/build/app/outputs/flutter-apk/app-debug.apk` |
| Android static analysis | PASS with info debt | No analyzer errors or warnings; 110 informational findings remain, so the analyzer exit code is non-zero |
| Authenticated mobile integration checks | 69 PASS, 15 recorded review items | `evidence/mobile-results.json` and `evidence/mobile-run.log` |
| All 14 template report requests | PASS | Each authenticated request returned a non-empty ZIP-based DOCX/XLSX artifact |
| Word visual rendering | PASS for renderability | 8-page Veritas render and other DOCX renders completed |
| Excel visual rendering | PASS for renderability | Representative Calc renders completed for all generated XLSX files |
| Local HTTP smoke rerun | BLOCKED | The dev server on port 3000 was no longer running when the final curl/smoke rerun was attempted; this is an environment availability result, not a product pass |

## Template coverage

| Template | Case reference | Output | Audit |
|---|---|---|---|
| Veritas | QA-20260926-VERITAS | DOCX | REVIEW: 98 field assertions differ; visual output retains old template values in several mapped fields |
| Aditya Birla LAP | QA-20260926-ADITYA | DOCX | REVIEW: 9 field assertions differ |
| Axis Finance | QA-20260926-AXIS | XLSX | PASS |
| Chola SME | QA-20260926-CHOLA | DOCX | REVIEW: 4 field assertions differ |
| Equitas | QA-20260926-EQUITAS | DOCX | REVIEW: 34 field assertions differ |
| ICICI | QA-20260926-ICICI | XLSX | PASS |
| JM Finance | QA-20260926-JM | XLSX | REVIEW: 1 field assertion differs; 7 sample values remain in the blank-template output |
| Niwas Finance | QA-20260926-NIWAS | XLSX | REVIEW: 3 sample values remain in the blank-template output |
| SMFG LAP | QA-20260926-SMFG | DOCX | REVIEW: 2 field assertions differ |
| SMFG Rural LAP | QA-20260926-SMFG-RURAL | XLSX | REVIEW: 1 field assertion differs; 1 sample value remains |
| Tyger Finance | QA-20260926-TYGER | XLSX | REVIEW: 1 sample value remains |
| UGRO | QA-20260926-UGROW | XLSX | REVIEW: 1 field assertion differs; 8 sample values remain |
| Ummeed | QA-20260926-UMMEED | DOCX | REVIEW: 1 field assertion differs |
| KreditBee | QA-20260926-KREDITBEE | XLSX | PASS |

The audit is intentionally conservative. A REVIEW means the generated artifact exists but one or more mapped cells, calculated fields, or blank-template protections need human confirmation. It is not counted as a clean production pass.

## Mobile workflow coverage

The signed-in field-agent session completed the following checks:

- App startup and authenticated case-list access.
- Search API access with bearer authentication.
- Invalid pagination rejection and unauthenticated API rejection.
- All 14 QA cases loaded their field data and photos.
- Synthetic photo upload through the authenticated client.
- Data review screen for every QA case.
- Authenticated report generation for every template.
- Location, documents, photos, and media screens rendered.
- One review draft edit persisted as `data_drafted`.
- Profile and leave-management screens rendered.

The 14 recorded “mobile details” failures are harness assertions: the case detail screen loaded and all subsequent workflow checks passed, but the assertion required the application reference to appear in a specific text node. This should be tightened in the test harness before treating those checks as product failures. The export-users probe returned 404 because that route does not exist; it is excluded from the product verdict.

## Release blockers found

1. Anonymous database access can read all 14 QA cases through the Supabase client. The direct anonymous query returned 14 rows. Review and tighten RLS policies before production.
2. The Veritas DOCX generator does not reliably replace all mapped cells. The rendered first page shows old template values alongside QA values, and the audit recorded 98 field mismatches.
3. Several non-Veritas templates have unmapped fields or retained sample values. The detailed mismatches and blank-template flags are in `template-results.json`.
4. The portal lint baseline remains large: 216 errors and 45 warnings. The current gate only confirms no regression against that baseline.
5. Flutter has no analyzer errors or warnings but has 110 informational findings, including deprecated APIs. These should be cleaned before a strict release gate.

## Files

- `case-manifest.json`: QA case IDs and photo storage paths.
- `template-results.json`: per-template field, photo, blank-template, and output checks.
- `evidence/mobile-results.json`: structured mobile results.
- `evidence/mobile-run.log`: raw Flutter integration output.
- `evidence/veritas/`: rendered DOCX pages and PDF for visual inspection.
- `evidence/calc/`: rendered XLSX PDFs.
- `reports/`: generated DOCX/XLSX artifacts, including empty-template checks.

No existing customer case was modified. The QA rows and their storage objects are scoped to the run prefix and can be removed after approval.
