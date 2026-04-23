# Deployment

## Targets

- **Production:** `<production-domain>` on Vercel, pointed at the production Supabase project.
- **Preview:** auto-generated Vercel preview per PR, pointed at a separate Supabase project (or dedicated schema) so preview deploys never touch production health data.
- **Local:** `pnpm dev`, against either a local Supabase (`supabase start`) or a developer-personal Supabase project.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL          # public, safe in client bundle
NEXT_PUBLIC_SUPABASE_ANON_KEY     # public, RLS-gated
SUPABASE_SERVICE_ROLE_KEY         # SERVER-ONLY. Never imported into client code.
CRON_SECRET                       # shared secret in Authorization header for cron routes
ADOBE_IMS_*                       # one set per agency-owned IMS app, used by ingestion
SENTRY_DSN                        # optional, error tracking
```

A startup-time guard in server-only code asserts that `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` are present and that `NEXT_PUBLIC_*` vars are set. Build fails otherwise.

## Vercel configuration

- **Framework preset:** Next.js
- **Node version:** matches `package.json`'s `engines.node`
- **Cron:** declared in `vercel.json`; cron routes verify `Authorization: Bearer <CRON_SECRET>`.
- **Edge runtime:** middleware only. Cron and ingestion routes run on Node runtime (Adobe SDK + Supabase admin client work better there).
- **Image optimization:** disabled (no images in this app).
- **Function regions:** match Supabase project region for latency.

## Supabase configuration

- **Disabled:** public sign-ups (project settings → Authentication).
- **Enabled:** Row-Level Security on every business table (verified by a CI check that lists tables with RLS off).
- **Realtime:** enabled on `events` and `anomalies` only — don't enable on `metric_snapshots` (too much data churn).
- **Vault / pgsodium:** for Adobe credentials encryption.
- **Backups:** daily, retained per Supabase plan; consider PITR for production.

## CI / GitHub

- PR checks: typecheck, lint, unit tests, build, RLS-coverage check.
- Main branch protected; merges require passing checks + 1 review.
- Release flow: merge to main → Vercel auto-deploys to production.

## Observability

- **Vercel Analytics** for app-level performance.
- **Sentry** for client + server error tracking (optional, recommended).
- **Supabase logs** for database + Edge Function errors.
- The dashboard's own data freshness check serves as a self-check: if ingestion stops working, the dashboard tells us so.

## Rollback

- Vercel: "Promote previous deployment" button — instant revert.
- Supabase migrations: forward-only; rollback by writing a new migration. Don't `down` migrate in production.
