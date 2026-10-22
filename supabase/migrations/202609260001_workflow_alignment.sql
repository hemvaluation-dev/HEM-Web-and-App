-- Additive migration. Existing observations and legacy statuses are preserved in the snapshot.
BEGIN;
SET LOCAL lock_timeout = '10s';
CREATE SCHEMA IF NOT EXISTS hem_private;
REVOKE ALL ON SCHEMA hem_private FROM PUBLIC;
CREATE TABLE IF NOT EXISTS hem_private.case_alignment_backup AS SELECT * FROM public.cases;
CREATE TABLE IF NOT EXISTS hem_private.field_alignment_backup AS SELECT * FROM public.case_field_data;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS revision bigint NOT NULL DEFAULT 0;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS case_type text;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS submitted_at timestamptz;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS report_drafted_at timestamptz;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS completed_at timestamptz;

CREATE OR REPLACE FUNCTION public.hem_status(value text) RETURNS text
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
SELECT CASE lower(coalesce(value,'new'))
 WHEN 'draft' THEN 'new' WHEN 'created' THEN 'new'
 WHEN 'location_captured' THEN 'in_progress' WHEN 'photos_uploaded' THEN 'in_progress'
 WHEN 'data_drafted' THEN 'in_progress' WHEN 'documents_uploaded' THEN 'in_progress'
 WHEN 'document_uploaded' THEN 'in_progress' WHEN 'document_processing' THEN 'in_progress'
 WHEN 'submitted' THEN 'field_visit_done' WHEN 'site_inspected' THEN 'field_visit_done'
 WHEN 'site_inspection_completed' THEN 'field_visit_done'
 WHEN 'pending_review' THEN 'in_review' WHEN 'under_review' THEN 'in_review'
 WHEN 'delivered' THEN 'completed' WHEN 'approved' THEN 'completed'
 ELSE lower(coalesce(value,'new')) END $$;

-- JSON is the authoritative field document. Only fill missing values from legacy columns.
UPDATE public.cases c SET extracted_data =
 (SELECT coalesce(jsonb_object_agg(k,v),'{}'::jsonb) FROM jsonb_each(to_jsonb(f)-'id'-'case_id'-'created_at') e(k,v) WHERE v <> 'null'::jsonb AND v <> '""'::jsonb)
 || coalesce(c.extracted_data,'{}'::jsonb)
FROM public.case_field_data f WHERE f.case_id=c.id;
UPDATE public.cases SET status=public.hem_status(status), branch=coalesce(nullif(branch,''), extracted_data->>'branch');
ALTER TABLE public.cases ALTER COLUMN status SET DEFAULT 'new';
ALTER TABLE public.cases ADD CONSTRAINT hem_case_status_check CHECK(status IN ('new','assigned','in_progress','field_visit_done','report_drafted','in_review','reviewed','completed'));
UPDATE public.cases SET submitted_at=(extracted_data->>'submitted_at')::timestamptz WHERE submitted_at IS NULL AND extracted_data->>'submitted_at' ~ '^\d{4}-\d{2}-\d{2}T';

