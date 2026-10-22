-- Preserve legacy review statuses/data, but remove mandatory senior approval.
DO $$
DECLARE definition text;
BEGIN
 definition:=pg_get_functiondef('public.hem_guard_case()'::regprocedure);
 definition:=replace(definition,$edit$(previous='report_drafted' AND target IN ('in_review','field_visit_done'))$edit$, $edit$(previous='report_drafted' AND target IN ('completed','field_visit_done'))$edit$);
 definition:=replace(definition,$edit$(previous='in_review' AND target IN ('report_drafted','reviewed'))$edit$, $edit$(previous='in_review' AND target IN ('report_drafted','completed','field_visit_done'))$edit$);
 definition:=replace(definition,$edit$(previous='reviewed' AND target='completed')$edit$, $edit$(previous='reviewed' AND target IN ('completed','field_visit_done'))$edit$);
 definition:=replace(definition,$edit$IF (previous='in_review' OR target='completed') AND NOT public.hem_senior() THEN RAISE EXCEPTION 'Senior review permission required'; END IF;$edit$, $edit$IF (target='completed' OR (target='field_visit_done' AND previous IN ('report_drafted','in_review','reviewed'))) AND NOT public.hem_valuator() THEN RAISE EXCEPTION 'Valuator permission required'; END IF;$edit$);
 definition:=replace(definition,$edit$IF target IN ('report_drafted','in_review') AND NOT EXISTS$edit$, $edit$IF target IN ('report_drafted','in_review','completed') AND NOT EXISTS$edit$);
 -- completed_at must be server-controlled; clients cannot accelerate retention.
 definition:=replace(definition,$edit$IF previous='completed' THEN$edit$, $edit$IF NEW.completed_at IS DISTINCT FROM OLD.completed_at THEN RAISE EXCEPTION 'Completion time is server controlled'; END IF; IF previous='completed' THEN$edit$);
 EXECUTE definition;
END $$;

-- Service-only inventory of actual Storage objects: prefix also finds files whose
-- upload succeeded but metadata insert failed. Linked legacy paths are included.
CREATE OR REPLACE FUNCTION hem_push_private.retention_objects(cid uuid)
RETURNS TABLE(bucket_id text,name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT o.bucket_id,o.name FROM storage.objects o
 WHERE o.bucket_id IN ('photos','documents','reports') AND (
 split_part(o.name,'/',1)=cid::text
 OR (o.bucket_id='photos' AND EXISTS(SELECT 1 FROM public.case_photos p WHERE p.case_id=cid AND (p.file_url=o.name OR split_part(split_part(p.file_url,'/photos/',2),'?',1)=o.name OR p.original_file_url=o.name OR split_part(split_part(p.original_file_url,'/photos/',2),'?',1)=o.name)))
 OR (o.bucket_id='documents' AND EXISTS(SELECT 1 FROM public.case_documents d WHERE d.case_id=cid AND (d.file_url=o.name OR split_part(split_part(d.file_url,'/documents/',2),'?',1)=o.name)))
 OR (o.bucket_id='reports' AND EXISTS(SELECT 1 FROM public.case_reports r WHERE r.case_id=cid AND r.storage_path=o.name))
 )
 AND NOT EXISTS(SELECT 1 FROM public.case_photos p WHERE p.case_id<>cid AND o.bucket_id='photos' AND (p.file_url=o.name OR split_part(split_part(p.file_url,'/photos/',2),'?',1)=o.name OR p.original_file_url=o.name OR split_part(split_part(p.original_file_url,'/photos/',2),'?',1)=o.name))
 AND NOT EXISTS(SELECT 1 FROM public.case_documents d WHERE d.case_id<>cid AND o.bucket_id='documents' AND (d.file_url=o.name OR split_part(split_part(d.file_url,'/documents/',2),'?',1)=o.name))
 AND NOT EXISTS(SELECT 1 FROM public.case_reports r WHERE r.case_id<>cid AND o.bucket_id='reports' AND r.storage_path=o.name)
$$;
REVOKE ALL ON FUNCTION hem_push_private.retention_objects(uuid) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.hem_retention_inventory(p_case_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',c.id,'completed_at',c.completed_at,'objects',
 (SELECT coalesce(jsonb_agg(to_jsonb(o)),'[]'::jsonb) FROM (SELECT * FROM hem_push_private.retention_objects(c.id) LIMIT 100) o))),'[]'::jsonb)
 FROM (SELECT id,completed_at FROM public.cases WHERE status='completed' AND completed_at<=now()-interval '30 days'
 AND (p_case_id IS NULL OR id=p_case_id) ORDER BY completed_at LIMIT 10) c
$$;
REVOKE ALL ON FUNCTION public.hem_retention_inventory(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.hem_retention_inventory(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.hem_retention_finalize(p_case_id uuid,p_completed_at timestamptz)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 PERFORM 1 FROM public.cases WHERE id=p_case_id AND status='completed' AND completed_at=p_completed_at AND completed_at<=now()-interval '30 days' FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 IF EXISTS(SELECT 1 FROM hem_push_private.retention_objects(p_case_id)) THEN RETURN false; END IF;
 DELETE FROM public.cases WHERE id=p_case_id;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.hem_retention_finalize(uuid,timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.hem_retention_finalize(uuid,timestamptz) TO service_role;
CREATE INDEX IF NOT EXISTS hem_cases_retention_due ON public.cases(completed_at) WHERE status='completed';
