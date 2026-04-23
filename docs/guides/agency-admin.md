# Guide — agency admin operations

Reference for running the platform as an admin: managing clients, users, checks, and overall hygiene.

## Daily

- **Skim the Overview** across all clients. Most days this takes under a minute — the goal is "all healthy, move on."
- **Triage open anomalies** in the Anomalies log. Acknowledge with a working hypothesis if you're investigating; resolve with a public-friendly note when done.

## Weekly

- **Review noise.** Pull the list of checks that triggered `Watch` more than ~3 times in the past week without escalating. These are candidates for tuning.
- **Review acknowledgements.** Anything still in `investigating` after 48h needs a status update or a decision (escalate, mute, or resolve with explanation).
- **Review annotations.** Anything coming up next week that should be pre-annotated?

## Monthly

- **Per-client health summary.** Generate the monthly summary for each active client (handover to the account director for distribution).
- **Tune baselines on properties** whose underlying business has shifted (e.g., a major site redesign 2 weeks ago means baselines need a forced refresh).
- **Audit users.** Settings → Users. Remove anyone who shouldn't have access (departed staff, wound-down clients).

## Adding a new check globally

If you find yourself wishing the platform monitored something it doesn't:
1. Add a new check type to `lib/health/checks/` (engineering work).
2. Make it opt-in per property initially. Don't enable globally until it's proven low-noise on at least one client.
3. Document the new check in `docs/features/health-checks.md`.

## Provisioning agency users

Settings → Users → "Invite user."
- `agency_admin` for senior staff who need to add clients/users.
- `agency_analyst` for analysts who acknowledge and tune but shouldn't add clients.

## Decommissioning a client

1. Set client status to `paused` (Settings → Clients → [client] → "Pause monitoring"). This stops ingestion but keeps history.
2. Inform the client; their dashboard will continue to show the historical timeline.
3. After contractual handover period, archive the client (soft-delete; their data is retained per the data retention policy).
4. Revoke client_viewer accounts associated with the client.

## Things to never do

- Never add a check `enabled: true` for all properties without piloting first — instant noise across every client.
- Never grant a client_viewer role to anyone outside that client's organization. Agency staff use agency roles; vendor partners need their own auth model (out of scope for v1).
- Never log into Supabase directly to "fix" a row visible in the dashboard. If the dashboard is wrong, fix the underlying detection logic; don't paper over it with manual edits.
