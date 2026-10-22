-- A stale save is an expected user conflict, not a PostgreSQL fault.  The
-- previous RAISE emitted one database log entry per request; a misbehaving
-- client could exhaust Free-tier log ingestion without changing any data.
CREATE OR REPLACE FUNCTION public.save_case_data(
  p_case_id uuid, p_data jsonb, p_expected_revision bigint,
  p_submit boolean DEFAULT false
) RETURNS public.cases
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE c public.cases;
BEGIN
  SELECT * INTO c FROM public.cases WHERE id=p_case_id FOR UPDATE;
  IF NOT FOUND OR NOT public.hem_case_edit(p_case_id) THEN
    RAISE EXCEPTION 'This case cannot be edited' USING ERRCODE='42501';
  END IF;
  IF p_expected_revision IS NULL OR c.revision<>p_expected_revision THEN
    PERFORM set_config('response.status', '409', true);
    RETURN c;
  END IF;
  IF jsonb_typeof(p_data) IS DISTINCT FROM 'object' OR octet_length(p_data::text)>200000 THEN
    RAISE EXCEPTION 'Invalid field data';
  END IF;
  UPDATE public.cases SET
    extracted_data=coalesce(extracted_data,'{}') ||
      (p_data-ARRAY['id','case_id','created_at','updated_at','created_by','user_id','__proto__','constructor','prototype']),
    status=CASE WHEN p_submit THEN 'field_visit_done'
      WHEN status IN ('new','assigned') THEN 'in_progress' ELSE status END
  WHERE id=p_case_id RETURNING * INTO c;
  RETURN c;
END $$;
