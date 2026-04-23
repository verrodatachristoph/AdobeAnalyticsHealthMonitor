# Auth & tenancy

## Auth surface

- **Supabase Auth.** Public sign-up disabled in project settings.
- Sign-in methods:
  - **Magic link** (default for `client_viewer`)
  - **Email + password** (default for agency staff)
- Single sign-in route: `/sign-in`. No `/sign-up`, no `/forgot-password` flow before v1.1 (admin reset for now).
- Root path `/` redirects to `/sign-in` (unauthenticated) or `/` of the app shell (authenticated). No marketing route.

## User provisioning

Users are created by agency admins via:
- Settings → Users → "Invite user"
- Invite payload: name, email, target client (or "agency-wide"), role.
- Backend: a server action calls a Supabase Edge Function holding the service-role key. The Edge Function:
  1. Calls `admin.createUser` (no signup flow).
  2. Inserts the `memberships` row in the same transaction.
  3. Sends the invite email (magic-link or set-password depending on role).

Service-role key never reaches the browser. The Edge Function is invoked from server actions only.

## Roles

| Role | Scope | Reads | Writes |
|---|---|---|---|
| `agency_admin` | Agency-wide | Everything in their agency | Everything in their agency |
| `agency_analyst` | Agency-wide | Everything in their agency | Anomaly acks, annotations, threshold tunes |
| `client_viewer` | One client | Their client's properties only (filtered) | Nothing |

A user has exactly one role. Multi-role accounts are out of scope for v1.

## RLS philosophy

Every business table has RLS enabled, by default, on day one. Policies are written so that:
- Reads use `client_id IN (SELECT auth.user_client_ids())`.
- Writes additionally check `role IN ('agency_admin','agency_analyst')`.
- Service role bypasses RLS for ingestion + provisioning — explicit and audited.

**Test before merge:** every PR that touches RLS includes SQL that simulates each role and confirms the expected row counts.

## Defense in depth

The "client A must never see client B" invariant is enforced at three independent layers:
1. **Database (Supabase RLS)** — primary defense.
2. **Server fetch logic** — server components/actions filter by `auth.user_client_ids()` even though RLS would also catch it.
3. **Route gating** — middleware + layout-level checks prevent navigation to forbidden routes (Settings returns 404 to client_viewers — don't reveal it exists).

Any one layer breaking would not by itself cause a leak.

## Session lifetime

- Supabase default JWT expiry is 1 hour with refresh.
- `client_viewer` magic-link sessions: 14-day refresh window. Re-authenticate via magic link.
- Agency staff sessions: shorter (24h refresh recommended) given write privileges.

## Audit

`events` table captures every state-changing action with `actor_user_id`. This is the audit log; do not delete or summarize. Cheap to keep.
