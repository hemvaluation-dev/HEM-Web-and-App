# Portal redesign and online Windows delivery

The portal in `hem_portal/` remains the deployable Next.js application. The Flutter field app in `HEM_Agent/` shares the portal's slate/blue tokens, HEM branding, lifecycle labels, active-account checks, and submitted-for-review status contract.

## UI

The portal uses shared blue/slate light and dark tokens, Segoe UI/system typography, compact panels, consistent table headings and controls, visible keyboard focus, reduced-motion handling, and print styles. The shell provides responsive navigation, account/theme controls, case search, an offline indicator, and a skip link. Dashboard charts use actual counts; completed means completed/delivered, rather than submitted for review. Case management has filter-preserving status tabs and expandable team assignment forms with pending, success, and error states. Existing report templates and business workflows remain in place.

## API contract

All existing `src/app/api` handlers use `withApi` from `src/lib/api/route.ts`. The helper verifies the Supabase user and workspace profile, supports cookie or bearer authentication, checks origins for cookie-authenticated mutations, disables caching, and attaches `X-Request-ID`.

Errors have this backward-compatible shape:

```json
{ "error": "User-facing message", "code": "ERROR_CODE", "requestId": "uuid" }
```

Successful existing export/report responses retain their file formats and headers. Existing owner-only exports retain their role restrictions. MIS remains owner/admin only. Server-action permissions are checked before privileged user, lender, document, photo, or review mutations. Missing profiles no longer receive owner access. Reading the lender directory no longer seeds or deletes records.

New read endpoints:

- `GET /api/v1/session`: `{ data: { id, profile, permissions } }`
- `GET /api/v1/cases?page=1&pageSize=25&search=...&status=...`: `{ data, pagination: { page, pageSize, total, totalPages } }`
- Page sizes are limited to 1–100. Case results for non-administrators are scoped to creator/agent/reviewer/valuator assignments, in addition to database RLS.

Existing forms still use server actions. This is not a completed conversion of every workflow to standalone REST endpoints. The online Windows packaging path below can use these server actions through the hosted portal.

## Online Windows application

Deploy and operate Next.js as the backend and web application. A future Windows desktop shell can load this hosted application over HTTPS, using its normal login/session flow. The Windows installer must not contain service-role keys, Google server keys. PDF generation and privileged operations continue on the server. There is no offline database or synchronization engine in this change.

Before distributing a Windows installer, implement and test its navigation allowlist, external-link handling, download/save dialogs, session persistence, auto-update strategy, code signing, and installer on Windows. No executable or installer has been built in this redesign.

## Deployment prerequisites

- Preserve `hem_portal/.env.local` locally and configure equivalent server environment variables when hosting.
- Keep the existing Supabase project, schema, storage buckets, RLS policies, and user profiles. This work does not migrate the database or certify its existing policies.
- Deploy the `google-geocode` function and configure its Google Maps key for mobile reverse geocoding.
- Use `npm ci`, `npm run build`, and `npm start` in `hem_portal/`. The build explicitly uses Webpack, matching the development server and avoiding the local sandbox's Turbopack process/port restriction.
- The root startup scripts now use the actual `hem_portal` directory.

## Validation

Run `npm test` for focused authentication, authorization, origin, error-contract, download, and case-stage tests. Run `npm run build` for all Next.js routes and TypeScript checking. Test external integrations using a designated test case before deployment; these checks should not modify operational records merely to test UI rendering.
