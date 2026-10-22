# HEM Web Portal

Next.js 16.2.7 / React 19 / TypeScript portal for valuation case operations. This directory is the **Vercel project root**.

## Run locally

Use Node **24.x**:

```sh
npm ci
cp .env.example .env.local
# Set the Supabase project URL, public key and server-only service key.
npm run check:env
npm run dev
```

Development URL: `http://localhost:3000`. The portal currently targets Supabase project `gwqfwtcxlwcmglrozshc` when configured with the deployment values; `.env.example` deliberately contains placeholders.

```sh
npm run release:check
PORT=3100 HOSTNAME=127.0.0.1 node --env-file=.env.local .next/standalone/server.js
```

The explicit local env-file is important for the standalone server's server-only credentials. Hosted environments should inject variables directly. Browser `NEXT_PUBLIC_*` values require a rebuild when changed.

## Structure

| Path | Purpose |
| --- | --- |
| `src/app/(main)/` | Authenticated dashboard, case, team, analytics and settings pages/server actions |
| `src/app/api/` | Session/case APIs, report generation/downloads, exports and liveness |
| `src/lib/auth/`, `api/` | Verified identity, role/case permissions and HTTP error/body/capacity handling |
| `src/lib/cases/` | Workflow, evidence, data access and shared filtering |
| `src/lib/reports/`, `report-engine/`, `pdf/` | Field mapping, template rendering, photos and saved reports |
| `src/lib/valuation/` | Measurement conversions and area/rate calculations |
| `src/components/` | Shared UI, HEM logo/loader and form components |
| `src/utils/supabase/` | Browser/server Supabase clients |
| `public/templates/` | Built-in lender report assets, including KreditBee and Veritas |
| `tests/`, `scripts/`, `quality/` | Regression tests, build/smoke tooling and legacy lint baseline |

The API directory is not the only backend entry point: portal mutations also use Next.js server actions and protected database RPCs. Report generation runs here, not in a Supabase report-generator function or Python sidecar.

## Checks and deployment

`npm run release:check` runs type checking, the lint regression gate, tests and the optimized build. `npm run test:smoke` checks a running production server. Full ESLint still has legacy findings; the gate prevents regressions.

Use [deployment instructions](../DEPLOYMENT.md), [services/API inventory](../docs/SERVICES.md) and [workflow](../APPLICATION_WORKFLOW.md). Vercel uses the Next.js preset and this directory; local startup scripts are not Vercel build commands.

The portal needs no AI or Google Maps API keys. Push/retention credentials belong in Supabase's encrypted server configuration. A future Windows shell must use the HTTPS portal and contain no server secrets.
