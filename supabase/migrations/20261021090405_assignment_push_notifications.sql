-- Additive only: no existing case, user, or storage data is changed.
create schema if not exists hem_push_private;
revoke all on schema hem_push_private from public, anon, authenticated;
create table public.hem_push_devices (
 token text primary key check (length(token) between 20 and 4096),
 user_id uuid not null references public.users(id) on delete cascade,
 updated_at timestamptz not null default now()
);
create index hem_push_devices_user on public.hem_push_devices(user_id);
alter table public.hem_push_devices enable row level security;
revoke all on public.hem_push_devices from public, anon, authenticated;
grant all on public.hem_push_devices to service_role;
create table public.hem_assignment_notifications (
 id uuid primary key default gen_random_uuid(),
 case_id uuid not null references public.cases(id) on delete cascade,
 user_id uuid not null references public.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 status text not null default 'pending' check(status in ('pending','processing','sent','skipped','failed')),
 attempts integer not null default 0,
 locked_until timestamptz,
 finished_at timestamptz
);
create index hem_assignment_notifications_pending on public.hem_assignment_notifications(status,created_at);
alter table public.hem_assignment_notifications enable row level security;
revoke all on public.hem_assignment_notifications from public, anon, authenticated;
grant all on public.hem_assignment_notifications to service_role;
create table public.hem_push_deliveries (
 event_id uuid not null references public.hem_assignment_notifications(id) on delete cascade,
 token text not null,
 primary key(event_id,token)
);
alter table public.hem_push_deliveries enable row level security;
revoke all on public.hem_push_deliveries from public,anon,authenticated;
grant all on public.hem_push_deliveries to service_role;

-- Privileged functions live outside the Data API; public wrappers use invoker security.
create function hem_push_private.register_push_device(p_token text) returns void
language plpgsql security definer set search_path = '' as $$
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
end $$;
create function hem_push_private.unregister_push_device(p_token text) returns void
language sql security definer set search_path = '' as $$
 delete from public.hem_push_devices where token=p_token and user_id=auth.uid();
$$;
grant usage on schema hem_push_private to authenticated;
revoke all on function hem_push_private.register_push_device(text),hem_push_private.unregister_push_device(text) from public,anon;
grant execute on function hem_push_private.register_push_device(text),hem_push_private.unregister_push_device(text) to authenticated;
create function public.hem_register_push_device(p_token text) returns void language sql security invoker set search_path='' as $$ select hem_push_private.register_push_device(p_token); $$;
create function public.hem_unregister_push_device(p_token text) returns void language sql security invoker set search_path='' as $$ select hem_push_private.unregister_push_device(p_token); $$;
revoke all on function public.hem_register_push_device(text),public.hem_unregister_push_device(text) from public,anon;
grant execute on function public.hem_register_push_device(text),public.hem_unregister_push_device(text) to authenticated;

create function hem_push_private.enqueue_assignment_push() returns trigger
language plpgsql security definer set search_path='' as $$
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
end $$;
revoke all on function hem_push_private.enqueue_assignment_push() from public,anon,authenticated;
create trigger hem_enqueue_assignment_push after insert or update of assigned_to on public.cases
for each row execute function hem_push_private.enqueue_assignment_push();

create function public.hem_claim_assignment_push(p_id uuid) returns setof public.hem_assignment_notifications
language sql security invoker set search_path='' as $$
 update public.hem_assignment_notifications set status='processing',attempts=attempts+1,locked_until=now()+interval '2 minutes'
 where id=p_id and created_at>now()-interval '24 hours' and attempts<5
 and (status='pending' or (status='processing' and locked_until<now())) returning *;
$$;
revoke all on function public.hem_claim_assignment_push(uuid) from public,anon,authenticated;
grant execute on function public.hem_claim_assignment_push(uuid) to service_role;
