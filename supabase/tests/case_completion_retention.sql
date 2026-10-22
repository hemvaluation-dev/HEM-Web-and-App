-- Every fixture and role edit rolls back; no real Storage payload is uploaded/deleted.
BEGIN;
DO $$
DECLARE cid uuid:=gen_random_uuid(); uid uuid; sample public.cases; rejected boolean:=false;
BEGIN
 SELECT id INTO uid FROM public.users WHERE role='owner' LIMIT 1;
 SELECT * INTO sample FROM public.cases LIMIT 1;
 sample.id:=cid; sample.idempotency_key:=gen_random_uuid(); sample.status:='new'; sample.application_number:='QA-RETENTION-'||cid;
 sample.created_by:=uid; sample.assigned_to:=NULL; sample.valuator_id:=uid; sample.reviewer_id:=NULL; sample.completed_at:=NULL;
 INSERT INTO public.cases SELECT sample.*;
 UPDATE public.cases SET status='report_drafted' WHERE id=cid;
 INSERT INTO public.case_reports(case_id,template_id,storage_path,case_revision,sha256)
 VALUES(cid,'QA',cid||'/qa.docx',1,repeat('0',64));
 UPDATE public.users SET role='valuator',level='L2',department='Valuation' WHERE id=uid;
 PERFORM set_config('request.jwt.claim.sub',uid::text,true);
 PERFORM set_config('request.jwt.claim.role','authenticated',true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',uid,'role','authenticated')::text,true);
 BEGIN
  UPDATE public.cases SET completed_at=now()-interval '40 days' WHERE id=cid;
 EXCEPTION WHEN others THEN rejected:=true; END;
 IF NOT rejected THEN RAISE EXCEPTION 'Client completion timestamp override allowed'; END IF;
 rejected:=false;
 BEGIN UPDATE public.cases SET status='in_review' WHERE id=cid;
 EXCEPTION WHEN others THEN rejected:=true; END;
 IF NOT rejected THEN RAISE EXCEPTION 'Retired senior workflow still allowed'; END IF;
 UPDATE public.cases SET status='completed' WHERE id=cid;
 IF NOT EXISTS(SELECT 1 FROM public.cases WHERE id=cid AND status='completed' AND completed_at=now()) THEN RAISE EXCEPTION 'Valuator completion failed'; END IF;
 PERFORM set_config('request.jwt.claim.sub','',true);
 PERFORM set_config('request.jwt.claim.role','service_role',true);
 PERFORM set_config('request.jwt.claims','{"role":"service_role"}',true);
 UPDATE public.cases SET completed_at=now()-interval '29 days' WHERE id=cid;
 IF jsonb_array_length(public.hem_retention_inventory(cid))<>0 THEN RAISE EXCEPTION 'Recent completion eligible'; END IF;
 UPDATE public.cases SET completed_at=now()-interval '31 days' WHERE id=cid;
 IF jsonb_array_length(public.hem_retention_inventory(cid))<>1 THEN RAISE EXCEPTION 'Expired completion missing'; END IF;
 INSERT INTO storage.objects(bucket_id,name) VALUES('photos',cid||'/qa.jpg');
 IF public.hem_retention_finalize(cid,now()-interval '31 days') THEN RAISE EXCEPTION 'Case removed before Storage'; END IF;
 IF public.hem_retention_finalize(cid,now()-interval '32 days') THEN RAISE EXCEPTION 'Timestamp recheck failed'; END IF;
 IF has_function_privilege('authenticated','public.hem_retention_finalize(uuid,timestamptz)','execute') OR has_function_privilege('anon','public.hem_retention_inventory(uuid)','execute') THEN RAISE EXCEPTION 'Client purge access exposed'; END IF;
END $$;
SELECT 'completion and retention safety assertions passed; all fixtures rolled back' AS result;
ROLLBACK;
