# Engineering and production readiness

Reviewed **22 October 2026**. Scope: `hem_portal/`, Android `HEM_Agent/` and the new Supabase backend. This document describes engineering evidence and remaining checks, not a security certification or proof of a hosted deployment.

## Latest verification

- 128 portal/backend tests passed, including five retention-worker safety tests and seven assignment-sender tests.
- Portal type checking, lint regression gate, production compilation and standalone PDF/font packaging passed.
- Focused Flutter notification/startup analysis and two notification tests passed; the corrected release APK built successfully.
- FCM HTTP v1 validation returned 200 without sending a real notification. Sender authentication and database-to-Edge dispatch probes passed.
- Database assertions verified valuator completion without senior approval, server-controlled timestamps, retention age boundaries and denied client purge access.
- A live synthetic case with four tiny Storage objects was removed through the real retention worker; related rows were removed. The original 44 cases and 161 Storage objects were unchanged by that test.

These are dated observations. Rerun appropriate checks after changes. Android physical-device delivery, Vercel-hosted acceptance and release signing/distribution still need verification. Do not describe a compiled APK as proof of device behavior.

## Commands

From `hem_portal/`, using Node 24:

```sh
npm ci
npm run check:env
npm run release:check
PORT=3100 HOSTNAME=127.0.0.1 node --env-file=.env.local .next/standalone/server.js
```

From another terminal:

```sh
PORTAL_SMOKE_URL=http://localhost:3100 npm run test:smoke
```

`check:env` validates required values/placeholders without printing secrets; it does not prove provider connectivity. Full ESLint still reports legacy findings. `lint:check` prevents regressions against the baseline and must not be weakened to hide new findings.

## Runtime boundaries

- `src/lib/auth/`: verified user/active-account checks and role/case authorization.
- `src/lib/api/`: bounded request handling, error contracts and process capacity controls.
- `src/lib/cases/`: normalized statuses, case access/data and workflow validation.
- `src/lib/reports/`, `report-engine/`, `valuation/`: source data mapping, units/rates, photo handling, rendering and persistence.
- `src/app/api/`: HTTP orchestration; server actions and restricted database RPCs are also mutation entry points.
- Supabase: database RLS, private Storage, transaction/revision checks and service-only operational functions.

Completion is a valuator action after a saved report; senior case approval is retired. Leave approvals retain their separate policy. Completed cases remain read-only. See [workflow](../APPLICATION_WORKFLOW.md).

## Operational safeguards and limits

Report generation has a per-process capacity guard; it is not a distributed quota or durable queue. Requests, images, rendered outputs and exports must also fit the actual hosting platform's body, memory, bundle and timeout limits. Local request allowances do not override Vercel limits. Test realistic large reports, photos and archives on the deployed runtime.

Private Storage and RLS are required even when portal API checks exist, because clients can call Supabase directly. Service credentials must stay in protected server configuration. Intentional service-only tables have no client policies; absence of client access there is not a reason to add public policies.

The mapping cache and shared rate gate bound public-provider use. Push has bounded retries and generic notification text. Retention is irreversible, uses Storage APIs and delays database deletion until matching files are gone. Read the specific [mapping](OPEN_MAPS.md), [push](ASSIGNMENT_NOTIFICATIONS.md) and [retention](CASE_COMPLETION_RETENTION.md) guides before modifying them.

The latest security-advisor review still reported pre-existing authorization-helper and leaked-password-protection advisories. Do not claim an advisory-free deployment. Review account/plan support before changing protections; no paid upgrade is implied by a code release.

## Release acceptance

1. Confirm Vercel root `hem_portal`, Node 24, matching public/server Supabase variables and an appropriate commercial hosting plan.
2. Verify login/session renewal and each relevant role on the hosted URL; check case isolation directly, not only through hidden UI controls.
3. Exercise mobile uploads and Data Review → report fields → PDF/DOCX for representative lender templates, including measurement units, wide screenshot slots and saved-report downloads.
4. Verify valuator completion and read-only behavior on a disposable test case, plus conflict/error paths.
5. Verify FCM delivery on a physical device in foreground/background/cold-start, account switching and denied permission states.
6. Inspect Cron schedules and retention dry-run; preserve evidence and test fixtures without altering business case ages.
7. Monitor database/cache size, Storage, egress, logs and function usage. Do not assume free services are unlimited or purge business data merely to reset usage meters.

Follow [DEPLOYMENT.md](../DEPLOYMENT.md) for environment and rollback guidance. SQL under historical QA directories is evidence, not a safe blanket production bootstrap. A future Windows wrapper should use the hosted HTTPS portal and contain no service credentials.
