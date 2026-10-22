# Website and mobile alignment audit — 11 October 2026

Status: automated audit passed after fixes; authenticated end-to-end sign-off remains pending.

## Verified

- Portal: 52 tests passed; TypeScript passed; lint regression gate passed; production build and packaged PDF renderer passed.
- Production HTTP checks: health, security headers, unauthenticated API responses, protected-page redirects, login assets and export protection passed at localhost:3100.
- Mobile: 40 tests passed, including 28 review-screen tests (14 templates × light/dark), incomplete draft save through the real screen using a mocked backend, unit parity and workflow aliases. Android debug APK built and installed on HEM_QA_20260926.
- Template audit: 14/14 passed; 1,704 configured fields and 125 photo slots exercised with synthetic inputs. Blank-template checks found no retained sample values flagged by the audit. Separate regression tests checked mapped agent values in lender output cells and unit conversions. These are automated document checks, not a visual pagination sign-off in Word/Excel.
- Live Supabase read-only checks confirmed the workflow functions, canonical case statuses and active Edge Functions. Both clients point to the same project; the configured mobile public key reached Auth settings with HTTP 200. This does not verify a user login or a maps operation.
- Live report persistence rules allow draft reports during inspection without advancing the case to report_drafted. Field submission still requires GPS, a property document and a photo; incomplete review fields are allowed. Senior-review submission retains dossier-completeness checks. Existing database rows were not changed or deleted.

## Fixes made in this audit

- Mobile now calculates component amounts, selectable totals and area/rate unit conversions using the same contract as the portal. Tests consume common numeric fixtures.
- Mobile retains legacy Yes/No field values without dropdown assertions, gives valuation checkboxes a Material surface, and shows a retry screen when case loading fails instead of an empty editable form.
- Report API loads case GPS/visit information for mapping even without browser overrides. The older Veritas API now uses canonical field mappings, recalculated values and measurement summaries too.
- Portal draft-report wording matches the live workflow; workflow transition validation includes starting inspection from new and returning report_drafted to field_visit_done.
- Unsupported lender formats are explicitly labeled as generic HEM PDF instead of an unexplained fallback.
- Media ZIP exports retain repeated photo/document names with unique prefixes, keep XLSX report extensions and preserve zero values.
- Multi-select filters synchronize their drafts with URL changes without effect-driven state resets; release lint regressions were removed.

## Outstanding before full sign-off

1. The Mac was locked during browser/emulator inspection. The portal is at localhost:3100/login and needs the existing owner/admin test account; the QA emulator needs the existing field-agent account. No credentials were read from browser storage or requested in chat.
2. The current original Supabase project contains no QA-prefixed cases. The historical 14-case mobile integration script targets old project fixtures, so it was not run against real customer cases. Signed-in synthetic case creation, upload, draft generation, submission, review, approval and report download still need an end-to-end pass.
3. Live GPS/camera, Google Maps, role-specific real sessions and desktop wrapping are not certified by this audit. AI extraction was subsequently retired.
4. Stored lender IDs without an exact available template include aditya_birla_hl_template, bajaj_template, mothilal_template, chola_template and equitas_bank_template. Their original formats or an explicit confirmed equivalent are needed; no HL/SME/other lender format was guessed. Existing institution rows were preserved.
5. Existing lint debt remains: 178 errors and 35 warnings in the repository baseline. Flutter analysis reported 115 informational findings, with no errors or warnings. The Android build warns of future Gradle/AGP/Kotlin minimum-version changes. Passing the regression gate is not a claim of zero technical debt.

## Per-template synthetic output results

| Template | Fields | Photo slots | Result |
| --- | ---: | ---: | --- |
| veritas | 113 | 17 | PASS |
| aditya-birla-lap | 174 | 6 | PASS |
| axis-finance | 150 | 11 | PASS |
| chola-sme | 113 | 10 | PASS |
| equitas | 134 | 12 | PASS |
| icici | 102 | 3 | PASS |
| jm-finance | 119 | 9 | PASS |
| niwas-finance | 104 | 8 | PASS |
| smfg-lap | 127 | 7 | PASS |
| smfg-rural-lap | 82 | 7 | PASS |
| tyger-finance | 94 | 11 | PASS |
| ugrow | 69 | 8 | PASS |
| ummeed | 185 | 8 | PASS |
| kreditbee | 138 | 8 | PASS |

Outputs: `reports/`; exact fixture inputs: `fixtures/`; detailed checks: `template-results.json`. All generated documents are synthetic QA examples and must not be used as customer valuation reports.
