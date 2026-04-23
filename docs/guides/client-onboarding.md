# Guide — client onboarding (agency-side)

A repeatable checklist for bringing a new client onto the dashboard. The goal: when the client first opens the link, they see a populated, healthy dashboard with no setup screens.

## Pre-onboarding (agency only)

1. **Confirm Adobe access.** Obtain Adobe IMS credentials with read access to the relevant report suites. Use a service-account credential, not a personal user.
2. **Identify the report suites.** List every suite to monitor. For multi-suite clients, decide whether to monitor each individually or roll up.
3. **Identify the timezone.** This drives baseline math (day-of-week alignment).
4. **Identify recurring events** (e.g., known weekly maintenance windows, monthly campaigns). These become annotations.

## In-app setup (agency admin)

1. Settings → Clients → "Add client."
2. Fill: name, timezone, brand color/logo (optional, for any future client-branded touches).
3. Add each property: name, Adobe report suite ID, credentials reference.
4. Apply the default check pack. Disable any check that's clearly wrong for this client (e.g., bot traffic check on an internal-only intranet suite).
5. Add baseline annotations: the recurring campaigns, known seasonality, scheduled maintenance.

## Backfill phase

The system kicks off a backfill that pulls ~28 days of historical data to seed baselines. Status visible on each property as `Backfilling baseline`.

- For Analytics 2.0 API sources: typically completes in 10–30 minutes.
- For Data Feeds sources: depends on volume; can take hours.

**Do not invite the client viewer until backfill completes** and you've reviewed 24h of post-backfill data for false positives.

## Post-backfill review (agency analyst)

1. Open the property's Overview as the agency role.
2. Look for any check showing `Watch` or higher. Investigate root cause.
3. If the cause is "baseline isn't representative yet" — wait another day.
4. If the cause is "this client's pattern is unusual" — tune the check sensitivity or baseline window.
5. Goal: the property is consistently `Healthy` for at least 24 hours with no spurious anomalies.

## Inviting the client

1. Settings → Users → "Invite user."
2. Role: `client_viewer`. Scope: this client.
3. Send invite. The system delivers an email with a magic-link sign-in.
4. Customize the invite copy with a personal message — this is the agency's voice, not a generic SaaS welcome.
5. (Optional) Send a separate human email/note from the account director to set expectations: "We've been monitoring your tracking for the past week — here's the link to your live dashboard."

## First-session experience (what the client sees)

- Magic link → directly to Overview, already populated.
- Status: Healthy. Recent timeline shows the past week of (likely empty) anomaly history.
- Optional dismissible callout: "Hi [Name], your health dashboard is live. We've been monitoring 27 checks since [date]."
- No tutorial modal, no setup wizard, no empty state.

## What to communicate to the client

Three messages, ideally over the first week:
1. **Day 0 (invite email):** "Your health dashboard is live."
2. **Day 1–3:** "Here's what we monitor and how you can interpret the status."
3. **Day 30:** "Here's a summary of what we caught and resolved this month."

That third message — even if "we caught nothing because everything was healthy" — anchors the value of ongoing monitoring.
