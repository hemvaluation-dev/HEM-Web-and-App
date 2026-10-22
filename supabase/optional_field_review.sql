-- Allow incomplete Data Review at field submission; retain evidence, access and review checks.
CREATE OR REPLACE FUNCTION public.hem_guard_case()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE missing text[]; is_agent boolean; previous text; target text; dossier_changed boolean;
BEGIN
 NEW.status:=public.hem_status(NEW.status);
 NEW.updated_at:=clock_timestamp();
 IF TG_OP='INSERT' THEN
  IF NEW.status NOT IN ('new','assigned') THEN RAISE EXCEPTION 'New cases must start as new or assigned'; END IF;
  RETURN NEW;
 END IF;
 NEW.revision:=OLD.revision+1;
 previous:=public.hem_status(OLD.status); target:=NEW.status;
 dossier_changed:=(to_jsonb(NEW)-ARRAY['status','revision','updated_at','submitted_at','report_drafted_at','reviewed_at','completed_at','assigned_to','reviewer_id','valuator_id']) IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['status','revision','updated_at','submitted_at','report_drafted_at','reviewed_at','completed_at','assigned_to','reviewer_id','valuator_id']);
 IF auth.uid() IS NOT NULL AND coalesce(auth.role(),'')<>'service_role' THEN
  IF NOT public.hem_case_access(OLD.id) THEN RAISE EXCEPTION 'Case access denied' USING ERRCODE='42501'; END IF;
  SELECT role='field_agent' INTO is_agent FROM public.users WHERE id=auth.uid();
  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN RAISE EXCEPTION 'The case creator cannot be changed'; END IF;
  IF (NEW.assigned_to IS DISTINCT FROM OLD.assigned_to OR NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id OR NEW.valuator_id IS DISTINCT FROM OLD.valuator_id)
   AND OLD.created_by<>auth.uid() AND NOT public.hem_owner()
   AND NOT (OLD.valuator_id IS NULL AND NEW.valuator_id=auth.uid() AND NEW.assigned_to IS NOT DISTINCT FROM OLD.assigned_to AND NEW.reviewer_id IS NOT DISTINCT FROM OLD.reviewer_id AND public.hem_valuator()) THEN RAISE EXCEPTION 'Only the case creator can reassign this case'; END IF;
  IF is_agent AND (to_jsonb(NEW)-ARRAY['extracted_data','property_type','status','updated_at','revision','submitted_at']) IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['extracted_data','property_type','status','updated_at','revision','submitted_at']) THEN RAISE EXCEPTION 'Field agents may only update inspection data'; END IF;
  IF (NEW.extracted_data IS DISTINCT FROM OLD.extracted_data OR NEW.address IS DISTINCT FROM OLD.address OR NEW.property_type IS DISTINCT FROM OLD.property_type OR NEW.applicant_name IS DISTINCT FROM OLD.applicant_name OR NEW.application_number IS DISTINCT FROM OLD.application_number OR NEW.client_id IS DISTINCT FROM OLD.client_id OR NEW.branch IS DISTINCT FROM OLD.branch OR NEW.case_type IS DISTINCT FROM OLD.case_type) AND NOT public.hem_case_edit(OLD.id) THEN RAISE EXCEPTION 'This dossier is locked. Request revisions before editing'; END IF;
  IF previous='completed' THEN RAISE EXCEPTION 'Completed cases are read only'; END IF;
  IF previous<>target THEN
   IF NOT ((previous='new' AND target IN ('assigned','in_progress')) OR (previous='assigned' AND target='in_progress') OR
    (previous='in_progress' AND target='field_visit_done') OR (previous='field_visit_done' AND target='report_drafted') OR
    (previous='report_drafted' AND target IN ('in_review','field_visit_done')) OR (previous='in_review' AND target IN ('report_drafted','reviewed')) OR
    (previous='reviewed' AND target='completed')) THEN RAISE EXCEPTION 'Invalid case transition: % to %',previous,target; END IF;
   IF target IN ('report_drafted','in_review') AND NOT public.hem_valuator() THEN RAISE EXCEPTION 'A valuator must complete this step'; END IF;
   IF (previous='in_review' OR target='completed') AND NOT public.hem_senior() THEN RAISE EXCEPTION 'Senior review permission required'; END IF;
   IF target='in_review' OR (target='field_visit_done' AND previous<>'report_drafted') THEN
    IF target='in_review' THEN
     missing:=public.hem_submission_missing(NEW.id,NEW.extracted_data);
    ELSE
     -- Field agents may submit incomplete Data Review fields. Evidence is still required.
     missing:='{}'::text[];
     IF NOT EXISTS(SELECT 1 FROM public.case_location WHERE case_id=NEW.id) THEN missing:=array_append(missing,'GPS location'); END IF;
     IF NOT EXISTS(SELECT 1 FROM public.case_documents WHERE case_id=NEW.id AND document_type NOT IN ('Audio Recording','Video Recording')) THEN missing:=array_append(missing,'property document'); END IF;
     IF NOT EXISTS(SELECT 1 FROM public.case_photos WHERE case_id=NEW.id) THEN missing:=array_append(missing,'property photo'); END IF;
    END IF;
    IF cardinality(missing)>0 THEN RAISE EXCEPTION 'Complete before submitting: %',array_to_string(missing,', '); END IF;
   END IF;
   IF previous='field_visit_done' AND target='report_drafted' AND NOT EXISTS(SELECT 1 FROM public.case_reports WHERE case_id=NEW.id AND case_revision=OLD.revision) THEN RAISE EXCEPTION 'Generate a new report from the current dossier'; END IF;
   IF target IN ('report_drafted','in_review') AND NOT EXISTS(SELECT 1 FROM public.case_reports WHERE case_id=NEW.id) THEN RAISE EXCEPTION 'Generate and save a report before review'; END IF;
  END IF;
 END IF;
 IF NEW.applicant_name IS DISTINCT FROM OLD.applicant_name THEN NEW.extracted_data:=coalesce(NEW.extracted_data,'{}')||jsonb_build_object('applicant_name',NEW.applicant_name); END IF;
 IF NEW.address IS DISTINCT FROM OLD.address THEN NEW.extracted_data:=coalesce(NEW.extracted_data,'{}')||jsonb_build_object('property_address',NEW.address); END IF;
 IF NEW.property_type IS DISTINCT FROM OLD.property_type THEN NEW.extracted_data:=coalesce(NEW.extracted_data,'{}')||jsonb_build_object('property_type',NEW.property_type); END IF;
 IF NEW.branch IS DISTINCT FROM OLD.branch THEN NEW.extracted_data:=coalesce(NEW.extracted_data,'{}')||jsonb_build_object('branch',NEW.branch); END IF;
 IF NEW.application_number IS DISTINCT FROM OLD.application_number THEN NEW.extracted_data:=coalesce(NEW.extracted_data,'{}')||jsonb_build_object('application_number',NEW.application_number); END IF;
 IF dossier_changed AND previous='report_drafted' AND target='report_drafted' THEN NEW.status:='field_visit_done'; END IF;
 IF NEW.status='field_visit_done' AND previous<>'field_visit_done' THEN NEW.submitted_at:=coalesce(OLD.submitted_at,now()); NEW.extracted_data:=NEW.extracted_data||jsonb_build_object('submitted_at',NEW.submitted_at); END IF;
 IF NEW.status='report_drafted' AND previous<>'report_drafted' THEN NEW.report_drafted_at:=now(); END IF;
 IF NEW.status='reviewed' AND previous<>'reviewed' THEN NEW.reviewed_at:=now(); END IF;
 IF NEW.status='completed' AND previous<>'completed' THEN NEW.completed_at:=now(); END IF;
 RETURN NEW;
END $function$;

