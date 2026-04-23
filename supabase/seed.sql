-- Dev seed — runs on `supabase db reset`.
-- Creates verrodata (agency), Consors Finanz (client), and the primary user
-- (christoph.ludwig@verrodata.com) as agency_admin.
--
-- Seed is idempotent: re-running is safe.
-- Password hashing uses pgcrypto's bcrypt (gen_salt('bf')).
--
-- Production users are provisioned via the Supabase Admin API from an agency
-- admin UI, not via this file. Do NOT commit real client credentials here.

-- Fixed UUIDs for determinism (so seeded IDs are stable across resets).
do $$
declare
  v_agency_id constant uuid := 'a0000000-0000-0000-0000-00000000a000';
  v_client_id constant uuid := 'c0000000-0000-0000-0000-0000000000c0';
  v_integration_id constant uuid := 'c0000000-0000-0000-0000-0000000000c1';
  v_property_id constant uuid := 'c0000000-0000-0000-0000-0000000000c2';
  v_user_id uuid;
  v_user_email constant text := 'christoph.ludwig@verrodata.com';
  v_user_password constant text := '#Monnem_87.';
begin
  -- 1. Agency
  insert into public.agencies (id, name)
  values (v_agency_id, 'verrodata')
  on conflict (id) do nothing;

  -- 2. Client
  insert into public.clients (id, agency_id, name, timezone)
  values (v_client_id, v_agency_id, 'Consors Finanz', 'Europe/Berlin')
  on conflict (id) do nothing;

  -- 3. Integration placeholder — Adobe credentials set later via admin UI
  insert into public.integrations (id, client_id)
  values (v_integration_id, v_client_id)
  on conflict (id) do nothing;

  -- 4. Example property (report suite) — placeholder RSID
  insert into public.properties
    (id, client_id, integration_id, adobe_report_suite_id, name, status, poll_interval_minutes)
  values
    (v_property_id, v_client_id, v_integration_id,
     'consorsfinanz.web.prod', 'Consors Finanz — Web Production', 'active', 60)
  on conflict (id) do nothing;

  -- 5. Auth user — bcrypt-hashed password via pgcrypto
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  select
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    v_user_email,
    crypt(v_user_password, gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', 'Christoph Ludwig'),
    now(),
    now(),
    '',
    '',
    '',
    ''
  where not exists (
    select 1 from auth.users where email = v_user_email
  );

  -- Resolve the user's ID (whether just inserted or pre-existing)
  select id into v_user_id from auth.users where email = v_user_email;

  -- auth.identities row is required so the email provider is registered
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  select
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_user_email),
    'email',
    v_user_id::text,
    now(),
    now(),
    now()
  where not exists (
    select 1 from auth.identities
    where user_id = v_user_id and provider = 'email'
  );

  -- 6. Membership — Christoph is agency_admin on verrodata
  insert into public.memberships (user_id, agency_id, client_id, role)
  values (v_user_id, v_agency_id, null, 'agency_admin')
  on conflict (user_id) do update set
    agency_id = excluded.agency_id,
    client_id = excluded.client_id,
    role = excluded.role;

  -- 7. Default health checks for the Consors Finanz property (D1–D5)
  insert into public.checks (property_id, kind, name, visible_to_client, weight_tier, sensitivity_tier, config)
  values
    (v_property_id, 'd1_data_arrival', 'Data arrival', true, 'critical', 'medium', '{}'),
    (v_property_id, 'd2_volume_plausibility', 'Volume plausibility', true, 'critical', 'medium', '{}'),
    (v_property_id, 'd3_event_variable_presence', 'Event / variable presence', true, 'critical', 'medium', '{}'),
    (v_property_id, 'd4_page_name_nullness', 'Page name coverage', true, 'critical', 'medium', '{}'),
    (v_property_id, 'd5_tag_delivery', 'Tag delivery confirmation', true, 'critical', 'medium', '{}')
  on conflict do nothing;

  raise notice 'Seed complete: verrodata / Consors Finanz / % (agency_admin)', v_user_email;
end $$;
