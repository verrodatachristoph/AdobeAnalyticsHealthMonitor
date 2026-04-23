# Client management

This is an agency-only feature area covering how verrodata adds clients, configures their monitoring, and provisions client-viewer accounts.

## Adding a client

A new client record requires:
- Name + brand assets (optional; for any future client-branded touches)
- Timezone (drives day-of-week baseline math)
- One or more **properties** = Adobe Analytics report suite IDs
- Adobe credentials (encrypted at rest via Supabase Vault / `pgsodium`)

After creation, the system begins backfilling baselines (typically 28 days of historical data). The client viewer is not invited until backfill completes — they should never see an empty state.

## Configuring properties

Each property has:
- Which checks are enabled (default: full pack)
- Per-check threshold overrides (sensitivity, baseline window)
- Mute schedules (recurring or one-off, e.g., `mute hit-volume check Sundays 02:00–04:00 for maintenance window`)
- Annotations (planned campaign launches, known deploys) — suppress alerts during these windows and surface them on charts

## Inviting client users

- Agency admin enters name + email + scoped client.
- System sends a magic-link invite email, agency-branded (not "Welcome to [Product]").
- On first click, the user lands on their populated Overview — no welcome modal, no setup wizard.
- The invite link is single-use; subsequent sign-ins use email-based magic links.

## Client viewer permissions (hard guarantees)

A `client_viewer` user can NEVER:
- See any other client's data
- See agency-only checks, raw thresholds, or API errors
- Modify any configuration
- See `detected` (un-investigated) anomalies
- See acknowledgement notes that haven't been published as resolution summaries
- See the Settings area (returns 404, not 403 — don't reveal it exists)

These are enforced at three layers:
1. Supabase RLS (database)
2. Server component fetch logic (server)
3. Route gating in the layout (client navigation)

A regression at any one layer would leak data; all three exist as defense in depth.