CREATE TABLE IF NOT EXISTS public.case_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
 actor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
 event_type text NOT NULL, old_status text, new_status text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.case_reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
 template_id text NOT NULL, storage_path text NOT NULL UNIQUE,
 data_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(), case_revision bigint NOT NULL,
 sha256 text NOT NULL
);
CREATE INDEX IF NOT EXISTS hem_cases_assigned_created ON public.cases(assigned_to,created_at DESC);
CREATE INDEX IF NOT EXISTS hem_cases_reviewer_created ON public.cases(reviewer_id,created_at DESC);
CREATE INDEX IF NOT EXISTS hem_cases_valuator_created ON public.cases(valuator_id,created_at DESC);
CREATE INDEX IF NOT EXISTS hem_cases_creator_created ON public.cases(created_by,created_at DESC);
CREATE INDEX IF NOT EXISTS hem_cases_status_created ON public.cases(status,created_at DESC);
CREATE INDEX IF NOT EXISTS hem_cases_client_created ON public.cases(client_id,created_at DESC);
-- Preserve legacy duplicates. Add uniqueness only when the existing data is
-- already clean; never delete or rewrite rows to force a constraint.
CREATE INDEX IF NOT EXISTS hem_location_case ON public.case_location(case_id);
CREATE INDEX IF NOT EXISTS hem_attendance_user_day ON public.attendance(user_id,date);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.case_location GROUP BY case_id HAVING count(*) > 1) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS hem_location_case_unique ON public.case_location(case_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.attendance GROUP BY user_id,date HAVING count(*) > 1) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS hem_attendance_day_unique ON public.attendance(user_id,date);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS hem_photos_case ON public.case_photos(case_id);
CREATE INDEX IF NOT EXISTS hem_documents_case ON public.case_documents(case_id);
CREATE INDEX IF NOT EXISTS hem_attendance_user_date ON public.attendance(user_id,date);
CREATE INDEX IF NOT EXISTS hem_leaves_user ON public.leaves(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS hem_reports_case ON public.case_reports(case_id,created_at DESC);
CREATE INDEX IF NOT EXISTS hem_events_case ON public.case_events(case_id,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS hem_cases_idempotency ON public.cases(idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.hem_active() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND is_active IS TRUE) $$;
CREATE OR REPLACE FUNCTION public.hem_owner() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND is_active IS TRUE AND (role='owner' OR level='L5')) $$;
CREATE OR REPLACE FUNCTION public.hem_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND is_active IS TRUE AND
 (role='owner' OR level='L5' OR (role<>'field_agent' AND (role IN ('admin','manager','lead') OR level IN ('L3','L4') OR department IN ('HR/Admin','Accounts','Valuation'))))) $$;
