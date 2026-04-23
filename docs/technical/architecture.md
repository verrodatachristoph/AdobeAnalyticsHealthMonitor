# Architecture

## High-level

```
        ┌───────────────────┐
        │  Adobe Analytics  │  (Analytics 2.0 API + optionally Data Feeds)
        └─────────┬─────────┘
                  │ scheduled pull (Edge Function / Vercel Cron)
                  ▼
        ┌───────────────────┐
        │     Supabase      │   Postgres + Auth + Realtime + Edge Functions + Vault
        │  ─ snapshots      │
        │  ─ anomalies      │
        │  ─ events         │
        └─────────┬─────────┘
                  │  RLS-gated reads, Realtime pushes
                  ▼
        ┌───────────────────┐
        │  Next.js (Vercel) │   App Router, Server Components by default
        │  ─ Overview       │
        │  ─ Properties     │
        │  ─ Anomalies      │
        │  ─ Settings       │
        └───────────────────┘
                  ▲
                  │ magic-link / email+password (no signup)
                  │
              Users (agency_admin | agency_analyst | client_viewer)
```

## Major components

### Ingestion (Adobe → Supabase)
- One scheduler (Vercel Cron OR Supabase `pg_cron`; pick one — leaning Vercel Cron for simplicity).
- Per-property `next_poll_at` field; scheduler picks due rows, calls relevant adapter.
- Adapters: Analytics 2.0 API adapter, Data Feeds adapter (later).
- Idempotent writes to `metric_snapshots` keyed by `(property_id, metric, ts_bucket)`.
- Retries with backoff respecting Adobe `Retry-After`.

### Detection
- Runs after each successful ingest for the affected property.
- Loads recent snapshots, computes baseline + score per enabled check.
- On state transition, writes to `anomalies` and `events`; Realtime broadcasts to subscribed clients.

### App
- Next.js App Router on Vercel.
- Server Components for initial render with the user's JWT scope.
- Client Components subscribe to Realtime for live updates.
- Middleware redirects unauthenticated requests to `/sign-in`. No public route exists.

### Auth & tenancy
- Supabase Auth (signup disabled). Admin-API user provisioning via Edge Function.
- `memberships(user_id, agency_id, client_id?, role)` is the source of truth for permissions.
- All business tables RLS-enabled; policies use `auth.user_client_ids()` SECURITY DEFINER helper.

## Open architectural decisions

These need to be resolved before schema lock-in. Each is flagged in CLAUDE.md and should be discussed with the user.

1. **Adobe ingestion source mix.** Analytics 2.0 API only, or also Data Feeds (S3/SFTP)? Affects Edge Function vs. external worker question and storage.
2. **Scheduler.** Vercel Cron vs Supabase `pg_cron`. Recommend Vercel Cron for v1 — closer to app code, easier observability.
3. **Component library.** shadcn/ui (max design control) vs Tremor (dashboard-native primitives). Recommend shadcn/ui because the design needs to feel custom, not template-y.
4. **Notification surface.** v1 in-app only, or include email at v1?
5. **Multi-agency support.** Is this single-tenant for verrodata, or designed to host other agencies later? Affects tenancy depth and white-labeling.

## Non-goals (architecture)

- No microservices. Single Next.js app + Supabase backend.
- No custom ML models in v1. Statistical detection is sufficient and explainable.
- No mobile app. Responsive web is the deliverable.
- No real-time data streaming from Adobe (they don't offer it usefully). Polling is the model.
