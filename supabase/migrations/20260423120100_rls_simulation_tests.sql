-- RLS simulation tests — intentionally idempotent SQL that seeds two agencies,
-- two clients in different agencies, three users (one per role), and asserts
-- that client A cannot see client B's data.
--
-- Run via `supabase db reset` in local dev. In CI, this file can be executed
-- as a post-migration check that FAILS the build if any assertion fails.
--
-- The invariant being guarded: "client A must never see client B's data."
-- If you change any RLS policy in 20260423120000_initial_schema.sql and these
-- assertions still pass, the policy change is safe for the cross-tenant case.

do $$
declare
  agency_a_id uuid := gen_random_uuid();
  agency_b_id uuid := gen_random_uuid();
  client_a_id uuid := gen_random_uuid();
  client_b_id uuid := gen_random_uuid();
  integration_a_id uuid := gen_random_uuid();
  integration_b_id uuid := gen_random_uuid();
  property_a_id uuid := gen_random_uuid();
  property_b_id uuid := gen_random_uuid();
  user_agency_admin uuid := gen_random_uuid();
  user_client_a uuid := gen_random_uuid();
  user_client_b uuid := gen_random_uuid();
  observed_count int;
begin
  -- Seed (bypasses RLS because we're running as postgres superuser here).
  insert into auth.users (id, email, aud, role, email_confirmed_at)
  values
    (user_agency_admin, 'admin-a@test.local', 'authenticated', 'authenticated', now()),
    (user_client_a, 'viewer-a@test.local', 'authenticated', 'authenticated', now()),
    (user_client_b, 'viewer-b@test.local', 'authenticated', 'authenticated', now())
  on conflict do nothing;

  insert into public.agencies (id, name) values
    (agency_a_id, 'Test Agency A'),
    (agency_b_id, 'Test Agency B');

  insert into public.clients (id, agency_id, name) values
    (client_a_id, agency_a_id, 'Client A (Agency A)'),
    (client_b_id, agency_b_id, 'Client B (Agency B)');

  insert into public.integrations (id, client_id) values
    (integration_a_id, client_a_id),
    (integration_b_id, client_b_id);

  insert into public.properties (id, client_id, integration_id, adobe_report_suite_id, name)
  values
    (property_a_id, client_a_id, integration_a_id, 'rs_a', 'Client A Primary'),
    (property_b_id, client_b_id, integration_b_id, 'rs_b', 'Client B Primary');

  insert into public.memberships (user_id, agency_id, client_id, role) values
    (user_agency_admin, agency_a_id, null, 'agency_admin'),
    (user_client_a, agency_a_id, client_a_id, 'client_viewer'),
    (user_client_b, agency_b_id, client_b_id, 'client_viewer');

  -- =========================================================================
  -- Assertion 1: client_viewer A sees only Client A's properties
  -- =========================================================================
  perform set_config('request.jwt.claims', json_build_object('sub', user_client_a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into observed_count from public.properties;
  if observed_count <> 1 then
    raise exception 'RLS FAIL: client_viewer A saw % properties, expected 1', observed_count;
  end if;

  select count(*) into observed_count from public.properties where id = property_b_id;
  if observed_count <> 0 then
    raise exception 'RLS FAIL: client_viewer A could see Client B property (cross-tenant leak)';
  end if;

  -- =========================================================================
  -- Assertion 2: client_viewer B sees only Client B's properties
  -- =========================================================================
  perform set_config('request.jwt.claims', json_build_object('sub', user_client_b, 'role', 'authenticated')::text, true);

  select count(*) into observed_count from public.properties;
  if observed_count <> 1 then
    raise exception 'RLS FAIL: client_viewer B saw % properties, expected 1', observed_count;
  end if;

  select count(*) into observed_count from public.properties where id = property_a_id;
  if observed_count <> 0 then
    raise exception 'RLS FAIL: client_viewer B could see Client A property (cross-tenant leak)';
  end if;

  -- =========================================================================
  -- Assertion 3: agency_admin of Agency A sees Client A but NOT Client B
  -- =========================================================================
  perform set_config('request.jwt.claims', json_build_object('sub', user_agency_admin, 'role', 'authenticated')::text, true);

  select count(*) into observed_count from public.clients;
  if observed_count <> 1 then
    raise exception 'RLS FAIL: agency_admin of Agency A saw % clients, expected 1', observed_count;
  end if;

  select count(*) into observed_count from public.clients where id = client_b_id;
  if observed_count <> 0 then
    raise exception 'RLS FAIL: agency_admin of Agency A could see Agency B client (cross-agency leak)';
  end if;

  -- Reset role + clear JWT claim for subsequent migrations.
  reset role;
  perform set_config('request.jwt.claims', '', true);

  -- Cleanup seed data — these tests don't persist anything.
  delete from public.memberships where user_id in (user_agency_admin, user_client_a, user_client_b);
  delete from public.properties where id in (property_a_id, property_b_id);
  delete from public.integrations where id in (integration_a_id, integration_b_id);
  delete from public.clients where id in (client_a_id, client_b_id);
  delete from public.agencies where id in (agency_a_id, agency_b_id);
  delete from auth.users where id in (user_agency_admin, user_client_a, user_client_b);

  raise notice 'RLS simulation tests PASSED';
end $$;