CREATE OR REPLACE FUNCTION public.hem_senior() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND is_active IS TRUE AND (role IN ('owner','admin','manager','lead','reviewer') OR level='L5')) $$;
CREATE OR REPLACE FUNCTION public.hem_valuator() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT public.hem_admin() OR EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND is_active IS TRUE AND role IN ('valuator','staff','editor','analyst','reviewer')) $$;
CREATE OR REPLACE FUNCTION public.hem_case_access(cid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT public.hem_active() AND EXISTS(SELECT 1 FROM public.cases WHERE id=cid AND (public.hem_admin() OR auth.uid() IN (created_by,assigned_to,reviewer_id,valuator_id))) $$;
CREATE OR REPLACE FUNCTION public.hem_case_edit(cid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT public.hem_case_access(cid) AND EXISTS(SELECT 1 FROM public.cases WHERE id=cid AND
 (status IN ('new','assigned','in_progress') OR (public.hem_valuator() AND status IN ('field_visit_done','report_drafted')))) $$;

-- All submit entry points use the same completeness validation.
CREATE OR REPLACE FUNCTION public.hem_submission_missing(cid uuid, payload jsonb) RETURNS text[]
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE required text[] := array['branch','property_address','age_of_property','no_of_floors','property_usage','structure_type','flooring_type','occupancy_details','property_documents_verified','ownership_type','quality_of_construction','interiors_exteriors','residual_life','setback_front','setback_rear','setback_right','setback_left','boundaries_document_east','boundaries_document_west','boundaries_document_north','boundaries_document_south','boundaries_physical_east','boundaries_physical_west','boundaries_physical_south','boundaries_physical_north','land_measurements_east','land_measurements_west','land_measurements_north','land_measurements_south','land_area','plinth_measurements_east','plinth_measurements_west','plinth_measurements_north','plinth_measurements_south','bua','slab_measurements_east','slab_measurements_west','slab_measurements_north','slab_measurements_south','slab_area','floor_wise_area','road_width','person_met_at_site','relationship_with_customer','stage_of_construction','stage_percentage','remarks_and_violations','class_of_locality','site_developed','proximity_amenities','within_municipal_limits','panchayat_name','site_access','landmark','gps_coordinates','address_docs','dist_railway','dist_bus','dist_city_center','approach_road_width','meter_number','meter_owner_name','bill_generated_name','meter_owner_matching','lift','lift_available','near_hazards','demarcation_available','basic_amenities','marketability','high_tension_wires','area_left_for_cross','joint_wall_slab','graveyard_nearby','property_identified_by','community_dominated','linear_dimensions','linear_dimensions_matching','land_area_as_per_physical','no_of_units','land_rate','rental_per_month','land_mismatch_reason','excess_land','boundary_mismatch_reason']; missing text[] := '{}'; key text; template text; floors int;
BEGIN
 IF NOT public.hem_case_access(cid) AND auth.uid() IS NOT NULL THEN RAISE EXCEPTION 'Case unavailable' USING ERRCODE='42501'; END IF;
 SELECT cl.template_name INTO template FROM public.cases c LEFT JOIN public.clients cl ON cl.id=c.client_id WHERE c.id=cid;
 IF template='veritas' THEN required := required || array['nhb_1991','nhb_2011','roof','eb_service','property_tax','passage_less_10ft','passage_width','distance_main_road','water_supply','drainage','condition','facilities','civic_status','deviation']; END IF;
 FOREACH key IN ARRAY required LOOP
  IF key='floor_wise_area' THEN
   floors := CASE WHEN coalesce(payload->>'no_of_floors','') ~ '^\d+$' THEN (payload->>'no_of_floors')::int ELSE 0 END;
   IF floors>0 THEN
    IF jsonb_typeof(payload->key) IS DISTINCT FROM 'array' THEN missing:=array_append(missing,key);
    ELSIF jsonb_array_length(payload->key)<floors OR EXISTS(SELECT 1 FROM jsonb_array_elements(payload->key) v WHERE coalesce(trim(v->>'floor'),'')='' OR coalesce(trim(v->>'plinthArea'),'')='' OR coalesce(trim(v->>'slabArea'),'')='') THEN missing:=array_append(missing,key); END IF;
   END IF;
  ELSIF coalesce(trim(payload->>key),'')='' THEN missing:=array_append(missing,key); END IF;
 END LOOP;
 IF NOT EXISTS(SELECT 1 FROM public.case_location WHERE case_id=cid) THEN missing:=array_append(missing,'GPS location'); END IF;
 IF NOT EXISTS(SELECT 1 FROM public.case_documents WHERE case_id=cid AND document_type NOT IN ('Audio Recording','Video Recording')) THEN missing:=array_append(missing,'property document'); END IF;
 IF NOT EXISTS(SELECT 1 FROM public.case_photos WHERE case_id=cid) THEN missing:=array_append(missing,'property photo'); END IF;
 RETURN missing;
END $$;

CREATE OR REPLACE FUNCTION public.hem_guard_case() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE missing text[]; is_agent boolean; previous text; target text;
BEGIN
 NEW.status:=public.hem_status(NEW.status);
 NEW.updated_at:=clock_timestamp();
 IF TG_OP='INSERT' THEN
  IF NEW.status NOT IN ('new','assigned') THEN RAISE EXCEPTION 'New cases must start as new or assigned'; END IF;
  RETURN NEW;
 END IF;
 NEW.revision:=OLD.revision+1;
 previous:=public.hem_status(OLD.status); target:=NEW.status;
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
    missing:=public.hem_submission_missing(NEW.id,NEW.extracted_data);
    IF cardinality(missing)>0 THEN RAISE EXCEPTION 'Complete before submitting: %',array_to_string(missing,', '); END IF;
   END IF;
   IF target IN ('report_drafted','in_review') AND NOT EXISTS(SELECT 1 FROM public.case_reports WHERE case_id=NEW.id) THEN RAISE EXCEPTION 'Generate and save a report before review'; END IF;
  END IF;
 END IF;
 IF NEW.applicant_name IS DISTINCT FROM OLD.applicant_name THEN NEW.extracted_data:=coalesce(NEW.extracted_data,'{}')||jsonb_build_object('applicant_name',NEW.applicant_name); END IF;
 IF NEW.address IS DISTINCT FROM OLD.address THEN NEW.extracted_data:=coalesce(NEW.extracted_data,'{}')||jsonb_build_object('property_address',NEW.address); END IF;
 IF NEW.property_type IS DISTINCT FROM OLD.property_type THEN NEW.extracted_data:=coalesce(NEW.extracted_data,'{}')||jsonb_build_object('property_type',NEW.property_type); END IF;
 IF NEW.extracted_data IS DISTINCT FROM OLD.extracted_data AND previous='report_drafted' AND target='report_drafted' THEN NEW.status:='field_visit_done'; END IF;
 IF NEW.status='field_visit_done' AND previous<>'field_visit_done' THEN NEW.submitted_at:=coalesce(OLD.submitted_at,now()); NEW.extracted_data:=NEW.extracted_data||jsonb_build_object('submitted_at',NEW.submitted_at); END IF;
 IF NEW.status='report_drafted' AND previous<>'report_drafted' THEN NEW.report_drafted_at:=now(); END IF;
 IF NEW.status='reviewed' AND previous<>'reviewed' THEN NEW.reviewed_at:=now(); END IF;
 IF NEW.status='completed' AND previous<>'completed' THEN NEW.completed_at:=now(); END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS hem_case_guard ON public.cases;
CREATE TRIGGER hem_case_guard BEFORE INSERT OR UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.hem_guard_case();
CREATE OR REPLACE FUNCTION public.hem_case_audit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_OP='INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
 INSERT INTO public.case_events(case_id,actor_id,event_type,old_status,new_status) VALUES(NEW.id,auth.uid(),CASE WHEN TG_OP='INSERT' THEN 'created' ELSE 'status_changed' END,CASE WHEN TG_OP='INSERT' THEN NULL ELSE OLD.status END,NEW.status);
 END IF; RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS hem_case_audit ON public.cases;
CREATE TRIGGER hem_case_audit AFTER INSERT OR UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.hem_case_audit();

CREATE OR REPLACE FUNCTION public.save_case_data(p_case_id uuid,p_data jsonb,p_expected_revision bigint,p_submit boolean DEFAULT false) RETURNS public.cases
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE c public.cases;
BEGIN
 SELECT * INTO c FROM public.cases WHERE id=p_case_id FOR UPDATE;
 IF NOT FOUND OR NOT public.hem_case_edit(p_case_id) THEN RAISE EXCEPTION 'This case cannot be edited' USING ERRCODE='42501'; END IF;
 IF p_expected_revision IS NULL OR c.revision<>p_expected_revision THEN RAISE EXCEPTION 'This case changed. Refresh before saving' USING ERRCODE='40001'; END IF;
 IF jsonb_typeof(p_data) IS DISTINCT FROM 'object' OR octet_length(p_data::text)>200000 THEN RAISE EXCEPTION 'Invalid field data'; END IF;
 UPDATE public.cases SET extracted_data=coalesce(extracted_data,'{}') || (p_data-ARRAY['id','case_id','created_at','updated_at','created_by','user_id','__proto__','constructor','prototype']),
 status=CASE WHEN p_submit THEN 'field_visit_done' WHEN status IN ('new','assigned') THEN 'in_progress' ELSE status END
 WHERE id=p_case_id RETURNING * INTO c;
 RETURN c;
END $$;
CREATE OR REPLACE FUNCTION public.transition_case(p_case_id uuid,p_status text,p_expected_revision bigint) RETURNS public.cases
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE c public.cases;
BEGIN
 SELECT * INTO c FROM public.cases WHERE id=p_case_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Case unavailable' USING ERRCODE='42501'; END IF;
 IF p_expected_revision IS NULL OR c.revision<>p_expected_revision THEN RAISE EXCEPTION 'This case changed. Refresh before continuing' USING ERRCODE='40001'; END IF;
 UPDATE public.cases SET status=public.hem_status(p_status) WHERE id=p_case_id RETURNING * INTO c;
 RETURN c;
END $$;
CREATE OR REPLACE FUNCTION public.claim_case(p_case_id uuid) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF NOT public.hem_valuator() THEN RAISE EXCEPTION 'Valuator permission required' USING ERRCODE='42501'; END IF;
 UPDATE public.cases SET valuator_id=auth.uid() WHERE id=p_case_id AND valuator_id IS NULL AND status='field_visit_done';
 IF NOT FOUND THEN RAISE EXCEPTION 'This case was already claimed or is not ready'; END IF;
END $$;
CREATE OR REPLACE FUNCTION public.record_case_report(p_case_id uuid,p_template_id text,p_storage_path text,p_data jsonb,p_sha256 text,p_expected_revision bigint) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.cases; report_id uuid; missing text[];
BEGIN
 SELECT * INTO c FROM public.cases WHERE id=p_case_id FOR UPDATE;
 IF NOT FOUND OR NOT public.hem_case_access(p_case_id) OR NOT public.hem_valuator() OR c.status NOT IN ('field_visit_done','report_drafted') THEN RAISE EXCEPTION 'Submit the field dossier before generating a report' USING ERRCODE='42501'; END IF;
 IF p_expected_revision IS NULL OR c.revision<>p_expected_revision THEN RAISE EXCEPTION 'This case changed during report generation. Refresh and try again' USING ERRCODE='40001'; END IF;
 missing:=public.hem_submission_missing(p_case_id,c.extracted_data);
 IF cardinality(missing)>0 THEN RAISE EXCEPTION 'Complete dossier before report generation: %',array_to_string(missing,', '); END IF;
 IF jsonb_typeof(p_data) IS DISTINCT FROM 'object' OR p_sha256 !~ '^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'Invalid report metadata'; END IF;
 IF split_part(p_storage_path,'/',1)<>p_case_id::text OR NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='reports' AND name=p_storage_path) THEN RAISE EXCEPTION 'Report artifact is missing'; END IF;
 INSERT INTO public.case_reports(case_id,template_id,storage_path,data_snapshot,created_by,case_revision,sha256)
 VALUES(p_case_id,p_template_id,p_storage_path,p_data,auth.uid(),c.revision,p_sha256) RETURNING id INTO report_id;
 UPDATE public.cases SET status='report_drafted', report_drafted_at=now() WHERE id=p_case_id;
 RETURN report_id;
END $$;

CREATE OR REPLACE FUNCTION public.hem_evidence_changed() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE cid uuid;
BEGIN
 cid:=CASE WHEN TG_OP='DELETE' THEN OLD.case_id ELSE NEW.case_id END;
 UPDATE public.cases SET status=CASE WHEN status='report_drafted' THEN 'field_visit_done' ELSE status END WHERE id=cid;
 RETURN NULL;
END $$;
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['case_location','case_photos','case_documents'] LOOP
  EXECUTE format('CREATE TRIGGER hem_evidence_changed AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.hem_evidence_changed()',t);
 END LOOP;
END $$;

-- Replace the reconstructed allow-all policies. No customer rows are removed.
DO $$ DECLARE t text; p record; BEGIN
 FOREACH t IN ARRAY ARRAY['users','clients','cases','case_location','case_photos','case_documents','case_field_data','attendance','leaves','case_reports','case_events'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,t); END LOOP;
 END LOOP;
END $$;
CREATE POLICY hem_users_read ON public.users FOR SELECT TO authenticated USING (public.hem_active() AND (id=auth.uid() OR public.hem_admin()));
CREATE POLICY hem_users_owner ON public.users FOR ALL TO authenticated USING(public.hem_owner()) WITH CHECK(public.hem_owner());
CREATE POLICY hem_clients_read ON public.clients FOR SELECT TO authenticated USING(public.hem_active());
CREATE POLICY hem_clients_write ON public.clients FOR ALL TO authenticated USING(public.hem_admin()) WITH CHECK(public.hem_admin());
CREATE POLICY hem_cases_read ON public.cases FOR SELECT TO authenticated USING(public.hem_case_access(id));
CREATE POLICY hem_cases_insert ON public.cases FOR INSERT TO authenticated WITH CHECK(public.hem_admin() AND created_by=auth.uid());
CREATE POLICY hem_cases_update ON public.cases FOR UPDATE TO authenticated USING(public.hem_case_access(id)) WITH CHECK(public.hem_case_access(id));
CREATE POLICY hem_cases_delete ON public.cases FOR DELETE TO authenticated USING(public.hem_owner());
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['case_location','case_photos','case_documents'] LOOP
  EXECUTE format('CREATE POLICY hem_evidence_read ON public.%I FOR SELECT TO authenticated USING(public.hem_case_access(case_id))',t);
  EXECUTE format('CREATE POLICY hem_evidence_write ON public.%I FOR ALL TO authenticated USING(public.hem_case_edit(case_id)) WITH CHECK(public.hem_case_edit(case_id))',t);
 END LOOP;
END $$;
CREATE POLICY hem_legacy_read ON public.case_field_data FOR SELECT TO authenticated USING(public.hem_case_access(case_id));
CREATE POLICY hem_reports_read ON public.case_reports FOR SELECT TO authenticated USING(public.hem_case_access(case_id));
REVOKE INSERT, UPDATE, DELETE ON public.case_reports, public.case_events FROM anon, authenticated;
GRANT SELECT ON public.case_reports, public.case_events TO authenticated;
CREATE POLICY hem_events_read ON public.case_events FOR SELECT TO authenticated USING(public.hem_case_access(case_id));
CREATE POLICY hem_attendance_read ON public.attendance FOR SELECT TO authenticated USING(public.hem_active() AND (user_id=auth.uid() OR public.hem_admin()));
CREATE POLICY hem_attendance_write ON public.attendance FOR ALL TO authenticated USING(public.hem_active() AND user_id=auth.uid()) WITH CHECK(public.hem_active() AND user_id=auth.uid());
CREATE POLICY hem_leaves_read ON public.leaves FOR SELECT TO authenticated USING(public.hem_active() AND (user_id=auth.uid() OR public.hem_admin()));
CREATE POLICY hem_leaves_insert ON public.leaves FOR INSERT TO authenticated WITH CHECK(public.hem_active() AND user_id=auth.uid() AND status='pending' AND start_date<=end_date);
CREATE POLICY hem_leaves_update ON public.leaves FOR UPDATE TO authenticated USING(public.hem_active() AND (user_id=auth.uid() OR public.hem_admin())) WITH CHECK(public.hem_active() AND (user_id=auth.uid() OR public.hem_admin()));
CREATE OR REPLACE FUNCTION public.hem_guard_leave() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.start_date>NEW.end_date THEN RAISE EXCEPTION 'End date must be on or after start date'; END IF;
 IF auth.uid() IS NULL OR auth.role()='service_role' THEN RETURN NEW; END IF;
 IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.start_date IS DISTINCT FROM OLD.start_date OR NEW.end_date IS DISTINCT FROM OLD.end_date OR NEW.reason IS DISTINCT FROM OLD.reason THEN RAISE EXCEPTION 'Withdraw and resubmit to change a leave request'; END IF;
 IF OLD.status NOT IN ('pending','pending_owner') THEN RAISE EXCEPTION 'This leave request is already resolved'; END IF;
 IF OLD.user_id=auth.uid() THEN
  IF NEW.status<>'withdrawn' THEN RAISE EXCEPTION 'You cannot approve your own leave'; END IF;
 ELSE
  IF NOT EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND is_active IS TRUE AND (role IN ('owner','admin','manager','lead') OR level='L5' OR department='HR/Admin')) THEN RAISE EXCEPTION 'Leave approval permission required'; END IF;
  IF OLD.status='pending_owner' AND NOT public.hem_owner() THEN RAISE EXCEPTION 'Owner approval required'; END IF;
  IF NEW.status NOT IN ('pending_owner','approved','rejected') OR (NEW.status='approved' AND NOT public.hem_owner()) THEN RAISE EXCEPTION 'Invalid leave approval stage'; END IF;
 END IF; RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS hem_leave_guard ON public.leaves;
