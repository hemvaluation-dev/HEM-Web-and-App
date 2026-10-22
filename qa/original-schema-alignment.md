# Original Supabase alignment plan

The original project is `osvuyzhaucjrtdhqrmlx`. The portal now reads that project. The mobile app is configured to receive the same project URL and publishable key through protected build defines; it no longer embeds the previous project identity.

The live comparison now shows that the workflow migration is already present: `cases`, `case_reports`, `case_events`, photos, documents, and field data have the canonical structure. The only required compatibility change found is a nullable `case_location.address` alias; the original project retains the legacy `nearest_highway` field, which is safe to keep. Apply `supabase/migrations/202609270003_original_location_compatibility.sql` to add the alias and copy existing `address_from_gps` values without deleting or overwriting data.

Run `node supabase/compare_original_schema.js` after the Supabase connection is available. The script reads only the PostgREST schema document and writes `qa/original-schema-comparison.json`; it never writes database rows and never prints credentials.

The alignment migration is additive. It adds missing workflow columns, report and audit tables, indexes, RPCs, storage policies, and RLS policies. It snapshots existing `cases` and `case_field_data` into `hem_private` before normalization. Legacy status values are mapped into canonical statuses, and legacy field values are merged only when the new JSON field is empty. Existing rows, files, users, and clients are retained.

Legacy duplicate locations or attendance rows are preserved. The migration creates non-unique lookup indexes and adds unique indexes only when the current data has no duplicates; it never deletes rows to satisfy a constraint. Any duplicate cleanup can be planned separately after the business owner reviews the records.

The migration must be reviewed and executed against `osvuyzhaucjrtdhqrmlx`, not the previous `dugpievzlsvujnidghha` project. After execution, verify row counts, storage buckets, RLS, RPCs, and the comparison report before switching any production credentials.
