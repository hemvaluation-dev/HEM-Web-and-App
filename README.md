# HEM Associates — Web Portal and Field App

HEM manages property valuation cases: assignment, mobile inspection, lender-specific reports, valuator completion and automatic retention cleanup. Both clients are online applications sharing one Supabase backend.

Repository: [hemvaluation-dev/HEM-Web-and-App](https://github.com/hemvaluation-dev/HEM-Web-and-App). Documentation reviewed: **22 October 2026**.

## Current components

| Component | Location | Responsibility |
| --- | --- | --- |
| Web portal | `hem_portal/` | Case management, data review, valuation, PDF/DOCX generation, MIS and administration |
| Field app | `HEM_Agent/` | Android field inspection, GPS, photos, documents, audio/video, draft data and submission |
| Backend | `supabase/` | Database migrations, access policies, Storage, mapping, assignment notifications and retention |
| Operational scripts | `scripts/` | Explicit backup, migration and verification utilities; not required to run the app |
| Verification | `qa/` | Historical audits and migration evidence; dated reports are snapshots |
| Documentation | `docs/` | Service contracts, operations and engineering guidance |
| Android release | `app-release.apk` | Published build artifact; rebuild from source for later releases |

`hem_portal/src/app/` contains routes, layouts and server actions; `src/lib/` contains authorization, workflow, reports, valuation and export logic. `HEM_Agent/lib/` contains screens, blocs, core services, routing and theme. Report source templates live in `hem_portal/public/templates/`; template selection/rendering lives in `src/lib/report-engine/`.

## Services

| Service | Used for |
| --- | --- |
| Supabase PostgreSQL, Auth and Storage | Accounts, role/case access, business records and private case files |
| Supabase Edge Functions | `google-geocode`, `assignment-push`, `case-retention` |
| Supabase Cron, pg_net and Vault | Scheduled dispatch, asynchronous HTTP and encrypted server dispatch credentials |
| Firebase Cloud Messaging | Android case-assignment notifications only |
| OpenStreetMap / Nominatim | Address lookup and map previews; device GPS supplies coordinates |
| Vercel | Intended production hosting for the Next.js website and its APIs |

Current Supabase project: **`gwqfwtcxlwcmglrozshc`**. Firebase project: **`hem-9b6dc`**. Project IDs are identifiers, not server credentials. No AI service, Google Maps API, Firebase database, Firebase Storage or Firebase Cloud Function is required. The legacy name `google-geocode` is retained for compatibility; its implementation uses OpenStreetMap.

See [services and configuration](docs/SERVICES.md) for quotas, data flows and secret locations.

## Business workflow

1. An authorized portal user creates a case and assigns a field agent.
2. Assignment queues a push alert for the agent's registered Android device.
3. The agent captures GPS, photos, documents/media and property data. Data Review has **Save Data**, not a separate submit button; submission is performed through the case workflow.
4. Field submission permits incomplete Data Review fields, but still requires GPS, a property document and a property photo.
5. A portal valuator reviews saved mobile data, checks template-specific report fields, calculates areas/rates and generates a report. Reports can also be generated from saved mobile drafts before submission where the workflow permits.
6. After a report is saved and the case is in `report_drafted`, a valuator marks it **completed**. Senior approval is no longer required.
7. Completed cases become read-only. After 30 days, the hourly retention job permanently removes case files and then the case and related records.

Historical `in_review` / `reviewed` values remain compatible; valuators can complete these cases or return them for revisions. See [workflow details](APPLICATION_WORKFLOW.md) and [retention](docs/CASE_COMPLETION_RETENTION.md).

## Local setup

Prerequisites: Node.js **24.x** and npm for the portal; Flutter with Dart compatible with `HEM_Agent/pubspec.yaml` (`^3.11.5`), Android SDK and Java/Gradle for Android builds. Flutter **3.47.5** was used for recent builds; Dart and Flutter version numbers are different.

```sh
cd hem_portal
npm ci
cp .env.example .env.local
# Fill in the three Supabase variables; do not commit this file.
npm run check:env
npm run dev
```

Open `http://localhost:3000`. For a production build and local server:

```sh
npm run release:check
PORT=3100 HOSTNAME=127.0.0.1 node --env-file=.env.local .next/standalone/server.js
```

The explicit env-file loads server secrets before the standalone server changes its working directory. In hosted environments, inject variables using the host's environment configuration.

For mobile setup, Firebase configuration and release APK commands, see [HEM Agent](HEM_Agent/README.md).

## Verification and deployment

From `hem_portal`, `npm run release:check` runs type checking, the lint regression gate, tests and the production build. The latest verification passed **128 portal/backend tests**, the standalone PDF packaging check, and the Android release build. Focused mobile notification tests and analysis also passed. These results are dated checks, not a guarantee for later changes.

The full ESLint command still reports legacy debt; the regression gate does not mean the entire codebase is lint-clean. Physical Android push delivery and the hosted Vercel deployment still require end-to-end verification.

Deploy **`hem_portal`**, not the repository root, to Vercel. Keep the three case Storage buckets private. Never blindly replay old schemas or all historical SQL against a running project. See [deployment](DEPLOYMENT.md) and [release checks](docs/PRODUCTION_READINESS.md).

A Windows executable wrapper is a future option for the hosted online portal; no Windows packaging/release is claimed here.

## Documentation index

- [Deployment and environment setup](DEPLOYMENT.md)
- [Business workflow and field/report mapping](APPLICATION_WORKFLOW.md)
- [Services, APIs and configuration](docs/SERVICES.md)
- [Engineering and production readiness](docs/PRODUCTION_READINESS.md)
- [Mapping and GPS](docs/OPEN_MAPS.md)
- [Assignment push notifications](docs/ASSIGNMENT_NOTIFICATIONS.md)
- [Case completion and permanent retention](docs/CASE_COMPLETION_RETENTION.md)

## Credentials and backups

`.secrets/`, `.env.local`, service-account JSON and native Firebase configuration files are excluded from Git. Only public project configuration belongs in a client bundle. Never put the Supabase service key or Firebase private key in Flutter, browser variables, APKs, documentation or GitHub. Migration exports contain private business/authentication data and must remain in protected local storage. Changing a key or project requires updating the corresponding deployments and rebuilding client bundles.
