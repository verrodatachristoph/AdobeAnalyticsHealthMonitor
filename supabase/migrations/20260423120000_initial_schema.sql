-- Adobe Analytics Health Monitor — initial schema
-- Governing docs: docs/technical/data-model.md + docs/technical/auth-and-tenancy.md
--
-- Invariant: client A MUST NEVER see client B's data. RLS is enabled on every
-- business table. Helper function auth.user_client_ids() gates all read policies.
-- Service-role bypasses RLS for ingestion and admin operations only.

-- Required extensions
create extension if not exists "pgcrypto" with schema "extensions";

-- ============================================================================
-- Tenancy tables: agencies → clients → properties
-- ============================================================================

create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete restrict,
  name text not null,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);
create index clients_agency_id_idx on public.clients (agency_id);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  adobe_company_id text,
  adobe_organization_id text,
  technical_account_id text,
  client_id_adobe text,
  client_secret_vault_id uuid,            -- pointer into vault.secrets
  access_token_vault_id uuid,
  access_token_expires_at timestamptz,
  last_validated_at timestamptz,
  created_at timestamptz not null default now()
);
create index integrations_client_id_idx on public.integrations (client_id);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  integration_id uuid not null references public.integrations(id) on delete restrict,
  adobe_report_suite_id text not null,
  name text not null,
  status text not null default 'active'
    check (status in ('active', 'paused', 'archived')),
  next_poll_at timestamptz,
  poll_interval_minutes int not null default 60,
  created_at timestamptz not null default now(),
  unique (client_id, adobe_report_suite_id)
);
create index properties_client_id_idx on public.properties (client_id);
create index properties_next_poll_at_idx on public.properties (next_poll_at)
  where status = 'active';

-- ============================================================================
-- Memberships — the source of truth for authorization
-- ============================================================================
-- A user has exactly one membership in v1. client_id NULL means agency-wide scope.
-- Role drives what the user can see and do.

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  role text not null check (role in ('agency_admin', 'agency_analyst', 'client_viewer')),
  created_at timestamptz not null default now()
);
create index memberships_user_id_idx on public.memberships (user_id);
create index memberships_agency_id_idx on public.memberships (agency_id);

-- ============================================================================
-- Security-definer helper: which client_ids can the current user see?
--
-- Called from every read policy on business tables. Queries memberships live
-- (NOT from JWT claims) to avoid staleness — per supabase-platform-engineer
-- gotcha #1 in docs/technical/architecture.md.
-- ============================================================================

create or replace function public.user_client_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public, auth
as $$
  -- Client-scoped user: only their own client
  select client_id
  from public.memberships
  where user_id = auth.uid() and client_id is not null
  union
  -- Agency-scoped user (client_id IS NULL): all clients in their agency
  select c.id
  from public.clients c
  join public.memberships m on m.agency_id = c.agency_id
  where m.user_id = auth.uid() and m.client_id is null;
$$;

revoke all on function public.user_client_ids() from public;
grant execute on function public.user_client_ids() to authenticated;

-- Convenience helper for "is this user agency-scoped?"
create or replace function public.is_agency_role()
returns boolean
language sql
security definer
stable
set search_path = public, auth
as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid()
      and role in ('agency_admin', 'agency_analyst')
  );
$$;
revoke all on function public.is_agency_role() from public;
grant execute on function public.is_agency_role() to authenticated;

-- ============================================================================
-- Checks, snapshots, anomalies, events, annotations
-- ============================================================================

create table public.checks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  kind text not null,                    -- 'd1_data_arrival','d2_volume',...,'custom_kpi'
  name text not null,
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  severity_mapping jsonb not null default '{}'::jsonb,
  visible_to_client boolean not null default false,
  weight_tier text not null default 'standard'
    check (weight_tier in ('standard', 'elevated', 'critical')),
  sensitivity_tier text not null default 'medium'
    check (sensitivity_tier in ('low', 'medium', 'high')),
  baseline_window_days smallint not null default 28
    check (baseline_window_days in (14, 28)),
  cold_start_until timestamptz,
  muted_until timestamptz,
  mute_reason text,
  last_evaluated_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  owned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index checks_property_id_idx on public.checks (property_id);
create index checks_enabled_idx on public.checks (enabled) where enabled;

-- Starred KPIs (per user, per check) — client_viewer's only write action
create table public.starred_checks (
  user_id uuid not null references auth.users(id) on delete cascade,
  check_id uuid not null references public.checks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, check_id)
);
create index starred_checks_check_id_idx on public.starred_checks (check_id);

