CREATE OR REPLACE FUNCTION public.record_case_report(p_case_id uuid, p_template_id text, p_storage_path text, p_data jsonb, p_sha256 text, p_expected_revision bigint)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE c public.cases; report_id uuid; missing text[];
BEGIN
 SELECT * INTO c FROM public.cases WHERE id=p_case_id FOR UPDATE;
 IF NOT FOUND OR NOT public.hem_case_access(p_case_id) OR NOT public.hem_valuator() OR c.status NOT IN ('in_progress','field_visit_done','report_drafted','submitted') THEN 
  RAISE EXCEPTION 'Case is not ready for report generation' USING ERRCODE='42501'; 
 END IF;
 IF p_expected_revision IS NULL OR c.revision<>p_expected_revision THEN RAISE EXCEPTION 'This case changed during report generation. Refresh and try again' USING ERRCODE='40001'; END IF;
 
 IF c.status IN ('field_visit_done', 'report_drafted', 'submitted') THEN
   -- Incomplete review data is allowed in generated reports; retain field evidence checks.
   missing:='{}'::text[];
   IF NOT EXISTS(SELECT 1 FROM public.case_location WHERE case_id=p_case_id) THEN missing:=array_append(missing,'GPS location'); END IF;
   IF NOT EXISTS(SELECT 1 FROM public.case_documents WHERE case_id=p_case_id AND document_type NOT IN ('Audio Recording','Video Recording')) THEN missing:=array_append(missing,'property document'); END IF;
   IF NOT EXISTS(SELECT 1 FROM public.case_photos WHERE case_id=p_case_id) THEN missing:=array_append(missing,'property photo'); END IF;
   IF cardinality(missing)>0 THEN RAISE EXCEPTION 'Add field evidence before report generation: %',array_to_string(missing,', '); END IF;
 END IF;
 
 IF jsonb_typeof(p_data) IS DISTINCT FROM 'object' OR p_sha256 !~ '^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'Invalid report metadata'; END IF;
 IF split_part(p_storage_path,'/',1)<>p_case_id::text OR NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='reports' AND name=p_storage_path) THEN RAISE EXCEPTION 'Report artifact is missing'; END IF;
 
 INSERT INTO public.case_reports(case_id,template_id,storage_path,data_snapshot,created_by,case_revision,sha256)
 VALUES(p_case_id,p_template_id,p_storage_path,p_data,auth.uid(),c.revision,p_sha256) RETURNING id INTO report_id;
 
 IF c.status IN ('field_visit_done', 'submitted') THEN
   UPDATE public.cases SET status='report_drafted', report_drafted_at=now(), valuator_id=coalesce(c.valuator_id, auth.uid()) WHERE id=p_case_id;
 ELSIF c.valuator_id IS NULL THEN
   UPDATE public.cases SET valuator_id=auth.uid() WHERE id=p_case_id;
 END IF;
 
 RETURN report_id;
END $function$;

