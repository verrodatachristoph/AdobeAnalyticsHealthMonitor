# Data model

> Status: **draft for review.** Schema is illustrative; will be finalized after the Adobe ingestion source mix is decided.

## Entities

### `agencies`
The top-level tenant. v1 has one row (verrodata) but the model supports multi-agency.

```
agencies
  id               uuid PK
  name             text
  created_at       timestamptz default now()
```

### `clients`
A client of an agency. Owns one or more properties.

```
clients
  id               uuid PK
  agency_id        uuid → agencies(id)
  name             text
  timezone         text          -- IANA tz, drives baseline math
  created_at       timestamptz default now()
```

### `properties`
An Adobe Analytics report suite under monitoring.

```
properties
  id                       uuid PK
  client_id                uuid → clients(id)
  name                     text
  adobe_report_suite_id    text          -- Adobe RSID
  adobe_company_id         text
  credentials_ref          uuid          -- pointer to encrypted credential row
  status                   text          -- active | paused
  created_at               timestamptz default now()
```

### `memberships`
Joins `auth.users` to agencies/clients with a role.

```
memberships
  id               uuid PK
  user_id          uuid → auth.users(id)
  agency_id        uuid → agencies(id)
  client_id        uuid → clients(id) NULL    -- NULL means agency-wide scope
  role             text                       -- agency_admin | agency_analyst | client_viewer
  created_at       timestamptz default now()
```

### `checks`
A configured monitoring rule on a property.

```
checks
  id                       uuid PK
  property_id              uuid → properties(id)
  type                     text                       -- hit_volume | page_null_rate | etc.
  enabled                  boolean default true
  config                   jsonb                       -- baseline window, weights, etc.
  severity_mapping         jsonb                       -- score → severity tier
  next_run_at              timestamptz
  created_at               timestamptz default now()
```

### `metric_snapshots`
Time-series of raw metric values. Largest table by row count — partition by month, drop after 13-month retention (so YoY compare always works).

```
metric_snapshots
  id               bigint PK
  property_id      uuid → properties(id)
  metric           text                          -- e.g. 'hit_volume', 'conv_event_purchase'
  ts_bucket        timestamptz                   -- aligned to metric's natural bucket
  value            numeric
  baseline_low     numeric                       -- precomputed at write time
  baseline_high    numeric
  ingested_at      timestamptz default now()

  unique (property_id, metric, ts_bucket)
  partition by range (ts_bucket)
```

### `anomalies`
A detected period during which a check was outside healthy range.

```
anomalies
  id               uuid PK
  property_id      uuid → properties(id)
  check_id         uuid → checks(id)
  severity         text                          -- watch | degraded | critical
  state            text                          -- detected | investigating | resolved | muted
  started_at       timestamptz
  ended_at         timestamptz NULL              -- NULL while ongoing
  ack_user_id      uuid → auth.users(id) NULL
  ack_note         text NULL
  ack_at           timestamptz NULL
  resolution_note  text NULL
  resolved_at      timestamptz NULL
```

### `events`
Append-only log of state transitions for the timeline view.

```
events
  id               bigint PK
  property_id      uuid → properties(id)
  anomaly_id       uuid → anomalies(id) NULL
  type             text                          -- detected | acknowledged | resolved | muted | annotation
  ts               timestamptz
  actor_user_id    uuid NULL                     -- NULL for system-generated
  message          text
```

### `annotations`
Agency-supplied known events (campaign launches, deploys, holidays) that suppress and contextualize anomalies.

```
annotations
  id               uuid PK
  property_id      uuid → properties(id) NULL    -- NULL = applies to whole client
  client_id        uuid → clients(id) NULL       -- NULL = applies to whole agency
  starts_at        timestamptz
  ends_at          timestamptz
  label            text
  suppress_checks  text[]                        -- check types to suppress during window
  created_by       uuid → auth.users(id)
```

## Indexes (initial)

- `metric_snapshots (property_id, metric, ts_bucket desc)` — primary query pattern
- `anomalies (property_id, started_at desc)` — incident lists
- `anomalies (state) where state in ('detected','investigating')` — partial index for active set
- `events (property_id, ts desc)` — timeline view

## RLS policy archetypes

```sql
-- Helper: returns set of client_ids visible to current user
create or replace function auth.user_client_ids()
returns setof uuid language sql stable security definer as $$
  select coalesce(client_id, c.id)
  from memberships m
  left join clients c on c.agency_id = m.agency_id
  where m.user_id = auth.uid()
$$;

-- Read policy archetype
create policy "select_for_member" on properties
  for select using (client_id in (select auth.user_client_ids()));

-- Mutation policy archetype (agency only)
create policy "mutate_for_agency" on checks
  for all using (
    exists (
      select 1 from memberships m
      where m.user_id = auth.uid()
        and m.role in ('agency_admin','agency_analyst')
    )
  );
```

Service-role-only operations (ingestion writes, user provisioning) bypass RLS via the service-role key — but only Edge Functions/server actions ever use it.
