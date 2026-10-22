from pathlib import Path
import json
root=Path(__file__).resolve().parents[1];b=root/'.secrets/supabase-backups/2026-10-22-cases';out=b/'restore-sql';out.mkdir(exist_ok=True,mode=0o700)
s=json.loads((b/'schema-catalog.json').read_text());auth=json.loads((b/'auth-users-and-identities.json').read_text())
q=lambda x:'"'+x.replace('"','""')+'"'
source='https://osvuyzhaucjrtdhqrmlx.supabase.co';target='https://gwqfwtcxlwcmglrozshc.supabase.co'
def transform(value):
 if isinstance(value,str):return value.replace(source,target)
 if isinstance(value,list):return [transform(v) for v in value]
 if isinstance(value,dict):return {k:transform(v) for k,v in value.items()}
 return value
jobs=[]
def insert(schema,table,rows,cols,identity=False):
 for i in range(0,len(rows),10):
  batch=rows[i:i+10];data=json.dumps(batch,ensure_ascii=False,separators=(',',':'));tag='$hem_restore_json$'
  assert tag not in data
  names=', '.join(q(x) for x in cols)
  sql=f'INSERT INTO {q(schema)}.{q(table)} ({names}) '+('OVERRIDING SYSTEM VALUE ' if identity else '')+f'SELECT {names} FROM jsonb_populate_recordset(NULL::{q(schema)}.{q(table)}, {tag}{data}{tag}::jsonb);\n'
  name=f'{len(jobs):03d}-{schema}-{table}-{i:03d}.sql';(out/name).write_text(sql);(out/name).chmod(0o600);jobs.append({'file':name,'schema':schema,'table':table,'rows':len(batch),'characters':len(sql)})
for row in auth['users']:
 for token in ['confirmation_token','recovery_token','email_change_token_new','email_change_token_current','reauthentication_token','phone_change_token']:row[token]=''
for table in ['users','identities']:
 cols=[c['column_name'] for c in s['auth_columns'] if c['table_name']==table and c.get('is_generated')!='ALWAYS' and any(c['column_name'] in r for r in auth[table])]
 insert('auth',table,auth[table],cols)
# Extra attendance/leave rows remain in the backup, but are outside the selected case restore.
for table in ['users','clients','cases','case_location','case_photos','case_documents','extracted_data','case_field_data','case_reports','case_events']:
 rows=transform(json.loads((b/'data'/f'{table}.json').read_text()))
 cols=[c['name'] for c in sorted([c for c in s['columns'] if c['schema']=='public' and c['table']==table],key=lambda x:x['ordinal']) if not c['generated']]
 insert('public',table,rows,cols,table=='case_events')
(out/'jobs.json').write_text(json.dumps(jobs));(out/'jobs.json').chmod(0o600)
print(json.dumps({'batches':len(jobs),'max_batch_characters':max(j['characters'] for j in jobs),'tables':sorted(set(j['schema']+'.'+j['table'] for j in jobs))}))
