-- Read-only verification query for the original Supabase project.
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('cases','case_location','case_photos','case_documents','case_reports','case_events')
ORDER BY table_name, ordinal_position;

SELECT proname AS function_name
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('save_case_data','transition_case','claim_case','record_case_report','hem_case_edit','hem_case_access')
ORDER BY proname;

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('cases','case_location','case_photos','case_documents','case_reports','case_events')
ORDER BY tablename, policyname;
