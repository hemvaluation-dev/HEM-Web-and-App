-- Reconstruct verified HEM application schema. No case/user data or credentials.

SET check_function_bodies = false;

CREATE SCHEMA IF NOT EXISTS "hem_private";

REVOKE ALL ON SCHEMA "hem_private" FROM PUBLIC, anon, authenticated;

CREATE SCHEMA IF NOT EXISTS "hem_push_private";

REVOKE ALL ON SCHEMA "hem_push_private" FROM PUBLIC, anon, authenticated;

CREATE TABLE "public"."case_location" (
 "id" uuid DEFAULT gen_random_uuid() NOT NULL,
 "case_id" uuid,
 "latitude" double precision,
 "longitude" double precision,
 "accuracy" double precision,
 "address_from_gps" text,
 "city" text,
 "state" text,
 "pincode" text,
 "nearest_bus_stop" text,
 "nearest_railway" text,
 "nearest_hospital" text,
 "nearest_airport" text,
 "nearest_highway" text,
 "nearest_park" text,
 "created_at" timestamp with time zone DEFAULT now(),
 "altitude" double precision DEFAULT 0,
 "address" text
);

ALTER TABLE "public"."case_location" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."case_location" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."case_location" TO service_role;

CREATE TABLE "public"."case_photos" (
 "id" uuid DEFAULT gen_random_uuid() NOT NULL,
 "case_id" uuid,
 "photo_type" text,
 "file_url" text,
 "original_file_url" text,
 "latitude" double precision,
 "longitude" double precision,
 "created_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE "public"."case_photos" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."case_photos" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."case_photos" TO service_role;

CREATE TABLE "public"."case_documents" (
 "id" uuid DEFAULT gen_random_uuid() NOT NULL,
 "case_id" uuid,
 "document_type" text,
 "file_url" text,
 "file_name" text,
 "extracted_data" jsonb DEFAULT '{}'::jsonb,
 "created_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE "public"."case_documents" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."case_documents" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."case_documents" TO service_role;

CREATE TABLE "public"."extracted_data" (
 "id" uuid DEFAULT gen_random_uuid() NOT NULL,
 "case_id" uuid,
 "extracted_fields" jsonb DEFAULT '{}'::jsonb,
 "status" text DEFAULT 'completed'::text,
 "created_at" timestamp with time zone DEFAULT now(),
 "updated_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE "public"."extracted_data" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."extracted_data" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."extracted_data" TO service_role;

CREATE TABLE "public"."cases" (
 "id" uuid DEFAULT gen_random_uuid() NOT NULL,
 "application_number" text,
 "applicant_name" text,
 "phone_number" text,
 "address" text,
 "property_type" text,
 "client_id" uuid,
 "assigned_to" uuid,
 "reviewer_id" uuid,
 "created_by" uuid,
 "status" text DEFAULT 'new'::text,
 "extracted_data" jsonb DEFAULT '{}'::jsonb,
 "created_at" timestamp with time zone DEFAULT now(),
 "updated_at" timestamp with time zone DEFAULT now(),
 "valuator_id" uuid,
 "deadline_date" timestamp with time zone,
 "state" text,
 "idempotency_key" text,
 "case_type" text,
 "revision" bigint DEFAULT 0 NOT NULL,
 "submitted_at" timestamp with time zone,
 "report_drafted_at" timestamp with time zone,
 "reviewed_at" timestamp with time zone,
 "completed_at" timestamp with time zone,
 "branch" text,
 "customer_response_remark" text
);

ALTER TABLE "public"."cases" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."cases" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."cases" TO service_role;

CREATE TABLE "public"."case_field_data" (
 "id" uuid DEFAULT gen_random_uuid() NOT NULL,
 "case_id" uuid,
 "property_address" text,
 "property_type" text,
 "owner_name" text,
 "occupancy_status" text,
 "age_of_building" integer,
 "number_of_floors" integer,
 "built_up_area" double precision,
 "carpet_area" double precision,
 "land_area" double precision,
 "construction_type" text,
 "roof_type" text,
 "flooring_type" text,
 "wiring_type" text,
 "plumbing_type" text,
 "interior_condition" text,
 "exterior_condition" text,
 "structural_faults" text,
 "boundary_wall" text,
 "gate_type" text,
 "water_supply" text,
 "electricity_supply" text,
 "drainage_system" text,
 "neighborhood_type" text,
 "road_width" double precision,
 "road_type" text,
 "market_value_estimate" double precision,
 "forced_sale_value" double precision,
 "rent_estimate" double precision,
 "remarks" text,
 "data" jsonb DEFAULT '{}'::jsonb,
 "created_at" timestamp with time zone DEFAULT now(),
 "updated_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE "public"."case_field_data" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."case_field_data" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."case_field_data" TO service_role;

CREATE TABLE "public"."attendance" (
 "id" uuid DEFAULT gen_random_uuid() NOT NULL,
 "user_id" uuid,
 "date" date NOT NULL,
 "check_in_time" timestamp with time zone,
 "check_out_time" timestamp with time zone,
 "check_in_location" jsonb,
 "check_out_location" jsonb,
 "status" text DEFAULT 'Present'::text,
 "created_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE "public"."attendance" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."attendance" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."attendance" TO service_role;

CREATE TABLE "public"."leaves" (
 "id" uuid DEFAULT gen_random_uuid() NOT NULL,
 "user_id" uuid,
 "start_date" date NOT NULL,
 "end_date" date NOT NULL,
 "reason" text,
 "status" text DEFAULT 'pending'::text,
 "created_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE "public"."leaves" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."leaves" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."leaves" TO service_role;

CREATE TABLE "public"."users" (
 "id" uuid NOT NULL,
 "auth_id" uuid,
 "email" text NOT NULL,
 "full_name" text,
 "phone" text,
 "address" text,
 "role" text DEFAULT 'field_agent'::text,
 "department" text DEFAULT 'Field Operations'::text,
 "level" text DEFAULT 'L1'::text,
 "is_active" boolean DEFAULT true,
 "created_at" timestamp with time zone DEFAULT now(),
 "reporting_manager" text,
 "state" text
);

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."users" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."users" TO service_role;

CREATE TABLE "public"."clients" (
 "id" uuid DEFAULT gen_random_uuid() NOT NULL,
 "name" text NOT NULL,
 "template_name" text,
 "created_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."clients" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."clients" TO service_role;

CREATE TABLE "public"."hem_mapping_cache" (
 "cache_key" text NOT NULL,
 "payload" jsonb NOT NULL,
 "expires_at" timestamp with time zone NOT NULL
);

ALTER TABLE "public"."hem_mapping_cache" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."hem_mapping_cache" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."hem_mapping_cache" TO service_role;

CREATE TABLE "public"."hem_mapping_request_slots" (
 "provider" text NOT NULL,
 "next_allowed_at" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL
);

ALTER TABLE "public"."hem_mapping_request_slots" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."hem_mapping_request_slots" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."hem_mapping_request_slots" TO service_role;

CREATE TABLE "public"."hem_push_devices" (
 "token" text NOT NULL,
 "user_id" uuid NOT NULL,
 "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "public"."hem_push_devices" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."hem_push_devices" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."hem_push_devices" TO service_role;

CREATE TABLE "public"."hem_assignment_notifications" (
 "id" uuid DEFAULT gen_random_uuid() NOT NULL,
 "case_id" uuid NOT NULL,
 "user_id" uuid NOT NULL,
 "created_at" timestamp with time zone DEFAULT now() NOT NULL,
 "status" text DEFAULT 'pending'::text NOT NULL,
 "attempts" integer DEFAULT 0 NOT NULL,
 "locked_until" timestamp with time zone,
 "finished_at" timestamp with time zone
);

ALTER TABLE "public"."hem_assignment_notifications" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."hem_assignment_notifications" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."hem_assignment_notifications" TO service_role;

CREATE TABLE "public"."hem_push_deliveries" (
 "event_id" uuid NOT NULL,
 "token" text NOT NULL
);

ALTER TABLE "public"."hem_push_deliveries" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."hem_push_deliveries" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."hem_push_deliveries" TO service_role;

CREATE TABLE "hem_private"."case_alignment_backup" (
 "id" uuid,
 "application_number" text,
 "applicant_name" text,
 "phone_number" text,
 "address" text,
 "property_type" text,
 "client_id" uuid,
 "assigned_to" uuid,
 "reviewer_id" uuid,
 "created_by" uuid,
 "status" text,
 "extracted_data" jsonb,
 "created_at" timestamp with time zone,
 "updated_at" timestamp with time zone,
 "valuator_id" uuid,
 "deadline_date" timestamp with time zone,
 "state" text,
 "idempotency_key" text,
 "case_type" text
);

ALTER TABLE "hem_private"."case_alignment_backup" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "hem_private"."case_alignment_backup" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "hem_private"."case_alignment_backup" TO service_role;

CREATE TABLE "hem_private"."field_alignment_backup" (
 "id" uuid,
 "case_id" uuid,
 "property_address" text,
 "property_type" text,
 "owner_name" text,
 "occupancy_status" text,
 "age_of_building" integer,
 "number_of_floors" integer,
 "built_up_area" double precision,
 "carpet_area" double precision,
 "land_area" double precision,
 "construction_type" text,
 "roof_type" text,
 "flooring_type" text,
 "wiring_type" text,
 "plumbing_type" text,
 "interior_condition" text,
 "exterior_condition" text,
 "structural_faults" text,
 "boundary_wall" text,
 "gate_type" text,
 "water_supply" text,
 "electricity_supply" text,
 "drainage_system" text,
 "neighborhood_type" text,
 "road_width" double precision,
 "road_type" text,
 "market_value_estimate" double precision,
 "forced_sale_value" double precision,
 "rent_estimate" double precision,
 "remarks" text,
 "data" jsonb,
 "created_at" timestamp with time zone,
 "updated_at" timestamp with time zone
);

ALTER TABLE "hem_private"."field_alignment_backup" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "hem_private"."field_alignment_backup" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "hem_private"."field_alignment_backup" TO service_role;

CREATE TABLE "public"."case_reports" (
 "id" uuid DEFAULT gen_random_uuid() NOT NULL,
 "case_id" uuid NOT NULL,
 "template_id" text NOT NULL,
 "storage_path" text NOT NULL,
 "data_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
 "created_by" uuid,
 "created_at" timestamp with time zone DEFAULT now() NOT NULL,
 "case_revision" bigint NOT NULL,
 "sha256" text NOT NULL
);

ALTER TABLE "public"."case_reports" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."case_reports" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."case_reports" TO service_role;

CREATE TABLE "public"."case_events" (
 "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
 "case_id" uuid NOT NULL,
 "actor_id" uuid,
 "event_type" text NOT NULL,
 "old_status" text,
 "new_status" text,
 "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "public"."case_events" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."case_events" FROM PUBLIC, anon, authenticated;

GRANT ALL ON "public"."case_events" TO service_role;

ALTER TABLE "public"."case_location" ADD CONSTRAINT "case_location_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."case_photos" ADD CONSTRAINT "case_photos_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."case_documents" ADD CONSTRAINT "case_documents_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."extracted_data" ADD CONSTRAINT "extracted_data_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."case_field_data" ADD CONSTRAINT "case_field_data_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."leaves" ADD CONSTRAINT "leaves_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."hem_mapping_cache" ADD CONSTRAINT "hem_mapping_cache_pkey" PRIMARY KEY (cache_key);

ALTER TABLE "public"."hem_mapping_request_slots" ADD CONSTRAINT "hem_mapping_request_slots_pkey" PRIMARY KEY (provider);

ALTER TABLE "public"."hem_push_devices" ADD CONSTRAINT "hem_push_devices_pkey" PRIMARY KEY (token);

ALTER TABLE "public"."hem_assignment_notifications" ADD CONSTRAINT "hem_assignment_notifications_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."hem_push_deliveries" ADD CONSTRAINT "hem_push_deliveries_pkey" PRIMARY KEY (event_id, token);

ALTER TABLE "public"."case_reports" ADD CONSTRAINT "case_reports_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."case_events" ADD CONSTRAINT "case_events_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."case_location" ADD CONSTRAINT "case_location_case_id_key" UNIQUE (case_id);

ALTER TABLE "public"."extracted_data" ADD CONSTRAINT "extracted_data_case_id_key" UNIQUE (case_id);

ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_idempotency_key_key" UNIQUE (idempotency_key);

ALTER TABLE "public"."case_field_data" ADD CONSTRAINT "case_field_data_case_id_key" UNIQUE (case_id);

ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_user_id_date_key" UNIQUE (user_id, date);

ALTER TABLE "public"."users" ADD CONSTRAINT "users_email_key" UNIQUE (email);

ALTER TABLE "public"."case_reports" ADD CONSTRAINT "case_reports_storage_path_key" UNIQUE (storage_path);

ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_customer_response_remark_check" CHECK (char_length(customer_response_remark) <= 2000);

ALTER TABLE "public"."cases" ADD CONSTRAINT "hem_case_status_check" CHECK (status = ANY (ARRAY['new'::text, 'assigned'::text, 'in_progress'::text, 'field_visit_done'::text, 'report_drafted'::text, 'in_review'::text, 'reviewed'::text, 'completed'::text]));

ALTER TABLE "public"."hem_push_devices" ADD CONSTRAINT "hem_push_devices_token_check" CHECK (length(token) >= 20 AND length(token) <= 4096);

ALTER TABLE "public"."hem_assignment_notifications" ADD CONSTRAINT "hem_assignment_notifications_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'sent'::text, 'skipped'::text, 'failed'::text]));

ALTER TABLE "public"."case_location" ADD CONSTRAINT "case_location_case_id_fkey" FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

ALTER TABLE "public"."case_photos" ADD CONSTRAINT "case_photos_case_id_fkey" FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

ALTER TABLE "public"."case_documents" ADD CONSTRAINT "case_documents_case_id_fkey" FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

ALTER TABLE "public"."extracted_data" ADD CONSTRAINT "extracted_data_case_id_fkey" FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_reviewer_id_fkey" FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_valuator_id_fkey" FOREIGN KEY (valuator_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE "public"."case_field_data" ADD CONSTRAINT "case_field_data_case_id_fkey" FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE "public"."leaves" ADD CONSTRAINT "leaves_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE "public"."users" ADD CONSTRAINT "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."hem_push_devices" ADD CONSTRAINT "hem_push_devices_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE "public"."hem_assignment_notifications" ADD CONSTRAINT "hem_assignment_notifications_case_id_fkey" FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

ALTER TABLE "public"."hem_assignment_notifications" ADD CONSTRAINT "hem_assignment_notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE "public"."hem_push_deliveries" ADD CONSTRAINT "hem_push_deliveries_event_id_fkey" FOREIGN KEY (event_id) REFERENCES hem_assignment_notifications(id) ON DELETE CASCADE;

ALTER TABLE "public"."case_reports" ADD CONSTRAINT "case_reports_case_id_fkey" FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

ALTER TABLE "public"."case_reports" ADD CONSTRAINT "case_reports_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE "public"."case_events" ADD CONSTRAINT "case_events_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE "public"."case_events" ADD CONSTRAINT "case_events_case_id_fkey" FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

CREATE INDEX hem_location_case ON public.case_location USING btree (case_id);

CREATE UNIQUE INDEX hem_location_case_unique ON public.case_location USING btree (case_id);

CREATE INDEX hem_photos_case ON public.case_photos USING btree (case_id);

CREATE INDEX hem_documents_case ON public.case_documents USING btree (case_id);

CREATE INDEX hem_cases_assigned_created ON public.cases USING btree (assigned_to, created_at DESC);

CREATE INDEX hem_cases_reviewer_created ON public.cases USING btree (reviewer_id, created_at DESC);

CREATE INDEX hem_cases_valuator_created ON public.cases USING btree (valuator_id, created_at DESC);

CREATE INDEX hem_cases_creator_created ON public.cases USING btree (created_by, created_at DESC);

CREATE INDEX hem_cases_status_created ON public.cases USING btree (status, created_at DESC);

CREATE INDEX hem_cases_client_created ON public.cases USING btree (client_id, created_at DESC);

CREATE UNIQUE INDEX hem_cases_idempotency ON public.cases USING btree (idempotency_key) WHERE (idempotency_key IS NOT NULL);

CREATE INDEX hem_attendance_user_day ON public.attendance USING btree (user_id, date);

CREATE INDEX hem_attendance_user_date ON public.attendance USING btree (user_id, date);

CREATE UNIQUE INDEX hem_attendance_day_unique ON public.attendance USING btree (user_id, date);

CREATE INDEX hem_leaves_user ON public.leaves USING btree (user_id, created_at DESC);

CREATE INDEX hem_mapping_cache_expiry ON public.hem_mapping_cache USING btree (expires_at);

CREATE INDEX hem_push_devices_user ON public.hem_push_devices USING btree (user_id);

CREATE INDEX hem_assignment_notifications_pending ON public.hem_assignment_notifications USING btree (status, created_at);

CREATE INDEX hem_reports_case ON public.case_reports USING btree (case_id, created_at DESC);

CREATE INDEX hem_events_case ON public.case_events USING btree (case_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

REVOKE ALL ON FUNCTION "public"."rls_auto_enable"() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO service_role;

CREATE OR REPLACE FUNCTION public.hem_case_access(cid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT public.hem_active() AND EXISTS(SELECT 1 FROM public.cases WHERE id=cid AND (public.hem_admin() OR auth.uid() IN (created_by,assigned_to,reviewer_id,valuator_id))) $function$
;

REVOKE ALL ON FUNCTION "public"."hem_case_access"(cid uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_case_access"(cid uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_case_access"(cid uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.hem_case_edit(cid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT public.hem_case_access(cid) AND EXISTS(SELECT 1 FROM public.cases WHERE id=cid AND
 (status IN ('new','assigned','in_progress') OR (public.hem_valuator() AND status IN ('field_visit_done','report_drafted')))) $function$
;

REVOKE ALL ON FUNCTION "public"."hem_case_edit"(cid uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_case_edit"(cid uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_case_edit"(cid uuid) TO service_role;

CREATE OR REPLACE FUNCTION hem_push_private.register_push_device(p_token text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if auth.uid() is null or not exists(select 1 from public.users where id=auth.uid() and is_active=true) then
  raise exception 'Active account required' using errcode='42501';
 end if;
 if length(p_token) not between 20 and 4096 then raise exception 'Invalid token'; end if;
 delete from public.hem_push_devices where updated_at < now()-interval '90 days';
 if (select count(*) from public.hem_push_devices where user_id=auth.uid()) >= 10
 and not exists(select 1 from public.hem_push_devices where token=p_token and user_id=auth.uid()) then
  delete from public.hem_push_devices where token=(select token from public.hem_push_devices where user_id=auth.uid() order by updated_at limit 1);
 end if;
 insert into public.hem_push_devices(token,user_id) values(p_token,auth.uid())
 on conflict(token) do update set user_id=excluded.user_id,updated_at=now();
end $function$
;

REVOKE ALL ON FUNCTION "hem_push_private"."register_push_device"(p_token text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "hem_push_private"."register_push_device"(p_token text) TO authenticated;

CREATE OR REPLACE FUNCTION hem_push_private.unregister_push_device(p_token text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
 delete from public.hem_push_devices where token=p_token and user_id=auth.uid();
$function$
;

REVOKE ALL ON FUNCTION "hem_push_private"."unregister_push_device"(p_token text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "hem_push_private"."unregister_push_device"(p_token text) TO authenticated;

CREATE OR REPLACE FUNCTION public.hem_register_push_device(p_token text)
 RETURNS void
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select hem_push_private.register_push_device(p_token); $function$
;

REVOKE ALL ON FUNCTION "public"."hem_register_push_device"(p_token text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_register_push_device"(p_token text) TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_register_push_device"(p_token text) TO service_role;

CREATE OR REPLACE FUNCTION public.hem_unregister_push_device(p_token text)
 RETURNS void
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select hem_push_private.unregister_push_device(p_token); $function$
;

REVOKE ALL ON FUNCTION "public"."hem_unregister_push_device"(p_token text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_unregister_push_device"(p_token text) TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_unregister_push_device"(p_token text) TO service_role;

CREATE OR REPLACE FUNCTION hem_push_private.enqueue_assignment_push()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if new.assigned_to is not null then
  if TG_OP='INSERT' then
   insert into public.hem_assignment_notifications(case_id,user_id) values(new.id,new.assigned_to);
  elsif new.assigned_to is distinct from old.assigned_to then
   insert into public.hem_assignment_notifications(case_id,user_id) values(new.id,new.assigned_to);
  end if;
 end if;
 -- Bounded history; cascading delivery cleanup. No case data is deleted.
 delete from public.hem_assignment_notifications where created_at < now()-interval '30 days';
 return new;
end $function$
;

REVOKE ALL ON FUNCTION "hem_push_private"."enqueue_assignment_push"() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.hem_claim_assignment_push(p_id uuid)
 RETURNS SETOF hem_assignment_notifications
 LANGUAGE sql
 SET search_path TO ''
AS $function$
 update public.hem_assignment_notifications set status='processing',attempts=attempts+1,locked_until=now()+interval '2 minutes'
 where id=p_id and created_at>now()-interval '24 hours' and attempts<5
 and (status='pending' or (status='processing' and locked_until<now())) returning *;
$function$
;

REVOKE ALL ON FUNCTION "public"."hem_claim_assignment_push"(p_id uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_claim_assignment_push"(p_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.hem_status(value text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
SELECT CASE lower(coalesce(value,'new'))
 WHEN 'draft' THEN 'new' WHEN 'created' THEN 'new'
 WHEN 'location_captured' THEN 'in_progress' WHEN 'photos_uploaded' THEN 'in_progress'
 WHEN 'data_drafted' THEN 'in_progress' WHEN 'documents_uploaded' THEN 'in_progress'
 WHEN 'document_uploaded' THEN 'in_progress' WHEN 'document_processing' THEN 'in_progress'
 WHEN 'submitted' THEN 'field_visit_done' WHEN 'site_inspected' THEN 'field_visit_done'
 WHEN 'site_inspection_completed' THEN 'field_visit_done'
 WHEN 'pending_review' THEN 'in_review' WHEN 'under_review' THEN 'in_review'
 WHEN 'delivered' THEN 'completed' WHEN 'approved' THEN 'completed'
 ELSE lower(coalesce(value,'new')) END $function$
;

REVOKE ALL ON FUNCTION "public"."hem_status"(value text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_status"(value text) TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_status"(value text) TO service_role;

CREATE OR REPLACE FUNCTION public.hem_active()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND is_active IS TRUE) $function$
;

REVOKE ALL ON FUNCTION "public"."hem_active"() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_active"() TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_active"() TO service_role;

CREATE OR REPLACE FUNCTION public.hem_owner()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND is_active IS TRUE AND (role='owner' OR level='L5')) $function$
;

REVOKE ALL ON FUNCTION "public"."hem_owner"() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_owner"() TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_owner"() TO service_role;

CREATE OR REPLACE FUNCTION public.hem_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND is_active IS TRUE AND
 (role='owner' OR level='L5' OR (role<>'field_agent' AND (role IN ('admin','manager','lead') OR level IN ('L3','L4') OR department IN ('HR/Admin','Accounts','Valuation'))))) $function$
;

REVOKE ALL ON FUNCTION "public"."hem_admin"() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_admin"() TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_admin"() TO service_role;

CREATE OR REPLACE FUNCTION public.hem_senior()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND is_active IS TRUE AND (role IN ('owner','admin','manager','lead','reviewer') OR level='L5')) $function$
;

REVOKE ALL ON FUNCTION "public"."hem_senior"() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_senior"() TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_senior"() TO service_role;

CREATE OR REPLACE FUNCTION public.hem_valuator()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT public.hem_admin() OR EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND is_active IS TRUE AND role IN ('valuator','staff','editor','analyst','reviewer')) $function$
;

REVOKE ALL ON FUNCTION "public"."hem_valuator"() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_valuator"() TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_valuator"() TO service_role;

CREATE OR REPLACE FUNCTION public.hem_case_audit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
 IF TG_OP='INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
 INSERT INTO public.case_events(case_id,actor_id,event_type,old_status,new_status) VALUES(NEW.id,auth.uid(),CASE WHEN TG_OP='INSERT' THEN 'created' ELSE 'status_changed' END,CASE WHEN TG_OP='INSERT' THEN NULL ELSE OLD.status END,NEW.status);
 END IF; RETURN NEW;
END $function$
;

REVOKE ALL ON FUNCTION "public"."hem_case_audit"() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_case_audit"() TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_case_audit"() TO service_role;

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
END $function$
;

REVOKE ALL ON FUNCTION "public"."hem_guard_case"() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_guard_case"() TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_guard_case"() TO service_role;

CREATE OR REPLACE FUNCTION public.hem_guard_leave()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
END $function$
;

REVOKE ALL ON FUNCTION "public"."hem_guard_leave"() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_guard_leave"() TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_guard_leave"() TO service_role;

CREATE OR REPLACE FUNCTION public.hem_object_case(path text)
 RETURNS uuid
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
 SELECT CASE WHEN split_part(path,'/',1) ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN split_part(path,'/',1)::uuid ELSE NULL END $function$
;

REVOKE ALL ON FUNCTION "public"."hem_object_case"(path text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_object_case"(path text) TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_object_case"(path text) TO service_role;

CREATE OR REPLACE FUNCTION public.transition_case(p_case_id uuid, p_status text, p_expected_revision bigint)
 RETURNS cases
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE c public.cases;
BEGIN
 SELECT * INTO c FROM public.cases WHERE id=p_case_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Case unavailable' USING ERRCODE='42501'; END IF;
 IF p_expected_revision IS NULL OR c.revision<>p_expected_revision THEN RAISE EXCEPTION 'This case changed. Refresh before continuing' USING ERRCODE='40001'; END IF;
 UPDATE public.cases SET status=public.hem_status(p_status) WHERE id=p_case_id RETURNING * INTO c;
 RETURN c;
END $function$
;

REVOKE ALL ON FUNCTION "public"."transition_case"(p_case_id uuid, p_status text, p_expected_revision bigint) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."transition_case"(p_case_id uuid, p_status text, p_expected_revision bigint) TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."transition_case"(p_case_id uuid, p_status text, p_expected_revision bigint) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_case(p_case_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
 IF NOT public.hem_valuator() THEN RAISE EXCEPTION 'Valuator permission required' USING ERRCODE='42501'; END IF;
 UPDATE public.cases SET valuator_id=auth.uid() WHERE id=p_case_id AND valuator_id IS NULL AND status='field_visit_done';
 IF NOT FOUND THEN RAISE EXCEPTION 'This case was already claimed or is not ready'; END IF;
END $function$
;

REVOKE ALL ON FUNCTION "public"."claim_case"(p_case_id uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."claim_case"(p_case_id uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."claim_case"(p_case_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.hem_submission_missing(cid uuid, payload jsonb)
 RETURNS text[]
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
END $function$
;

REVOKE ALL ON FUNCTION "public"."hem_submission_missing"(cid uuid, payload jsonb) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_submission_missing"(cid uuid, payload jsonb) TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_submission_missing"(cid uuid, payload jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.hem_evidence_changed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE cid uuid;
BEGIN
 cid:=CASE WHEN TG_OP='DELETE' THEN OLD.case_id ELSE NEW.case_id END;
 UPDATE public.cases SET status=CASE WHEN status='report_drafted' THEN 'field_visit_done' ELSE status END WHERE id=cid;
 IF TG_OP='UPDATE' AND OLD.case_id IS DISTINCT FROM NEW.case_id THEN
  UPDATE public.cases SET status=CASE WHEN status='report_drafted' THEN 'field_visit_done' ELSE status END WHERE id=OLD.case_id;
 END IF;
 RETURN NULL;
END $function$
;

REVOKE ALL ON FUNCTION "public"."hem_evidence_changed"() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_evidence_changed"() TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_evidence_changed"() TO service_role;

CREATE OR REPLACE FUNCTION public.save_case_data(p_case_id uuid, p_data jsonb, p_expected_revision bigint, p_submit boolean DEFAULT false)
 RETURNS cases
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE c public.cases;
BEGIN
 SELECT * INTO c FROM public.cases WHERE id=p_case_id FOR UPDATE;
 IF NOT FOUND OR NOT public.hem_case_edit(p_case_id) THEN RAISE EXCEPTION 'This case cannot be edited' USING ERRCODE='42501'; END IF;
 IF p_expected_revision IS NULL OR c.revision<>p_expected_revision THEN PERFORM set_config('response.status','409',true); RETURN c; END IF;
 IF jsonb_typeof(p_data) IS DISTINCT FROM 'object' OR octet_length(p_data::text)>200000 THEN RAISE EXCEPTION 'Invalid field data'; END IF;
 UPDATE public.cases SET extracted_data=coalesce(extracted_data,'{}') || (p_data-ARRAY['id','case_id','created_at','updated_at','created_by','user_id','__proto__','constructor','prototype']), status=CASE WHEN p_submit THEN 'field_visit_done' WHEN status IN ('new','assigned') THEN 'in_progress' ELSE status END WHERE id=p_case_id RETURNING * INTO c;
 RETURN c;
END $function$
;

REVOKE ALL ON FUNCTION "public"."save_case_data"(p_case_id uuid, p_data jsonb, p_expected_revision bigint, p_submit boolean) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."save_case_data"(p_case_id uuid, p_data jsonb, p_expected_revision bigint, p_submit boolean) TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."save_case_data"(p_case_id uuid, p_data jsonb, p_expected_revision bigint, p_submit boolean) TO service_role;

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
END $function$
;

REVOKE ALL ON FUNCTION "public"."record_case_report"(p_case_id uuid, p_template_id text, p_storage_path text, p_data jsonb, p_sha256 text, p_expected_revision bigint) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."record_case_report"(p_case_id uuid, p_template_id text, p_storage_path text, p_data jsonb, p_sha256 text, p_expected_revision bigint) TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."record_case_report"(p_case_id uuid, p_template_id text, p_storage_path text, p_data jsonb, p_sha256 text, p_expected_revision bigint) TO service_role;

CREATE OR REPLACE FUNCTION public.hem_mapping_cache_read(p_key text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
  select jsonb_build_object(
    'value', (select payload from public.hem_mapping_cache where cache_key=p_key and expires_at>now()),
    'writable', exists(select 1 from public.hem_mapping_cache where cache_key=p_key)
      or (select count(*) from public.hem_mapping_cache where expires_at>now())<1024
  );
$function$
;

REVOKE ALL ON FUNCTION "public"."hem_mapping_cache_read"(p_key text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_mapping_cache_read"(p_key text) TO service_role;

CREATE OR REPLACE FUNCTION public.hem_mapping_cache_write(p_key text, p_value jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if length(p_key)>150 or octet_length(p_value::text)>196608 then return false; end if;
  perform pg_advisory_xact_lock(746182);
  delete from public.hem_mapping_cache where expires_at<=now();
  if not exists(select 1 from public.hem_mapping_cache where cache_key=p_key)
    and (select count(*) from public.hem_mapping_cache)>=1024 then return false; end if;
  insert into public.hem_mapping_cache(cache_key,payload,expires_at)
    values(p_key,p_value,now()+interval '7 days')
    on conflict(cache_key) do update set payload=excluded.payload,expires_at=excluded.expires_at;
  return true;
end;
$function$
;

REVOKE ALL ON FUNCTION "public"."hem_mapping_cache_write"(p_key text, p_value jsonb) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_mapping_cache_write"(p_key text, p_value jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.hem_mapping_claim_geocode()
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare claimed text;
begin
  update public.hem_mapping_request_slots set next_allowed_at=clock_timestamp()+interval '1100 milliseconds'
    where provider='nominatim' and next_allowed_at<=clock_timestamp() returning provider into claimed;
  return claimed is not null;
end;
$function$
;

REVOKE ALL ON FUNCTION "public"."hem_mapping_claim_geocode"() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION "public"."hem_mapping_claim_geocode"() TO service_role;

GRANT USAGE ON SCHEMA hem_push_private TO authenticated;

GRANT USAGE ON SCHEMA hem_push_private, hem_private TO service_role;

SET check_function_bodies = true;
