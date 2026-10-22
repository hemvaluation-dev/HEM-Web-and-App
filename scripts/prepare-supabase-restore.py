from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
b=root/'.secrets/supabase-backups/2026-10-22-cases'
s=json.loads((b/'schema-catalog.json').read_text())
out=root/'qa/migrations/2026-10-22';out.mkdir(parents=True,exist_ok=True)
q=lambda x:'"'+x.replace('"','""')+'"'
qn=lambda schema,name:q(schema)+'.'+q(name)
lines=['-- Reconstruct verified HEM application schema. No case/user data or credentials.','SET check_function_bodies = false;']
for schema in s['schemas']:
 if schema!='public':lines += [f'CREATE SCHEMA IF NOT EXISTS {q(schema)};',f'REVOKE ALL ON SCHEMA {q(schema)} FROM PUBLIC, anon, authenticated;']
for table in s['tables']:
 schema,name=table['schema'],table['name'];cols=[]
 for col in sorted([c for c in s['columns'] if c['schema']==schema and c['table']==name],key=lambda c:c['ordinal']):
  spec=q(col['name'])+' '+col['type']
  if col['identity']:spec+=' GENERATED '+('ALWAYS' if col['identity']=='a' else 'BY DEFAULT')+' AS IDENTITY'
  elif col['default']:spec+=' DEFAULT '+col['default']
  if col['not_null']:spec+=' NOT NULL'
  cols.append(spec)
 lines += [f'CREATE TABLE {qn(schema,name)} (\n '+',\n '.join(cols)+'\n);',f'ALTER TABLE {qn(schema,name)} ENABLE ROW LEVEL SECURITY;',f'REVOKE ALL ON {qn(schema,name)} FROM PUBLIC, anon, authenticated;',f'GRANT ALL ON {qn(schema,name)} TO service_role;']
for typ in ['p','u','c','f']:
 for con in s['constraints']:
  if con['type']==typ:lines.append(f'ALTER TABLE {qn(con["schema"],con["table"])} ADD CONSTRAINT {q(con["name"])} {con["definition"]};')
con_names={(c['schema'],c['name']) for c in s['constraints'] if c['type'] in ['p','u']}
for index in s['indexes']:
 if (index['schema'],index['name']) not in con_names:lines.append(index['definition']+';')
for f in s['functions']:
 lines += [f['definition']+';',f'REVOKE ALL ON FUNCTION {qn(f["schema"],f["name"])}({f["signature"]}) FROM PUBLIC, anon, authenticated;']
 acl=f['acl'] or ''
 for role in ['authenticated','service_role']:
  if role+'=X' in acl:lines.append(f'GRANT EXECUTE ON FUNCTION {qn(f["schema"],f["name"])}({f["signature"]}) TO {role};')
lines += ['GRANT USAGE ON SCHEMA hem_push_private TO authenticated;','GRANT USAGE ON SCHEMA hem_push_private, hem_private TO service_role;','SET check_function_bodies = true;']
(out/'restore_schema.sql').write_text('\n\n'.join(lines)+'\n')

policies=[]
for grant in s['table_grants']:
 if grant['table_schema']=='public' and grant['grantee']=='authenticated' and grant['privilege_type'] in ['SELECT','INSERT','UPDATE','DELETE']:
  policies.append(f'GRANT {grant["privilege_type"]} ON {qn("public",grant["table_name"])} TO authenticated;')
for p in s['policies']:
 if p['schemaname']=='storage' and not p['policyname'].startswith('hem_'):continue
 if p['tablename']=='extracted_data':continue
 spec=f'CREATE POLICY {q(p["policyname"])} ON {qn(p["schemaname"],p["tablename"])} AS {p["permissive"]} FOR {p["cmd"]} TO '+', '.join(q(role) for role in p['roles'])
 if p['qual']:spec+=' USING ('+p['qual']+')'
 if p['with_check']:spec+=' WITH CHECK ('+p['with_check']+')'
 policies.append(spec+';')
policies += [
 'CREATE POLICY hem_extracted_read ON public.extracted_data FOR SELECT TO authenticated USING (public.hem_case_access(case_id));',
 'CREATE POLICY hem_extracted_write ON public.extracted_data FOR ALL TO authenticated USING (public.hem_case_edit(case_id)) WITH CHECK (public.hem_case_edit(case_id));',
 'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;']
# Restore application triggers only; destination auth/storage system triggers are managed by Supabase.
for t in s['triggers']:
 if t['schema']=='public':policies.append(t['definition']+';')
policies.append("INSERT INTO public.hem_mapping_request_slots(provider,next_allowed_at) VALUES ('nominatim',now()) ON CONFLICT(provider) DO NOTHING;")
policies.append("NOTIFY pgrst, 'reload schema';")
(out/'restore_policies_and_triggers.sql').write_text('\n\n'.join(policies)+'\n')
print('Prepared schema and policies; application triggers will be installed AFTER importing records.')
