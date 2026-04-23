# FAQ — for agency staff

> Internal answers for verrodata analysts and admins.

## How do I add a new check?

Settings → Checks → "Add check." Pick the check type, the property, the baseline window, and severity thresholds. Defaults are sensible for most clients; tune sensitivity only if the default produces noise.

## How do I tune thresholds for a noisy client?

Open the check from the Anomalies log → "Adjust." Increase the score required for each severity tier, or change the baseline window (e.g., from 28 days to 56 for slower-moving B2B clients). Changes apply forward only — they do not retroactively rewrite history.

## What if Adobe is down — how does this dashboard behave?

The data freshness check escalates first, marking affected properties as `Watch`. If freshness is degraded, other checks are gated and won't fire — preventing alert storms during Adobe-side outages. You'll see one "Adobe data lag" event per affected property in the timeline.

## How do I onboard a new client safely?

1. Add the client and properties in Settings.
2. Wait for the backfill to complete (you'll see "Backfilling baseline" on the property until done — typically 10–30 minutes).
3. Review the first 24h of metrics yourself to make sure no false positives are firing.
4. Tune any obvious noise.
5. Then invite the client viewer. They should never see false alarms during their first session.

## What's the difference between "muted" and "acknowledged"?

- **Acknowledged:** "I see this anomaly, I'm working on it." Appears as `Investigating` to the client.
- **Muted:** "This isn't a real issue (e.g., known maintenance window)." Hidden from the client. Use sparingly; muting masks future occurrences of the same root cause.

## Can a client see my acknowledgement notes?

Not directly. Your raw note is agency-only. When you mark an incident `resolved`, you fill in a separate **resolution note** that is published to the client. Write that note in plain language; it's the public record.

## How do I create an annotation for a planned campaign or deploy?

Settings → Annotations → "Add." Specify the time window and which check types to suppress. Anomalies that occur during the window are still recorded but auto-tagged as `expected`, and the timeline shows the annotation as context.

## A client is asking why a number doesn't match their Workspace report. What do I say?

This dashboard uses sampled / summarized data optimized for anomaly detection, not for reporting precision. Report numbers should always come from Workspace. If the difference is meaningful (more than expected sampling variance), it may itself be a signal — investigate the underlying snapshots before assuming it's just sampling.

## How do I provision a new agency staff member?

Settings → Users → "Invite user" → role `agency_admin` or `agency_analyst`. They get an email + password setup link. Two-factor isn't enforced at the app layer (Supabase project setting); enable in Supabase if your security policy requires it.

## A check is consistently noisy on one property. What's the fix order?

1. Check whether the property has unusual seasonality not captured by day-of-week (e.g., monthly billing cycles). If so, switch to a longer baseline window or a Prophet-based detector.
2. Check whether known events (campaigns, releases) are missing annotations. Add them.
3. Lower the check's sensitivity tier if signal-to-noise is fundamentally bad for that metric on that property.
4. As a last resort, disable the check on that property — but document why.
