# HEM selective Supabase migration — 22 October 2026

Source: `osvuyzhaucjrtdhqrmlx` (original HEM).
Destination: `gwqfwtcxlwcmglrozshc`.

Requested scope: all users, plus cases created on 21–22 October 2026 in Asia/Kolkata and their related records/files. Selection is `created_at >= 2026-10-20T18:30:00Z AND created_at < 2026-10-22T18:30:00Z`. Recount immediately before copying because the original project is live.

Initial inventory:

| Entity | Count |
|---|---:|
| Cases | 44 |
| Auth users | 28 |
| Auth identities | 28 |
| Application user profiles | 28 |
| Photos | 127 |
| Documents | 30 |
| Generated reports | 4 |
| Locations | 7 |
| Case events | 55 |
| Separate field-data records | 0 |
| Separate extracted-data records | 0 |

## Required migration sequence

1. Authenticate access to destination and inspect its schema/data before modifying anything. Publishable keys cannot authorize administrative migration. Current plugin access is limited to the source project. The project-scoped Codex MCP connection was added and OAuth login completed successfully. This running chat has not loaded that new MCP server; the separate plugin connection still denies destination access. Reload/reconnect the MCP tools before importing.
2. Back up destination state and inventory collision IDs/emails. Do not overwrite or delete existing destination records silently.
3. Align destination tables, constraints, functions, indexes, RLS, grants and storage policies with the application's current schema. Do not enable notification dispatch or legacy AI services during import.
4. Preserve authentication UUIDs, password hashes and identities, plus all application user profiles/roles/active status. Never store password hashes in Git or chat. Existing session tokens will not be carried over; users will need to sign in again. Handle MFA/OAuth/provider settings separately if present.
5. Copy institution/template configuration needed by selected cases, preserving references. Copy selected cases and every child record, including review/report snapshots and case events. Avoid invoking normal audit/status/push triggers during historical import, and restore protections afterward.
6. Copy referenced original and processed photo files, documents, reports and any location-image files to corresponding destination buckets. Discover references from rows and embedded JSON as well as case path prefixes. Rewrite only source-project storage URLs to destination URLs; keep IDs and object paths stable. Download/upload real object bytes—copying storage metadata alone does not migrate files.
7. Validate ID sets, row values/counts, foreign keys and object checksums/lengths. Confirm permissions, login, case visibility, photo/document retrieval and report generation. Record any missing source objects rather than hiding failures.
8. Recount source changes after the initial snapshot and copy the delta. Switch portal/mobile configuration only after verification and coordinate deployment/new APK. Leave source data unchanged for rollback.

## Current status

Local backup completed on 22 October 2026. All 44 selected cases, related records, 28 users/password hashes/identities, and 161 storage files are saved under the Git-ignored `.secrets/supabase-backups/2026-10-22-cases/` folder. Source row comparison found no changes during the download. Downloaded file SHA-256 checks and stored report hashes passed. Original authentication hashes were independently matched against the source.

Schema catalog, constraints, indexes, functions, policies, grants, triggers, bucket settings and deployed OpenStreetMap function source are included. The schema export is an introspection catalog, not a ready-to-run full PostgreSQL dump; reconcile and generate restore SQL against the new project after access is available.

A compressed private archive is available beside the backup folder as `2026-10-22-cases.tar.gz`. See its private `RESTORE-NOTES.md` for scope, sequence and exclusions. No sensitive exports are committed to Git. Source data and current application configuration remain unchanged. The user will replace the old connection and provide new-project access before restoration. Keep the old Supabase project until the restored application is verified.

## Restore update

Backup data is restored to the new project. See [RESTORED.md](RESTORED.md) for verified counts and remaining application cutover steps.
