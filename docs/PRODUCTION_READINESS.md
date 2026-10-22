# Portal engineering and release guide

Scope: the online web portal in `hem_portal` and its aligned Flutter field app in `HEM_Agent/`. The existing HEM logo and animated loader remain in place. A future Windows shell must connect to the hosted portal; it must never contain Supabase service credentials.

## Verified in this pass

On September 25, 2026, `npm run release:check` passed TypeScript, the lint regression gate, all 22 tests, the optimized build, and PDF rendering from the standalone bundle. `npm run check:env` passed configuration checks. The built server passed `npm run test:smoke` on localhost:3100, including production static assets and unauthenticated API protections; the temporary server was stopped afterward. Full lint debt decreased from 249 errors / 52 warnings to 216 errors / 45 warnings. Docker and authenticated staging workflows remain unverified.

## Local verification

Use Node 24 and run from `hem_portal`:

```sh
npm ci
npm run check:env
npm run release:check
npm start
```

Copy `.env.example` to `.env.local` for local setup. Supply real Supabase public URL and browser key, a server-only service role key and Google Maps key. The environment check validates presence and obvious placeholders without printing values; it does not validate credentials against the providers. GPS enrichment needs Google Geocoding and Places APIs.

`release:check` runs TypeScript, the lint regression gate, tests, and an optimized Next build. CI runs the same command with placeholder public configuration and no production secrets. Tests use mocks for database/network I/O and real image decoding; they do not modify customer records.

The full `npm run lint` command still fails on legacy findings. `quality/lint-baseline.json` records the remaining count by file, rule, and severity. `lint:check` rejects any increase or new finding; it does not certify that the entire codebase is lint-clean. Reduce the baseline whenever fixing those findings. Do not raise it to accommodate new debt.

## Module boundaries

| Area | Responsibility |
| --- | --- |
| `src/lib/auth/session.ts` | Verified cookie/bearer identity and active-account checks |
| `src/lib/auth/actions.ts` | Server-action and case access checks |
| `src/lib/api/` | Error contracts, bounded bodies, API adapters, process capacity |
| `src/lib/cases/` | Shared filters and lifecycle rules |
| `src/lib/leaves/policy.ts` | Leave approval rules and dates |
| `src/lib/exports/csv.ts` | CSV quoting, column validation, formula neutralization |
| `src/lib/reports/images.ts` | Storage origin checks, bounded downloads, image normalization |
| `src/app/api/` | HTTP orchestration and response formats |
| `tests/` | Authorization, failure paths, concurrency, export and image regressions |

Case review transitions use the observed status as a condition on the update. Only senior reviewers can approve or deliver; completed cases cannot be reopened through this action. Leave reviews prevent self-approval and preserve the manager-to-owner approval sequence. Conflicts and partial synchronization failures are shown to the user.

Reports accept up to 20 MB per request and 8 MB per remote/encoded image. Images may come from the configured HTTPS Supabase storage origin or supported image data URLs. Redirects are forbidden; images are decoded and normalized before PDF/DOCX rendering. PDF permits 16 extra photos; the legacy Veritas route permits 12 photos and 4 extras. Template photo counts come from the registry. No arbitrary report image URL is fetched.

Report generation has a per-process capacity guard (two jobs). This is not a distributed quota or durable queue.

## Deployment

The build command produces `.next/standalone`, copies `public` and `.next/static` into it, and renders a small PDF using the packaged dependencies. PDF standard fonts are explicitly traced because automatic tracing omitted them. `npm start` runs this standalone server. Do not distribute local build artifacts containing `.env.local`; use a clean CI/container build.

For read-only HTTP smoke checks, run the built application on port 3100 (`PORT=3100 npm start`) and run `npm run test:smoke` from another terminal. Override `PORTAL_SMOKE_URL` to use another address. The checks cover liveness, headers, login, a compiled JavaScript asset, protected-page redirects, and unauthenticated API/export rejection.

`hem_portal/Dockerfile` builds and runs the standalone server as a non-root user. Use `hem_portal` as the Docker build context. Provide `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as build arguments; those values are public and fixed into the browser bundle. Provide server secrets only at runtime through your deployment secret store. The Docker ignore file excludes local environment files and build output. Docker was unavailable on the development machine, so the Linux container build still needs validation.

`GET /api/health` is public liveness only and returns no configuration. It does not check Supabase or external providers. Security headers disable MIME sniffing and framing and restrict browser device permissions to the same origin. Session refresh cookies are preserved on redirects. API authentication is handled inside the API adapter, avoiding duplicate proxy authentication for API requests.

Use HTTPS termination, ingress body/read timeouts, deployment-wide rate limits, memory/CPU limits, and monitored error reporting. For multi-instance scale, move report jobs to a durable worker queue and add shared quotas.

## Remaining release requirements

These changes are an engineering hardening pass, not an enterprise security certification or a deployment.

1. **Database authorization:** inspect the actual database and storage RLS policies against each role. The checked-in `schema.sql` is incomplete and contains permissive policies; it must not be applied as a production migration. Server checks cannot protect direct Supabase requests when RLS permits them. Review service-role actions and add audited, versioned migrations against a staging database.
2. **Data integrity:** make updates spanning `cases.extracted_data` and `case_field_data` transactional through a database function/migration. The portal now reports partial synchronization failure, but the two writes are not atomic. Review assignment, upload, and other legacy server actions for consistent policy enforcement.
3. **Scale:** legacy list/export queries still depend on Supabase row limits; migrate them to complete database-side filtering and pagination or asynchronous snapshot exports before relying on large exports. The v1 case API has pagination. Benchmark reports under representative workloads and configure deployment-wide quotas.
4. **Operations:** verify restore procedures, secret rotation, dependency audit, durable audit events, monitoring and alert routing, and a rollback procedure in the chosen hosting environment.
5. **Release acceptance:** validate the Docker image on Linux, representative PDF/DOCX/XLSX templates, the Android/iOS field build, and end-to-end role-specific workflows in staging. Mutation tests against the connected customer database were intentionally not run.
