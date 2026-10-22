-- Requires case-retention deployment, shared Edge secret and existing push Vault secrets.
-- Hourly check; no Edge invocation when no completed cases have expired.
CREATE OR REPLACE FUNCTION hem_push_private.dispatch_case_retention()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE endpoint text; secret text;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.cases WHERE status='completed' AND completed_at<=now()-interval '30 days') THEN RETURN; END IF;
 SELECT replace(decrypted_secret,'/assignment-push','/case-retention') INTO endpoint FROM vault.decrypted_secrets WHERE name='hem_push_url' LIMIT 1;
 SELECT decrypted_secret INTO secret FROM vault.decrypted_secrets WHERE name='hem_push_webhook_secret' LIMIT 1;
 IF endpoint IS NULL OR endpoint !~ '^https://[a-z0-9]+\.supabase\.co/functions/v1/case-retention$' OR secret IS NULL THEN RAISE EXCEPTION 'Retention dispatcher not configured'; END IF;
 PERFORM net.http_post(url:=endpoint,headers:=jsonb_build_object('Content-Type','application/json','x-push-secret',secret),body:='{"dry_run":false}'::jsonb,timeout_milliseconds:=110000);
END $$;
REVOKE ALL ON FUNCTION hem_push_private.dispatch_case_retention() FROM PUBLIC,anon,authenticated;
SELECT cron.schedule('hem-completed-case-retention','17 * * * *','select hem_push_private.dispatch_case_retention()');
