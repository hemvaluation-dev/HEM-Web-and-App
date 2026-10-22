# Portal/mobile alignment verification — 27 September 2026

This run uses the existing test owner and field-agent accounts and only the 14 cases prefixed `QA-20260926-`. Generated data, documents and photographs are synthetic and must not be used for lending decisions.

## Verified

- Live Supabase workflow migration applied with a private pre-migration backup; no existing customer cases removed.
- Transaction-only database tests passed: agent isolation, required submission fields, stale-write rejection, role-controlled transitions, immutable completed cases, report versioning and audit events. Added report-freshness guard was separately tested before application.
- Android emulator workflow: **64 checks passed**, including startup, six screens, private photo access, submission for all 14 lender templates, locked agent edits, denied agent report generation, and invalid-coordinate rejection. See `mobile-results.json` and `mobile-*.png`.
- Local template audit: **14/14 passed**, covering configured field values, synthetic photos, calculated Veritas totals, empty-report sample removal, and unused XLSX shared-string removal. Reviewed fixed headings and validation-list options are identified separately in `template-results.json`.
- Owner portal review: synthetic Veritas case advanced through draft → senior review → reviewed → completed. Completed-case report generation is hidden, with the saved report still available.
- Portal tests: **24 passed**. Includes authorization, conflicts, locked evidence writes, image validation, and cross-case report-photo rejection.
- Production build and standalone PDF font/resource check passed. HTTP smoke checks passed for health, protected routes, exports, headers and bundled assets.

Repeat mobile checks with `bash qa/run-mobile-alignment.sh` after signing in; the script uses `--keep-app-running` to preserve the test session. The normal app has been restored to the QA emulator.

## Changes

Portal and mobile use canonical case statuses and revision-aware workflow RPCs. Supabase restricts case/evidence access by role and case assignment. Photos, documents and reports use private storage with signed downloads. Reports are saved as immutable versions, and edits invalidate a draft report. Portal attachment writes no longer bypass case locks through a service-role client.

Request-scoped data/authentication reuse and slimmer case-list queries reduce repeated work. Development runs on Turbopack. Existing report photos are loaded on the server in bounded batches using case-scoped IDs, avoiding a browser download/upload round trip.

Veritas uses corrected DOCX table mappings and one shared generation engine. Other template fixes include blank DOCX cells, missing XLSX cells, mapped formula overrides, additional lender fields, and removal of stale shared strings. Report forms no longer use broad substring matching for autofill or expose sample customer text as placeholders. Ambiguous lender area/rate units require explicit values rather than guessed conversions.

## Observed performance

Local Turbopack startup: 206 ms. Authenticated dashboard first request: 2.5 s, including 918 ms framework/compilation. Warm dashboard request: 1.324 s, including 1.315 s application work and remote data access. Case-list request: 1.250 s on first visit and 858 ms warm. These are observations for the current small dataset, not a load-test guarantee or a comparison against a measured old baseline.

## Remaining limits

- The portal is local-only. The mobile app connects directly to the configured Supabase project.
- The supplied Maps key was stored as requested, but Google rejected it as invalid. The user-updated local value was also rejected as invalid; a corrected value is pending. See `maps-provider-results.json`; Flutter Drive uninstalled the app after the successful suite, so the separate authenticated service harness had no session and did not establish a positive end-to-end Maps result.
- Live portal generation: **14/14 lender reports saved**. All 14 stored files match their recorded SHA-256 checksums; see `saved-report-results.json` and `portal-generation-results.json`. Template-content assertions do not constitute page-by-page visual certification of every lender document.
- There is existing lint debt (195 errors, 36 warnings) with no regression against the tracked baseline. Android release signing and a deployed production environment remain separate release prerequisites.
- Database rollback tests exercise additional roles and transitions without retaining their test rows. The emulator uses the existing field-agent account; no QA users or invitation emails were created.
