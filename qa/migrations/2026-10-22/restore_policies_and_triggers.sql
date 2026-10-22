GRANT INSERT ON "public"."case_location" TO authenticated;

GRANT SELECT ON "public"."case_location" TO authenticated;

GRANT UPDATE ON "public"."case_location" TO authenticated;

GRANT DELETE ON "public"."case_location" TO authenticated;

GRANT INSERT ON "public"."case_photos" TO authenticated;

GRANT SELECT ON "public"."case_photos" TO authenticated;

GRANT UPDATE ON "public"."case_photos" TO authenticated;

GRANT DELETE ON "public"."case_photos" TO authenticated;

GRANT INSERT ON "public"."case_documents" TO authenticated;

GRANT SELECT ON "public"."case_documents" TO authenticated;

GRANT UPDATE ON "public"."case_documents" TO authenticated;

GRANT DELETE ON "public"."case_documents" TO authenticated;

GRANT INSERT ON "public"."extracted_data" TO authenticated;

GRANT SELECT ON "public"."extracted_data" TO authenticated;

GRANT UPDATE ON "public"."extracted_data" TO authenticated;

GRANT DELETE ON "public"."extracted_data" TO authenticated;

GRANT INSERT ON "public"."cases" TO authenticated;

GRANT SELECT ON "public"."cases" TO authenticated;

GRANT UPDATE ON "public"."cases" TO authenticated;

GRANT DELETE ON "public"."cases" TO authenticated;

GRANT INSERT ON "public"."case_field_data" TO authenticated;

GRANT SELECT ON "public"."case_field_data" TO authenticated;

GRANT UPDATE ON "public"."case_field_data" TO authenticated;

GRANT DELETE ON "public"."case_field_data" TO authenticated;

GRANT INSERT ON "public"."attendance" TO authenticated;

GRANT SELECT ON "public"."attendance" TO authenticated;

GRANT UPDATE ON "public"."attendance" TO authenticated;

GRANT DELETE ON "public"."attendance" TO authenticated;

GRANT INSERT ON "public"."leaves" TO authenticated;

GRANT SELECT ON "public"."leaves" TO authenticated;

GRANT UPDATE ON "public"."leaves" TO authenticated;

GRANT DELETE ON "public"."leaves" TO authenticated;

GRANT INSERT ON "public"."users" TO authenticated;

GRANT SELECT ON "public"."users" TO authenticated;

GRANT UPDATE ON "public"."users" TO authenticated;

GRANT DELETE ON "public"."users" TO authenticated;

GRANT INSERT ON "public"."clients" TO authenticated;

GRANT SELECT ON "public"."clients" TO authenticated;

GRANT UPDATE ON "public"."clients" TO authenticated;

GRANT DELETE ON "public"."clients" TO authenticated;

GRANT SELECT ON "public"."case_reports" TO authenticated;

GRANT SELECT ON "public"."case_events" TO authenticated;

CREATE POLICY "hem_evidence_read" ON "public"."case_location" AS PERMISSIVE FOR SELECT TO "authenticated" USING (hem_case_access(case_id));

CREATE POLICY "hem_evidence_write" ON "public"."case_location" AS PERMISSIVE FOR ALL TO "authenticated" USING (hem_case_edit(case_id)) WITH CHECK (hem_case_edit(case_id));

CREATE POLICY "hem_evidence_read" ON "public"."case_photos" AS PERMISSIVE FOR SELECT TO "authenticated" USING (hem_case_access(case_id));

CREATE POLICY "hem_evidence_write" ON "public"."case_photos" AS PERMISSIVE FOR ALL TO "authenticated" USING (hem_case_edit(case_id)) WITH CHECK (hem_case_edit(case_id));

CREATE POLICY "hem_evidence_read" ON "public"."case_documents" AS PERMISSIVE FOR SELECT TO "authenticated" USING (hem_case_access(case_id));

CREATE POLICY "hem_evidence_write" ON "public"."case_documents" AS PERMISSIVE FOR ALL TO "authenticated" USING (hem_case_edit(case_id)) WITH CHECK (hem_case_edit(case_id));

CREATE POLICY "hem_cases_delete" ON "public"."cases" AS PERMISSIVE FOR DELETE TO "authenticated" USING (hem_owner());

CREATE POLICY "hem_cases_insert" ON "public"."cases" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((hem_admin() AND (created_by = auth.uid())));

CREATE POLICY "hem_cases_read" ON "public"."cases" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((hem_active() AND (hem_admin() OR ((((auth.uid() = created_by) OR (auth.uid() = assigned_to)) OR (auth.uid() = reviewer_id)) OR (auth.uid() = valuator_id)))));

CREATE POLICY "hem_cases_update" ON "public"."cases" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((hem_active() AND (hem_admin() OR ((((auth.uid() = created_by) OR (auth.uid() = assigned_to)) OR (auth.uid() = reviewer_id)) OR (auth.uid() = valuator_id))))) WITH CHECK ((hem_active() AND (hem_admin() OR ((((auth.uid() = created_by) OR (auth.uid() = assigned_to)) OR (auth.uid() = reviewer_id)) OR (auth.uid() = valuator_id)))));

