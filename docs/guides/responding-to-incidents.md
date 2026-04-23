# Guide — responding to incidents

The standard workflow when an anomaly fires. Designed to be predictable so the client experience is consistent regardless of which analyst is on duty.

## Step 0 — does the dashboard itself look healthy?

Before treating an anomaly as real, confirm the data freshness check is green for the affected property. If freshness is also degraded, the issue is likely upstream (Adobe-side or our ingestion). Don't escalate a downstream check while freshness is failing — note "gated by freshness" and wait.

## Step 1 — open the anomaly

From the Anomalies log → click the row. You'll see:
- The metric, its current value, and the baseline range.
- A chart with the baseline overlaid (band) and the anomaly window highlighted.
- Corroborating signals (other checks that are also off-baseline at the same time).
- A "what could cause this" panel listing typical root causes for this check type.

## Step 2 — form a working hypothesis

Use the corroborating signals + recent annotations + your knowledge of the client's release schedule. Common patterns:

- **Hit volume + eVar populations + page-name nullness all dropped** → tag deployment broke. Check Launch / GTM publish history.
- **Hit volume dropped, everything else normal** → traffic-side issue (paused campaign, site downtime).
- **Conversion events dropped, hits normal** → conversion tracking broken OR the funnel itself broken. Need product team to disambiguate.
- **Marketing channel mix shifted, totals normal** → channel processing rule changed or a marketing source changed UTM patterns.
- **Bot share spiked** → bot filter rules misconfigured, or actual bot invasion.

## Step 3 — acknowledge

Click "Acknowledge." Required fields:
- **Working hypothesis** (1–2 sentences). This is agency-only.
- **Estimated impact:** none / partial / full data loss for this metric.
- **Optional:** link to a deploy / Slack thread / ticket.

The client view now reads `We're investigating an issue with [plain-language metric name]`.

## Step 4 — coordinate a fix

Off-platform — Slack, email, the client's engineering team. The dashboard is the status surface, not a ticketing system. Keep updates flowing back to the ack note for internal continuity.

## Step 5 — confirm recovery

When the metric returns to baseline, the system flags the anomaly as recoverable. After N consecutive healthy intervals (default 3), the system auto-suggests resolution. You can accept or hold open if recovery is partial.

## Step 6 — resolve

Click "Resolve." Required:
- **Resolution note** in plain language. **This is what the client sees.** Write it like a status-page postmortem entry — concise, blame-free, actionable.

Example resolution notes:
- "Tracking dropped on the checkout flow Tuesday 14:02 due to a code deploy that omitted the conversion tag. Restored by [Agency] in coordination with [Client] engineering at 16:48. No data was permanently lost for hits during the window."
- "Marketing channel attribution shifted on Wednesday morning when a new UTM pattern from the brand campaign wasn't matched by an existing channel rule. We added a new rule and retroactive classification will normalize the historical data within Adobe's processing window."

## Step 7 — post-incident hygiene

- Add an annotation if this incident type is likely to recur (e.g., "weekly campaign launch every Tuesday 09:00").
- If the same root cause has now triggered N times, consider whether a permanent fix or a check refinement is warranted.
- The incident stays in the timeline indefinitely as evidence of value.