-- Time-series: largest table by row count. Partitioned monthly from day 1.
-- PK includes ts_bucket because partition key must be in PK.
create table public.metric_snapshots (
  id bigint generated always as identity,
  property_id uuid not null references public.properties(id) on delete cascade,
  metric text not null,
  ts_bucket timestamptz not null,
  value double precision not null,
  baseline_low double precision,
  baseline_high double precision,
  ingested_at timestamptz not null default now(),
  primary key (id, ts_bucket),
  unique (property_id, metric, ts_bucket)
) partition by range (ts_bucket);

create index metric_snapshots_lookup_idx
  on public.metric_snapshots (property_id, metric, ts_bucket desc);

-- Initial monthly partitions — rolling, managed by a pg_cron job later.
-- For now, 3 months backward + 3 months forward of 2026-04-23.
create table public.metric_snapshots_2026_02 partition of public.metric_snapshots
  for values from ('2026-02-01') to ('2026-03-01');
create table public.metric_snapshots_2026_03 partition of public.metric_snapshots
  for values from ('2026-03-01') to ('2026-04-01');
create table public.metric_snapshots_2026_04 partition of public.metric_snapshots
  for values from ('2026-04-01') to ('2026-05-01');
create table public.metric_snapshots_2026_05 partition of public.metric_snapshots
  for values from ('2026-05-01') to ('2026-06-01');
create table public.metric_snapshots_2026_06 partition of public.metric_snapshots
  for values from ('2026-06-01') to ('2026-07-01');
create table public.metric_snapshots_2026_07 partition of public.metric_snapshots
  for values from ('2026-07-01') to ('2026-08-01');

create table public.anomalies (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  check_id uuid not null references public.checks(id) on delete cascade,
  contributing_checks uuid[] not null default '{}',   -- for grouped incidents
  severity text not null
    check (severity in ('watch', 'degraded', 'critical', 'stale_kpi')),
  state text not null default 'detected'
    check (state in ('detected', 'investigating', 'resolved', 'monitoring')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  ack_user_id uuid references auth.users(id) on delete set null,
  ack_note text,
  ack_at timestamptz,
  resolution_note text,      -- client-safe; appears in client view
  resolved_at timestamptz,
  client_would_have_noticed boolean,        -- analyst-tagged; powers QBR hero metric
  estimated_data_at_risk text,              -- free-form ("homepage campaign performance")
  root_cause_category text,                 -- taxonomy: tag | deploy | adobe_side | seasonal | other
  tags_touched text[],
  reports_affected text[],
  created_at timestamptz not null default now()
);
create index anomalies_property_id_started_at_idx
  on public.anomalies (property_id, started_at desc);
create index anomalies_state_active_idx
  on public.anomalies (state)
  where state in ('detected', 'investigating');

create table public.events (
  id bigint generated always as identity primary key,
  property_id uuid not null references public.properties(id) on delete cascade,
  anomaly_id uuid references public.anomalies(id) on delete cascade,
  type text not null,
  ts timestamptz not null default now(),
  actor_user_id uuid references auth.users(id) on delete set null,
  message text
);
create index events_property_id_ts_idx on public.events (property_id, ts desc);
create index events_anomaly_id_idx on public.events (anomaly_id);

create table public.annotations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  label text not null,
  description text,
  suppress_checks text[] not null default '{}',
  suppresses_alerts boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (starts_at < ends_at),
  check (property_id is not null or client_id is not null)
);
create index annotations_property_id_idx on public.annotations (property_id, starts_at desc);
create index annotations_client_id_idx on public.annotations (client_id, starts_at desc);

-- ============================================================================
-- Row-Level Security — enabled on every business table
-- ============================================================================

alter table public.agencies enable row level security;
alter table public.clients enable row level security;
alter table public.integrations enable row level security;
alter table public.properties enable row level security;
alter table public.memberships enable row level security;
alter table public.checks enable row level security;
alter table public.starred_checks enable row level security;
alter table public.metric_snapshots enable row level security;
alter table public.anomalies enable row level security;
alter table public.events enable row level security;
alter table public.annotations enable row level security;

-- Read policies — every row scoped to auth.user_client_ids()

create policy agencies_read on public.agencies for select to authenticated
  using (
    exists (
      select 1 from public.memberships
      where user_id = auth.uid() and agency_id = agencies.id
    )
  );

