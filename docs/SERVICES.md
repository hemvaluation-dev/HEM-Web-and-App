# Services, APIs and configuration

Current implementation inventory, reviewed **22 October 2026**. Dependency versions and exact API behavior are defined by source and lockfiles; this guide does not promise fixed provider prices or unlimited free usage.

## External and hosted services

| Service | Actual usage | Data / cost considerations |
| --- | --- | --- |
| Supabase PostgreSQL | Cases, profiles, institutions, field records, reports, attendance/leaves, events, mapping cache and notification metadata | Database size, requests and logs count toward project quotas |
| Supabase Auth | Existing user accounts, login/session and active-profile authorization | Users sign in again after a project cutover; old sessions are not migrated |
| Supabase Storage | Private photos, originals, documents, audio/video and generated reports | Stored bytes and downloads/egress count; signed URLs do not make files public |
| Supabase Edge Functions | Mapping, assignment push and retention workers | Invocations, runtime and egress count; no redundant AI/report-generator functions required |
| Supabase Cron + pg_net + Vault | Retry/scheduled checks, asynchronous worker dispatch and encrypted dispatch configuration | Idle jobs check the database but avoid unnecessary Edge calls |
| Firebase Cloud Messaging | Android case-assignment delivery only, project `hem-9b6dc` | No Firebase database, Analytics, Storage or Cloud Functions required; Supabase sender usage still counts |
| Nominatim | User-triggered reverse address lookup | Device coordinates go to the provider; shared rate gate and seven-day caching apply |
| OpenStreetMap tiles | Small attributed photo/map previews | Limited tile viewport, caching, no bulk/offline area downloads; best-effort public infrastructure |
| Vercel | Next.js web hosting and server APIs when deployed | Hosting/functions/egress have plan limits; Hobby is not for commercial use |
| GitHub | Source repository and release history | Deployment source is `hemvaluation-dev/HEM-Web-and-App`, `main` |

No AI API, Groq/Gemini service, Google Maps key, paid Places lookup or Python report-engine sidecar is required by the current application. Report libraries run inside the portal's Node runtime. Phone GPS comes from Geolocator/device sensors and does not require a mapping API key.

## Configuration ownership

| Name / file | Where it belongs | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Portal build/runtime environment | Current project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Portal build/runtime environment | Public publishable key; existing variable name is retained |
| `SUPABASE_SERVICE_ROLE_KEY` | Portal server environment only | Protected administration/Storage operations |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Flutter Dart defines / public defaults | Mobile client connection, never server credentials |
| `HEM_Agent/android/app/google-services.json` | Local/CI Android build, Git-ignored | Matching Firebase Android registration |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Supabase encrypted Edge secrets only | Server permission to send FCM HTTP v1 messages |
| `PUSH_WEBHOOK_SECRET` | Supabase encrypted Edge secrets | Authenticates internal push and retention dispatch |
| `hem_push_url`, `hem_push_webhook_secret` | Supabase Vault | Internal sender endpoint and matching shared secret |
| `OSM_NOMINATIM_URL`, `OSM_TILE_URL` | Optional encrypted Edge configuration | Trusted alternate map providers; defaults documented in OPEN_MAPS.md |

Supabase injects its own runtime URL and server credentials into Edge Functions. Do not manually expose these through browser environment names. Existing protected local files under `.secrets/` are operator resources, not repository assets or deployment uploads.

## Edge Function contracts

- **google-geocode**: requires application authentication; supports location capture/enrichment plus older compatibility actions. Caches/rate-limits public-provider requests. GPS remains valid when enrichment fails.
- **assignment-push**: requires the internal shared secret. Atomically claims a queued event, checks current assignment and registered device ownership, sends generic FCM payloads and records bounded retries/deliveries. New assignments trigger dispatch; retries run every five minutes. No devices means skipped delivery, not failed case assignment.
- **case-retention**: requires the internal shared secret. Defaults to dry-run unless `dry_run:false` is explicitly supplied. Uses service-only inventory/finalization RPCs. The hourly job only invokes it when expired completed cases exist. Storage failures defer metadata removal.

Do not additionally create a notification Dashboard webhook when the database wake-up trigger is active: it would duplicate dispatch attempts. Do not call worker endpoints from mobile or browser code with their secret.

## Website entry points

The following HTTP routes exist under `hem_portal/src/app/api/`. Authentication, roles, case access, payload validation and exact methods must be checked in the corresponding route implementation; this list is not an unauthenticated API grant.

- `/api/export-attendance`
- `/api/export-cases`
- `/api/export-leaves`
- `/api/export-media`
- `/api/export-mis`
- `/api/export-team`
- `/api/generate-report`
- `/api/generate-template-report`
- `/api/generate-veritas-report`
- `/api/health`
- `/api/reports/[id]`
- `/api/v1/cases`
- `/api/v1/session`

`/api/health` is public liveness only. `/api/v1/session` and `/api/v1/cases` expose versioned session/case entry points. Generation routes produce template/PDF/DOCX outputs; saved report and export routes require the applicable access. Portal server actions under `src/app/(main)/` and Supabase RPCs also perform writes; not every UI action corresponds to a separate REST endpoint.

## Retention and service status

Current backend: `gwqfwtcxlwcmglrozshc`. Mapping, push sender and cleanup worker are deployed. Notification dispatch and hourly retention are activated. FCM validation passed; physical-phone delivery remains an acceptance test. The Vercel production deployment has not been certified by the local build.

Cases become eligible 30 days after server-recorded completion. The next hourly run deletes files before case metadata; batches are bounded and retry later when incomplete. Shared files needed by another case are retained. This does not erase independent downloaded files or protected migration backups. See [retention](CASE_COMPLETION_RETENTION.md).

## Operations references

- [Deployment](../DEPLOYMENT.md)
- [Mapping provider limits and privacy](OPEN_MAPS.md)
- [Assignment push setup, retries and delivery limits](ASSIGNMENT_NOTIFICATIONS.md)
- [Completion/retention details](CASE_COMPLETION_RETENTION.md)
- [Release checks and remaining verification](PRODUCTION_READINESS.md)

## Firebase client-key scanning

Firebase client API keys identify the app/project; they are not FCM service-account private credentials. Google recommends restricting them to the required Firebase APIs and excluding unrelated billable APIs. Android configuration is supplied through the Git-ignored native `google-services.json`; the unused FlutterFire `lib/firebase_options.dart` is also ignored. Removing a source file does not remove previous commits or invalidate a key embedded in an installed APK. Never claim a key was revoked unless it actually was. See [Firebase API-key guidance](https://firebase.google.com/docs/projects/api-keys).
