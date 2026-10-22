/*
 * Read-only schema comparison for the original Supabase project.
 * Run from the repository root with the original project's .env.local.
 * It reports structure only; service credentials are never printed.
 */
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

const env = dotenv.parse(fs.readFileSync(path.resolve('hem_portal/.env.local')));
const base = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error('The original Supabase URL and service key are required in hem_portal/.env.local');

const expected = {
  users: ['id', 'email', 'full_name', 'role', 'level', 'department', 'is_active'],
  clients: ['id', 'name', 'template_name'],
  cases: ['id', 'client_id', 'created_by', 'assigned_to', 'reviewer_id', 'valuator_id', 'idempotency_key', 'status', 'application_number', 'applicant_name', 'phone_number', 'address', 'property_type', 'state', 'branch', 'case_type', 'extracted_data', 'revision', 'submitted_at', 'report_drafted_at', 'reviewed_at', 'completed_at', 'created_at', 'updated_at', 'deadline_date'],
  case_photos: ['id', 'case_id', 'photo_type', 'file_url', 'latitude', 'longitude', 'original_file_url', 'created_at'],
  case_documents: ['id', 'case_id', 'document_type', 'file_name', 'file_url', 'extracted_data', 'created_at'],
  case_location: ['id', 'case_id', 'latitude', 'longitude', 'address', 'altitude', 'accuracy', 'address_from_gps', 'city', 'state', 'pincode', 'nearest_bus_stop', 'nearest_railway', 'nearest_hospital', 'nearest_airport', 'nearest_park', 'created_at'],
  case_field_data: ['case_id', 'created_at'],
  case_reports: ['id', 'case_id', 'template_id', 'storage_path', 'data_snapshot', 'created_by', 'created_at', 'case_revision', 'sha256'],
  case_events: ['id', 'case_id', 'actor_id', 'event_type', 'old_status', 'new_status', 'created_at'],
};

async function main() {
  const response = await fetch(`${base}/rest/v1/`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!response.ok) throw new Error(`Schema endpoint returned ${response.status}`);
  const spec = await response.json();
  const definitions = spec.definitions || {};
  const tables = Object.fromEntries(Object.entries(expected).map(([table, columns]) => {
    const actual = Object.keys(definitions[table]?.properties || {});
    return [table, { present: Boolean(definitions[table]), missing: columns.filter(column => !actual.includes(column)), extra: actual.filter(column => !columns.includes(column)), actual }];
  }));
  const report = { project: new URL(base).hostname, generatedAt: new Date().toISOString(), tables };
  fs.writeFileSync(path.resolve('qa/original-schema-comparison.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(Object.fromEntries(Object.entries(tables).map(([name, value]) => [name, { present: value.present, missing: value.missing.length, extra: value.extra.length }]))));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