CREATE TRIGGER hem_leave_guard BEFORE UPDATE ON public.leaves FOR EACH ROW EXECUTE FUNCTION public.hem_guard_leave();

INSERT INTO storage.buckets(id,name,public) VALUES('reports','reports',false) ON CONFLICT(id) DO NOTHING;
CREATE OR REPLACE FUNCTION public.hem_object_case(path text) RETURNS uuid LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 SELECT CASE WHEN split_part(path,'/',1) ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN split_part(path,'/',1)::uuid ELSE NULL END $$;
DO $$ DECLARE p record; BEGIN
 FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname IN ('Give public access to documents','Allow authenticated uploads to documents','Give public access to photos','Allow authenticated uploads to photos','Allow delete') LOOP
  EXECUTE format('DROP POLICY %I ON storage.objects',p.policyname);
 END LOOP;
END $$;
UPDATE storage.buckets SET public=false WHERE id IN ('photos','documents','reports');
CREATE POLICY hem_files_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id IN ('photos','documents','reports') AND public.hem_case_access(public.hem_object_case(name)));
CREATE POLICY hem_files_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id IN ('photos','documents','reports') AND public.hem_case_edit(public.hem_object_case(name)) AND (bucket_id<>'reports' OR public.hem_valuator()));
CREATE POLICY hem_files_delete ON storage.objects FOR DELETE TO authenticated USING(bucket_id IN ('photos','documents','reports') AND public.hem_case_edit(public.hem_object_case(name)) AND (bucket_id<>'reports' OR NOT EXISTS(SELECT 1 FROM public.case_reports WHERE storage_path=name)));

REVOKE ALL ON FUNCTION public.save_case_data(uuid,jsonb,bigint,boolean), public.transition_case(uuid,text,bigint), public.claim_case(uuid), public.record_case_report(uuid,text,text,jsonb,text,bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_case_data(uuid,jsonb,bigint,boolean), public.transition_case(uuid,text,bigint), public.claim_case(uuid), public.record_case_report(uuid,text,text,jsonb,text,bigint) TO authenticated;
REVOKE ALL ON FUNCTION public.hem_submission_missing(uuid,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hem_submission_missing(uuid,jsonb) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
