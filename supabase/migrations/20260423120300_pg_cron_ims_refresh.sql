-- Schedule Adobe IMS token refresh via pg_cron.
-- Governing doc: docs/features/data-acquisition.md (token refresh cadence).
--
-- Strategy:
--   pg_cron fires every 10 minutes → calls the `adobe-ims-refresh` Edge Function
--   → the function picks all integrations whose tokens expire in the next 60m
--   and refreshes them. Safer than per-integration scheduling (which would
--   thrash pg_cron's job table).
--
-- Secrets: `app.cron_secret` is a database-level setting you configure via the
-- Supabase dashboard (Project Settings → Database → Postgres config) or by
-- running `ALTER DATABASE postgres SET app.cron_secret = '...';` locally.
-- The Edge Function verifies the header against CRON_SECRET env var (same value).

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Idempotent: drop-then-schedule so re-running the migration is safe.
do $$
begin
  perform cron.unschedule('adobe-ims-refresh');
exception when others then
  -- No existing schedule; that's fine.
  null;
end $$;

-- Schedule every 10 minutes. On Supabase, pg_net is the HTTP client inside
-- Postgres; `net.http_post` returns a request_id synchronously and does the
-- actual HTTP call asynchronously.
select cron.schedule(
  'adobe-ims-refresh',
  '*/10 * * * *',
  $$
  select net.http_post(
    url := current_setting('app.supabase_url', true) || '/functions/v1/adobe-ims-refresh',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret', true)
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);

-- On hosted Supabase, app.supabase_url is set automatically. For local dev,
-- run: ALTER DATABASE postgres SET app.supabase_url = 'http://host.docker.internal:54321';
-- and:  ALTER DATABASE postgres SET app.cron_secret = 'your-secret-here';
comment on extension pg_cron is 'Required for scheduled IMS refresh; see 20260423120300_pg_cron_ims_refresh.sql';
