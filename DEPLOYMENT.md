# Deployment guide

Current configuration: **22 October 2026**. This guide supersedes the old `frontend/`, public-bucket, AI and Google Maps deployment instructions.

## Existing production backend

Both clients target Supabase **`gwqfwtcxlwcmglrozshc`**. The selected cases, users and files have been restored there. Do not re-import backups, create replacement users, replay historical schemas or run all migrations indiscriminately against this populated project.

The three case buckets — **photos**, **documents**, **reports** — are private. Preserve case-based RLS and signed/authenticated file access. Do not add blanket public-read or authenticated-write policies. A service key bypasses RLS and must stay server-side.

The deployed Edge Functions are:

| Function | Purpose | Configuration |
| --- | --- | --- |
| `google-geocode` | Authenticated OpenStreetMap enrichment and previews | Built-in Supabase variables; optional trusted provider overrides |
| `assignment-push` | Queued Android assignment notifications | Encrypted Firebase service-account JSON and shared dispatch secret |
| `case-retention` | Permanent deletion of cases completed at least 30 days ago | Shared dispatch secret; service-only inventory/finalization RPCs |

Notification wake-up/retry and hourly retention are already activated. See the linked operational guides before changing schedules or credentials. The removed AI functions and unused `report-generator` are not deployment dependencies.

## Deploy the website on Vercel

1. Import [HEM-Web-and-App](https://github.com/hemvaluation-dev/HEM-Web-and-App), branch **main**.
2. Set **Root Directory = `hem_portal`**, Framework = **Next.js**, Node = **24.x**.
3. Use `npm ci` for installation and `npm run build` for the build. Leave Vercel's framework output directory default. Do not set `.next/standalone` as Vercel's output directory or run `start-prod.sh` as its build command.
4. Configure the following variables for Production and any Preview environment that is intentionally allowed to access this backend.

| Variable | Value / handling |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gwqfwtcxlwcmglrozshc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | New project's public publishable key; this is the variable name the portal reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Matching server secret/service-role key; sensitive server-only variable |

The mobile variable `SUPABASE_PUBLISHABLE_KEY` and a variable named `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` do not replace the portal's `NEXT_PUBLIC_SUPABASE_ANON_KEY` name. Do not copy Firebase private credentials to Vercel: notification sending runs in Supabase.

5. Deploy. Public Next.js variables are embedded at build time, so redeploy after changing them. Check build logs and report-function packaging rather than assuming a successful local build proves the hosted runtime.
6. Set the final HTTPS domain as Supabase Auth's Site URL and configure only the redirect URLs actually used by the application. Verify login and any recovery/OAuth flow used by your organization. Do not disable RLS to resolve an authentication problem.
7. Complete the hosted acceptance checks below before directing normal traffic to the release.

Vercel Hobby is restricted to personal, non-commercial use; choose a plan suitable for a business portal. Check current [plan rules](https://vercel.com/docs/plans/hobby), [function limits](https://vercel.com/docs/functions/limitations) and account spend controls before rollout. Do not assume free hosting or unlimited report downloads.

## Local production check

```sh
cd hem_portal
npm ci
# Configure .env.local from .env.example first.
npm run check:env
npm run release:check
PORT=3100 HOSTNAME=127.0.0.1 node --env-file=.env.local .next/standalone/server.js
```

From another terminal in `hem_portal`:

```sh
PORTAL_SMOKE_URL=http://localhost:3100 npm run test:smoke
```

The build prepares the standalone assets and checks PDF font packaging. `GET /api/health` reports liveness, not database/provider health. Local `npm start` and helper scripts require environment variables to be available to the process; the explicit command above loads them from the local file.

## Mobile release

See [HEM Agent setup](HEM_Agent/README.md). Keep Android application ID **com.example.flutter_app** for update compatibility. Supply the matching `google-services.json` locally or through protected CI. Keep service credentials out of Dart defines. Install the newly built APK, sign in and allow notifications; an older APK may still target an older backend or lack startup fixes. Verify signing/version-code requirements for your distribution channel before publishing an update.

## Database changes and a separate new environment

Inspect the target database and migration history first. The migration directory includes incremental compatibility changes; it is not a guaranteed empty-project bootstrap. Files under `qa/migrations/2026-10-22/` are dated schema/restore evidence, not instructions to overwrite a live project. Scripts under `scripts/` are explicit migration utilities and are not part of normal deployment.

For another environment, plan schema bootstrap, Auth/provider settings, private Storage policies, user/data migration and function dependencies separately. Deploy functions with the source files and settings in `supabase/config.toml`; `verify_jwt=false` does not mean anonymous business access is permitted: each function validates its own request authentication. Preserve those checks.

Configure push before running `supabase/setup/enable_assignment_push.sql`. Configure the retention worker and review its irreversible policy before running `supabase/setup/enable_case_retention.sql`. See [notifications](docs/ASSIGNMENT_NOTIFICATIONS.md), [mapping](docs/OPEN_MAPS.md) and [retention](docs/CASE_COMPLETION_RETENTION.md).

## Hosted acceptance checklist

- Login with existing accounts; check owner, valuator and assigned/unassigned agent access.
- Verify case lists, filters, assignments and data saves after refresh.
- Capture GPS and upload photos, documents, audio/video from the current mobile build.
- Check mobile → Data Review → selected template fields, area units/rates, image placement and generated PDF/DOCX downloads.
- Save a report, then complete a disposable test case as a valuator without senior approval. Confirm it becomes read-only.
- Confirm assignment delivery on a physical phone in foreground, background and cold-start states. Server validation alone does not prove delivery.
- Inspect retention dry-run eligibility and Cron state. Never age a real case just to test cleanup.
- Verify large-file upload/report/archive behavior against actual Vercel limits and memory/time budgets.

Rollback a website through deployment history and restore matching environment values if needed. Never switch only one client to an incompatible backend. Retention deletion cannot be undone through the app; independently retained backups/exports require their own recovery and retention process.
