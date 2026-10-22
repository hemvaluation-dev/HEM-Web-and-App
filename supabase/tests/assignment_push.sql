-- Transactional smoke test using only temporary case rows; all queue/token writes roll back.
begin;
create temporary table hem_push_test_cases(id uuid, assigned_to uuid);
create trigger hem_push_test_enqueue after insert or update of assigned_to on hem_push_test_cases
for each row execute function hem_push_private.enqueue_assignment_push();
do $$
declare cid uuid; uid uuid; uid2 uuid; baseline integer; eid uuid; claimed integer;
begin
 select id into cid from public.cases limit 1;
 select id into uid from public.users where is_active=true limit 1;
 select id into uid2 from public.users where is_active=true and id<>uid limit 1;
 if cid is null or uid is null or uid2 is null then raise exception 'Needs existing case and two active users'; end if;
 select count(*) into baseline from public.hem_assignment_notifications where case_id=cid;
 insert into hem_push_test_cases values(cid,null);
 if (select count(*) from public.hem_assignment_notifications where case_id=cid)<>baseline then raise exception 'Unassigned case enqueued'; end if;
 update hem_push_test_cases set assigned_to=uid;
 if (select count(*) from public.hem_assignment_notifications where case_id=cid)<>baseline+1 then raise exception 'Assignment missing'; end if;
 update hem_push_test_cases set assigned_to=uid;
 if (select count(*) from public.hem_assignment_notifications where case_id=cid)<>baseline+1 then raise exception 'Duplicate assignment'; end if;
 update hem_push_test_cases set assigned_to=uid2;
 update hem_push_test_cases set assigned_to=null;
 if (select count(*) from public.hem_assignment_notifications where case_id=cid)<>baseline+2 then raise exception 'Reassignment/unassign wrong'; end if;
 select id into eid from public.hem_assignment_notifications where case_id=cid and user_id=uid2 order by created_at desc limit 1;
 select count(*) into claimed from public.hem_claim_assignment_push(eid);
 if claimed<>1 then raise exception 'First claim failed'; end if;
 select count(*) into claimed from public.hem_claim_assignment_push(eid);
 if claimed<>0 then raise exception 'Concurrent duplicate claim'; end if;
 perform set_config('request.jwt.claim.sub',uid::text,true);
 perform public.hem_register_push_device('hem-transactional-test-token-20261021');
 if not exists(select 1 from public.hem_push_devices where token='hem-transactional-test-token-20261021' and user_id=uid) then raise exception 'Registration failed'; end if;
 perform public.hem_unregister_push_device('hem-transactional-test-token-20261021');
 if exists(select 1 from public.hem_push_devices where token='hem-transactional-test-token-20261021') then raise exception 'Unregister failed'; end if;
 if has_function_privilege('anon','public.hem_register_push_device(text)','EXECUTE') then raise exception 'Anonymous registration exposed'; end if;
 if has_function_privilege('authenticated','public.hem_claim_assignment_push(uuid)','EXECUTE') then raise exception 'Client dispatch exposed'; end if;
end $$;
select 'assignment push SQL assertions passed; rolling back' as result;
rollback;
