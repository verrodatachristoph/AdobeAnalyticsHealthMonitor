# Customization — custom KPIs, prioritization, and roles

> Goal: agency analysts (and lightly, clients) can shape which KPIs the health view evaluates and elevates — without enabling alert storms, threshold drift, or KPI sprawl.

## Custom KPI — schema sketch

```
custom_kpis {
  id                  uuid PK
  property_id         uuid FK
  created_by          uuid FK            -- author user
  owned_by            uuid FK            -- for orphan detection
  name                text               -- e.g. "Mobile checkout completions"
  metric_id           text               -- Adobe metric, e.g. "metrics/orders"
  segment_id          text nullable      -- Adobe segment ID; null = all traffic
  dimension_filter    jsonb nullable     -- optional per-dimension scoping
  baseline_window     smallint default 28  -- days (14 or 28 in v1)
  sensitivity_tier    enum('low','medium','high')
  weight_tier         enum('standard','elevated','critical')
  visible_to_client   boolean default false
  muted_until         timestamptz nullable
  mute_reason         text nullable
  starred_by          uuid[] default '{}'
  cold_start_until    timestamptz        -- set on creation; cleared when baseline ready
  last_evaluated_at   timestamptz nullable
  created_at          timestamptz
}
```

The metric is **selected from a pre-fetched list** from Adobe's `/reports/metrics?rsid=...`, not a free-text query DSL and not a linked Workspace project ID. Form-backed config keeps validation simple and the surface area auditable.

## Prioritization — three tiers, named, not numeric

`standard` / `elevated` / `critical`. Numeric weights (1–5 stars) cause grade inflation — within two weeks everything is a 5.

| Tier | What it does | Who can set it |
|---|---|---|
| `standard` | Contributes to overall score; cannot alone push status above `Watch` | analyst |
| `elevated` | Can push property to `Degraded` if anomalous | analyst |
| `critical` | Can push property to `Critical` if anomalous | admin only |

In the UI: a segmented control with one-line consequence text, not a number picker.

## Sensitivity — plain language, parameter-mapped

Clients never see "MAD threshold = 3.5." Three named tiers map to detector parameters:

| UI label | MAD multiplier | Min deviation | Consecutive periods | Direction |
|---|---|---|---|---|
| "Notify on big drops only" | 4.5 | 30% | 2 | drop only |
| "Notify on noticeable drops" | 3.0 | 15% | 1 | drop only |
| "Notify on any unusual change" | 2.0 | 8% | 1 | bidirectional (spikes too) |

Agency analysts can additionally see and edit the underlying parameters in a collapsible "Advanced" section. Clients see the label only.

## Composite score interaction

Custom KPIs run *alongside* the five required detectors (D1–D5), never in place of them.

- Required detectors all carry implicit `critical` weight.
- A `standard` custom KPI can only drive the property to `Watch`.
- An `elevated` custom KPI can drive it to `Degraded`.
- Only `critical` custom KPIs (admin-set) can contribute to `Critical`.
- **Cumulative cap:** custom KPI contributions are capped at 40% of total score weight. Prevents a proliferating set of client-flagged KPIs from drowning out structural signals.

## "Watch this" — the lightweight client pattern

A `client_viewer` can star any KPI (default or custom) without changing detection config. Starring does exactly two things:
1. Promotes the KPI to the top of *that user's* property view in a "Your Priorities" section.
2. Adds the user ID to `starred_by[]`, which agency analysts see as an implicit signal of what the client cares about.

Stars do not change alerting math, weight tier, or the score. View-layer preference + soft signal only.

**In scope for v1.** Confirmed: this is the one customization right `client_viewer` has.

## Annotations — first-class objects

```
annotations {
  property_id, start_at, end_at, label,
  created_by, suppresses_alerts: boolean
}
```

UI: date range picker + label + suppression checkbox.

`suppresses_alerts: true` auto-acknowledges anomalies detected in the window. Analysts create proactively (planned deploy) or retroactively (campaign spike). Clients see annotations on charts as muted bands with the label as tooltip — they cannot create or edit in v1.

## Mute vs Acknowledge

- **Acknowledge** — action on a specific anomaly event. Marks reviewed (with optional note), removes from active queue, stays in history.
- **Mute** — forward-looking suppression on a specific KPI for a **mandatory finite duration, max 14 days for everyone (admin or analyst)**. No indefinite mutes (they become forgotten mutes). After 14 days the mute auto-expires and the KPI re-enters live evaluation. Both actions are agency-only.

## Role rights

| Action | agency_admin | agency_analyst | client_viewer |
|---|---|---|---|
| Create custom KPI | yes | yes (assigned properties) | no |
| Edit name / metric / segment | yes | yes | no |
| Edit weight tier | yes | yes up to `elevated`; `critical` requires admin | no |
| Edit sensitivity tier | yes | yes | no |
| Toggle `visible_to_client` | yes | yes | no |
| Add annotation | yes | yes | no (can flag a note for analyst attention) |
| Mute a KPI | yes, max 14 days (with reason) | yes, max 14 days (with reason) | no |
| Star / flag a KPI | yes | yes | yes (stars only) |
| Reassign `owned_by` | yes | no | no |
| Delete a custom KPI | yes | yes (own KPIs only) | no |

## Anti-patterns we design against

1. **Drifting thresholds.** All thresholds expressed as deviations from rolling baselines, never absolute numbers. Surface the *current* effective threshold ("your 'big drops only' equates to ~X today") so analysts can see how the baseline moves.
2. **Orphan KPIs.** Weekly pg_cron job flags KPIs where the owner is inactive, `last_evaluated_at` is null past cold-start, or the KPI has been muted >30 days. Surfaces in agency settings as a "needs review" badge — not as alerts.
3. **Alert storms from over-customization.** Anomalies that fire within the same evaluation cycle on the same property are deduplicated into a single incident with `contributing_kpis[]`. One message: "We noticed 12 KPIs flagged on Property X — this pattern suggests a tracking issue."

## Failure-mode handling

- **Underlying metric returns null** → status `stale_kpi` (distinct from anomaly). Surfaces as `Watch` only, with copy "We couldn't evaluate [KPI] — the underlying metric returned no data."
- **Cold start (insufficient baseline)** → run detector in shadow mode for 56 days (8 DoW-matched samples for a 28-day window). KPI is visible to clients during shadow with the warm-voice indicator **"Ready in N days"** rendered next to the KPI name. No anomaly emissions during shadow; the KPI is excluded from the composite score until it goes live.
- **Forgotten mutes** → not a problem in v1 since mutes auto-expire at 14 days. A small "currently muted" count appears in agency settings for at-a-glance awareness; no nagging or digest needed.

## Out of scope for v1 customization

- Custom calculated metric formulas (client-defined arithmetic across events)
- Per-KPI baseline window selection by clients
- Client-controlled threshold editing of any kind
- Per-KPI notification routing
- Public annotation sharing or export
- Client-controlled KPI display order (agency controls)
- Pattern-based suppression ("suppress every Saturday") — use annotations instead; pattern suppression creates undetectable false negatives
