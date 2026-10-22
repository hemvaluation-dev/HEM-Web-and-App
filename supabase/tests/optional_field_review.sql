-- Exercise both mobile RPC paths under the assigned agent identity; always roll back.
BEGIN;
DO $test$
DECLARE c public.cases; saved public.cases;
BEGIN
 SELECT c0.* INTO c FROM public.cases c0 JOIN public.users u ON u.id=c0.assigned_to AND u.role='field_agent'
 WHERE c0.status='in_progress'
 AND EXISTS(SELECT 1 FROM public.case_location l WHERE l.case_id=c0.id)
 AND EXISTS(SELECT 1 FROM public.case_photos p WHERE p.case_id=c0.id)
 AND EXISTS(SELECT 1 FROM public.case_documents d WHERE d.case_id=c0.id AND d.document_type NOT IN ('Audio Recording','Video Recording'))
 LIMIT 1;
 IF c.id IS NULL THEN RAISE EXCEPTION 'No eligible fixture'; END IF;
 -- Clear only within this rolled-back transaction to prove empty review fields are accepted.
 UPDATE public.cases SET extracted_data='{}'::jsonb WHERE id=c.id RETURNING * INTO c;
 PERFORM set_config('request.jwt.claim.sub',c.assigned_to::text,true);
 PERFORM set_config('request.jwt.claim.role','authenticated',true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',c.assigned_to,'role','authenticated')::text,true);
 SET LOCAL ROLE authenticated;
 BEGIN
  saved:=public.save_case_data(c.id,'{}'::jsonb,c.revision,true);
  IF saved.status<>'field_visit_done' THEN RAISE EXCEPTION 'Empty review save did not submit'; END IF;
  RAISE EXCEPTION USING ERRCODE='ZX001',MESSAGE='rollback first submission';
 EXCEPTION WHEN SQLSTATE 'ZX001' THEN NULL;
 END;
 BEGIN
  saved:=public.transition_case(c.id,'field_visit_done',c.revision);
  IF saved.status<>'field_visit_done' THEN RAISE EXCEPTION 'Details submission failed'; END IF;
  RAISE EXCEPTION USING ERRCODE='ZX001',MESSAGE='rollback second submission';
 EXCEPTION WHEN SQLSTATE 'ZX001' THEN NULL;
 END;
 BEGIN
  saved:=public.save_case_data(c.id,'{}'::jsonb,c.revision-1,true);
  RAISE EXCEPTION 'Stale revision was accepted';
 EXCEPTION WHEN serialization_failure THEN NULL;
 END;
END $test$;
ROLLBACK;
SELECT 'Both submission paths accept blank review data; stale revisions rejected; all fixture changes rolled back' AS result;

