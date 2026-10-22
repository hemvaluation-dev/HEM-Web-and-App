-- Run ONLY after deploying assignment-push with Firebase credentials.
-- First create Vault secrets hem_push_url (the HTTPS Edge Function URL)
-- and hem_push_webhook_secret (same value as PUSH_WEBHOOK_SECRET in Edge secrets).
-- This activation does not expose any credentials to mobile or web clients.
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

create or replace function hem_push_private.dispatch_assignment_push(p_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare endpoint text; secret text;
begin
 select decrypted_secret into endpoint from vault.decrypted_secrets where name='hem_push_url' limit 1;
 select decrypted_secret into secret from vault.decrypted_secrets where name='hem_push_webhook_secret' limit 1;
 if endpoint is null or secret is null then return; end if;
 if endpoint !~ '^https://[a-z0-9]+\.supabase\.co/functions/v1/assignment-push$' then return; end if;
 perform net.http_post(url:=endpoint,
   headers:=jsonb_build_object('Content-Type','application/json','x-push-secret',secret),
   body:=jsonb_build_object('event_id',p_id),timeout_milliseconds:=1000);
exception when others then
 -- Sending an alert must never prevent assignment. The retry job recovers it.
 return;
end $$;
revoke all on function hem_push_private.dispatch_assignment_push(uuid) from public,anon,authenticated;

create or replace function hem_push_private.wake_assignment_push()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform hem_push_private.dispatch_assignment_push(new.id);
 return new;
end $$;
revoke all on function hem_push_private.wake_assignment_push() from public,anon,authenticated;
drop trigger if exists hem_wake_assignment_push on public.hem_assignment_notifications;
create trigger hem_wake_assignment_push after insert on public.hem_assignment_notifications
for each row execute function hem_push_private.wake_assignment_push();

create or replace function hem_push_private.retry_assignment_push()
returns void language plpgsql security definer set search_path='' as $$
declare event record;
begin
 update public.hem_assignment_notifications set status='failed',finished_at=now()
 where status in ('pending','processing') and (created_at<now()-interval '24 hours' or attempts>=5)
 and (locked_until is null or locked_until<now());
 for event in select id from public.hem_assignment_notifications
 where created_at>now()-interval '24 hours' and attempts<5
 and (status='pending' or (status='processing' and locked_until<now()))
 order by created_at limit 20
 loop perform hem_push_private.dispatch_assignment_push(event.id); end loop;
 delete from public.hem_assignment_notifications where created_at<now()-interval '30 days';
 delete from public.hem_push_devices where updated_at<now()-interval '90 days';
end $$;
revoke all on function hem_push_private.retry_assignment_push() from public,anon,authenticated;
-- Idempotent activation: one inexpensive database check every five minutes;
-- no Edge invocation or FCM call when the queue is empty.
select cron.schedule('hem-assignment-push-retry','*/5 * * * *','select hem_push_private.retry_assignment_push()');
