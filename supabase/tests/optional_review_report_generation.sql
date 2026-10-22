-- Test report persistence with empty review data without retaining any test records.
BEGIN;
DO $test$
DECLARE cid uuid:=gen_random_uuid(); owner_id uuid; agent_id uuid; c public.cases; rid uuid;
BEGIN
 SELECT id INTO owner_id FROM public.users WHERE role='owner' AND is_active LIMIT 1;
 SELECT id INTO agent_id FROM public.users WHERE role='field_agent' AND is_active LIMIT 1;
 IF owner_id IS NULL OR agent_id IS NULL THEN RAISE EXCEPTION 'Active owner and agent fixtures required'; END IF;
 INSERT INTO public.cases(id,created_by,assigned_to,status,applicant_name,application_number,extracted_data)
 VALUES(cid,owner_id,agent_id,'assigned','QA rollback only','QA-OPTIONAL-REVIEW','{}');
 UPDATE public.cases SET status='in_progress' WHERE id=cid;
 INSERT INTO public.case_location(case_id,latitude,longitude) VALUES(cid,13.08,80.27);
 INSERT INTO public.case_photos(case_id,photo_type,file_url) VALUES(cid,'QA','https://example.invalid/qa.jpg');
 INSERT INTO public.case_documents(case_id,document_type,file_name,file_url) VALUES(cid,'Sale Deed','QA.pdf','https://example.invalid/qa.pdf');
 UPDATE public.cases SET status='field_visit_done' WHERE id=cid RETURNING * INTO c;
 INSERT INTO storage.objects(bucket_id,name) VALUES('reports',cid||'/rollback-only.docx');
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'role','authenticated')::text,true);
 SET LOCAL ROLE authenticated;
 BEGIN
  PERFORM public.record_case_report(cid,'veritas',cid||'/rollback-only.docx','{}',repeat('a',64),c.revision-1);
  RAISE EXCEPTION 'Stale revision accepted';
 EXCEPTION WHEN serialization_failure THEN NULL;
 END;
 rid:=public.record_case_report(cid,'veritas',cid||'/rollback-only.docx','{}',repeat('a',64),c.revision);
 SELECT * INTO c FROM public.cases WHERE id=cid;
 IF rid IS NULL OR c.status<>'report_drafted' THEN RAISE EXCEPTION 'Report creation failed'; END IF;
 BEGIN
  PERFORM public.transition_case(cid,'in_review',c.revision);
  RAISE EXCEPTION USING ERRCODE='ZX001',MESSAGE='Senior review completeness check bypassed';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM NOT LIKE 'Complete before submitting:%' THEN RAISE; END IF;
 END;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',agent_id,'role','authenticated')::text,true);
 BEGIN
  PERFORM public.record_case_report(cid,'veritas',cid||'/rollback-only.docx','{}',repeat('a',64),c.revision);
  RAISE EXCEPTION 'Agent report creation accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $test$;
ROLLBACK;
SELECT 'PASS: empty Veritas report data accepted; stale revision and agent access rejected; senior review completeness retained; fixtures rolled back' AS result;

