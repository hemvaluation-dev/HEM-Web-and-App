-- Small, service-only cache for OpenStreetMap lookups and tiles. No case data is changed.
create table if not exists public.hem_mapping_cache (
  cache_key text primary key,
  payload jsonb not null,
  expires_at timestamptz not null
);
create index if not exists hem_mapping_cache_expiry on public.hem_mapping_cache(expires_at);
create table if not exists public.hem_mapping_request_slots (
  provider text primary key,
  next_allowed_at timestamptz not null default '-infinity'
);
insert into public.hem_mapping_request_slots(provider) values ('nominatim') on conflict do nothing;
alter table public.hem_mapping_cache enable row level security;
alter table public.hem_mapping_request_slots enable row level security;
revoke all on public.hem_mapping_cache, public.hem_mapping_request_slots from public, anon, authenticated;
grant all on public.hem_mapping_cache, public.hem_mapping_request_slots to service_role;

create or replace function public.hem_mapping_cache_read(p_key text) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'value', (select payload from public.hem_mapping_cache where cache_key=p_key and expires_at>now()),
    'writable', exists(select 1 from public.hem_mapping_cache where cache_key=p_key)
      or (select count(*) from public.hem_mapping_cache where expires_at>now())<1024
  );
$$;
create or replace function public.hem_mapping_cache_write(p_key text, p_value jsonb) returns boolean
language plpgsql security invoker set search_path = '' as $$
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
$$;
create or replace function public.hem_mapping_claim_geocode() returns boolean
language plpgsql security invoker set search_path = '' as $$
declare claimed text;
begin
  update public.hem_mapping_request_slots set next_allowed_at=clock_timestamp()+interval '1100 milliseconds'
    where provider='nominatim' and next_allowed_at<=clock_timestamp() returning provider into claimed;
  return claimed is not null;
end;
$$;
revoke all on function public.hem_mapping_cache_read(text), public.hem_mapping_cache_write(text,jsonb), public.hem_mapping_claim_geocode() from public, anon, authenticated;
grant execute on function public.hem_mapping_cache_read(text), public.hem_mapping_cache_write(text,jsonb), public.hem_mapping_claim_geocode() to service_role;
