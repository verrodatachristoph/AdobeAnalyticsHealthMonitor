-- Adobe IMS credential columns (DEV path).
--
-- For v1 scaffold we store Adobe client_secret + access_token as plaintext
-- columns on `integrations`, gated by RLS to agency_admin only and inaccessible
-- to anon / client_viewer roles. Service role (Edge Functions) reads + writes.
--
-- **Before production deploy:** replace with Vault-backed secrets. The
-- migration path is documented in docs/technical/adobe-integration.md —
-- a follow-up migration will add helpers using `vault.create_secret()` and
-- `vault.decrypted_secrets`, then backfill + drop these plaintext columns.
--
-- Don't add rows to these columns from client-side SQL. Writes are exclusively
-- from the agency admin UI (server action) or the IMS refresh Edge Function.

alter table public.integrations
  add column if not exists adobe_client_secret_plaintext text,
  add column if not exists adobe_access_token_plaintext text,
  add column if not exists adobe_refresh_error text,
  add column if not exists adobe_last_refreshed_at timestamptz;

comment on column public.integrations.adobe_client_secret_plaintext is
  'DEV PATH. Migrate to Vault before production deploy.';
comment on column public.integrations.adobe_access_token_plaintext is
  'DEV PATH. Migrate to Vault before production deploy.';
comment on column public.integrations.adobe_refresh_error is
  'Last error message from the IMS refresh Edge Function, null on success.';

-- Narrow the integrations read policy: clients NEVER see credential columns.
-- RLS already restricts the table to agency roles; this is defense in depth.
revoke select (adobe_client_secret_plaintext, adobe_access_token_plaintext)
  on public.integrations from authenticated;

-- Service role can freely read/write — no revoke for service_role.