CREATE POLICY "hem_legacy_read" ON "public"."case_field_data" AS PERMISSIVE FOR SELECT TO "authenticated" USING (hem_case_access(case_id));

CREATE POLICY "hem_attendance_read" ON "public"."attendance" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((hem_active() AND ((user_id = auth.uid()) OR hem_admin())));

CREATE POLICY "hem_attendance_write" ON "public"."attendance" AS PERMISSIVE FOR ALL TO "authenticated" USING ((hem_active() AND (user_id = auth.uid()))) WITH CHECK ((hem_active() AND (user_id = auth.uid())));

CREATE POLICY "hem_leaves_insert" ON "public"."leaves" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((hem_active() AND (user_id = auth.uid()) AND (status = 'pending'::text) AND (start_date <= end_date)));

CREATE POLICY "hem_leaves_read" ON "public"."leaves" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((hem_active() AND ((user_id = auth.uid()) OR hem_admin())));

CREATE POLICY "hem_leaves_update" ON "public"."leaves" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((hem_active() AND ((user_id = auth.uid()) OR hem_admin()))) WITH CHECK ((hem_active() AND ((user_id = auth.uid()) OR hem_admin())));

CREATE POLICY "hem_users_owner" ON "public"."users" AS PERMISSIVE FOR ALL TO "authenticated" USING (hem_owner()) WITH CHECK (hem_owner());

CREATE POLICY "hem_users_read" ON "public"."users" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((hem_active() AND ((id = auth.uid()) OR hem_admin())));

CREATE POLICY "hem_clients_read" ON "public"."clients" AS PERMISSIVE FOR SELECT TO "authenticated" USING (hem_active());

CREATE POLICY "hem_clients_write" ON "public"."clients" AS PERMISSIVE FOR ALL TO "authenticated" USING (hem_admin()) WITH CHECK (hem_admin());

CREATE POLICY "hem_reports_read" ON "public"."case_reports" AS PERMISSIVE FOR SELECT TO "authenticated" USING (hem_case_access(case_id));

CREATE POLICY "hem_events_read" ON "public"."case_events" AS PERMISSIVE FOR SELECT TO "authenticated" USING (hem_case_access(case_id));

CREATE POLICY "hem_files_delete" ON "storage"."objects" AS PERMISSIVE FOR DELETE TO "authenticated" USING (((bucket_id = ANY (ARRAY['photos'::text, 'documents'::text, 'reports'::text])) AND hem_case_edit(hem_object_case(name)) AND ((bucket_id <> 'reports'::text) OR (NOT (EXISTS ( SELECT 1
   FROM case_reports
  WHERE (case_reports.storage_path = objects.name)))))));

CREATE POLICY "hem_files_insert" ON "storage"."objects" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((bucket_id = ANY (ARRAY['photos'::text, 'documents'::text, 'reports'::text])) AND hem_case_edit(hem_object_case(name)) AND ((bucket_id <> 'reports'::text) OR hem_valuator())));

CREATE POLICY "hem_files_read" ON "storage"."objects" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((bucket_id = ANY (ARRAY['photos'::text, 'documents'::text, 'reports'::text])) AND hem_case_access(hem_object_case(name))));

CREATE POLICY hem_extracted_read ON public.extracted_data FOR SELECT TO authenticated USING (public.hem_case_access(case_id));

CREATE POLICY hem_extracted_write ON public.extracted_data FOR ALL TO authenticated USING (public.hem_case_edit(case_id)) WITH CHECK (public.hem_case_edit(case_id));

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

CREATE TRIGGER hem_case_guard BEFORE INSERT OR UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION hem_guard_case();

CREATE TRIGGER hem_case_audit AFTER INSERT OR UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION hem_case_audit();

CREATE TRIGGER hem_evidence_changed AFTER INSERT OR DELETE OR UPDATE ON case_location FOR EACH ROW EXECUTE FUNCTION hem_evidence_changed();

CREATE TRIGGER hem_evidence_changed AFTER INSERT OR DELETE OR UPDATE ON case_photos FOR EACH ROW EXECUTE FUNCTION hem_evidence_changed();

CREATE TRIGGER hem_evidence_changed AFTER INSERT OR DELETE OR UPDATE ON case_documents FOR EACH ROW EXECUTE FUNCTION hem_evidence_changed();

CREATE TRIGGER hem_leave_guard BEFORE UPDATE ON leaves FOR EACH ROW EXECUTE FUNCTION hem_guard_leave();

CREATE TRIGGER hem_enqueue_assignment_push AFTER INSERT OR UPDATE OF assigned_to ON cases FOR EACH ROW EXECUTE FUNCTION hem_push_private.enqueue_assignment_push();

INSERT INTO public.hem_mapping_request_slots(provider,next_allowed_at) VALUES ('nominatim',now()) ON CONFLICT(provider) DO NOTHING;

NOTIFY pgrst, 'reload schema';

CREATE POLICY hem_files_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('photos','documents') AND public.hem_case_edit(public.hem_object_case(name))) WITH CHECK (bucket_id IN ('photos','documents') AND public.hem_case_edit(public.hem_object_case(name)));