create policy clients_read on public.clients for select to authenticated
  using (id in (select public.user_client_ids()));

create policy properties_read on public.properties for select to authenticated
  using (client_id in (select public.user_client_ids()));

create policy integrations_read on public.integrations for select to authenticated
  using (
    public.is_agency_role()
    and client_id in (select public.user_client_ids())
  );

create policy checks_read on public.checks for select to authenticated
  using (
    property_id in (
      select p.id from public.properties p
      where p.client_id in (select public.user_client_ids())
    )
  );

create policy starred_checks_read on public.starred_checks for select to authenticated
  using (user_id = auth.uid());

create policy metric_snapshots_read on public.metric_snapshots for select to authenticated
  using (
    property_id in (
      select p.id from public.properties p
      where p.client_id in (select public.user_client_ids())
    )
  );

create policy anomalies_read on public.anomalies for select to authenticated
  using (
    property_id in (
      select p.id from public.properties p
      where p.client_id in (select public.user_client_ids())
    )
    and (
      -- Agency sees everything
      public.is_agency_role()
      -- Clients see only post-ack states
      or state in ('investigating', 'resolved')
    )
  );

create policy events_read on public.events for select to authenticated
  using (
    property_id in (
      select p.id from public.properties p
      where p.client_id in (select public.user_client_ids())
    )
    and (
      public.is_agency_role()
      -- Clients only see state transitions to investigating/resolved
      or type in ('investigating', 'resolved')
    )
  );

create policy annotations_read on public.annotations for select to authenticated
  using (
    (property_id is not null and property_id in (
      select p.id from public.properties p
      where p.client_id in (select public.user_client_ids())
    ))
    or
    (client_id is not null and client_id in (select public.user_client_ids()))
  );

create policy memberships_read on public.memberships for select to authenticated
  using (
    user_id = auth.uid()
    -- Agency admins can read other memberships in their agency
    or (
      public.is_agency_role()
      and agency_id in (
        select agency_id from public.memberships where user_id = auth.uid()
      )
    )
  );

-- Write policies — only agency roles can mutate; clients only star

create policy checks_write_agency on public.checks for all to authenticated
  using (public.is_agency_role())
  with check (public.is_agency_role());

create policy anomalies_update_agency on public.anomalies for update to authenticated
  using (public.is_agency_role())
  with check (public.is_agency_role());

create policy annotations_write_agency on public.annotations for all to authenticated
  using (public.is_agency_role())
  with check (public.is_agency_role());

create policy events_write_agency on public.events for insert to authenticated
  with check (public.is_agency_role());

-- Clients CAN star their own visible checks; that's their only write action.
create policy starred_checks_insert_self on public.starred_checks for insert to authenticated
  with check (
    user_id = auth.uid()
    and check_id in (
      select c.id from public.checks c
      join public.properties p on p.id = c.property_id
      where p.client_id in (select public.user_client_ids())
        and (public.is_agency_role() or c.visible_to_client)
    )
  );

create policy starred_checks_delete_self on public.starred_checks for delete to authenticated
  using (user_id = auth.uid());

-- Agency admin-only writes on tenancy tables. agency_analyst cannot create
-- clients/properties/integrations. Service role bypasses all of this for
-- ingestion and provisioning operations from Edge Functions.

create or replace function public.is_agency_admin()
returns boolean
language sql
security definer
stable
set search_path = public, auth
as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid() and role = 'agency_admin'
  );
$$;
revoke all on function public.is_agency_admin() from public;
grant execute on function public.is_agency_admin() to authenticated;

create policy clients_write_admin on public.clients for all to authenticated
  using (public.is_agency_admin())
  with check (public.is_agency_admin());

create policy properties_write_admin on public.properties for all to authenticated
  using (public.is_agency_admin())
  with check (public.is_agency_admin());

create policy integrations_write_admin on public.integrations for all to authenticated
  using (public.is_agency_admin())
  with check (public.is_agency_admin());

create policy memberships_write_admin on public.memberships for all to authenticated
  using (public.is_agency_admin())
  with check (public.is_agency_admin());

-- ============================================================================
-- Realtime — enable only on tables that drive live UI updates.
-- Do NOT enable on metric_snapshots (high churn, would blow Realtime quotas).
-- ============================================================================

alter publication supabase_realtime add table public.anomalies;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.annotations;
