# Sufficiency — what data is enough to claim "Healthy"

> A property is `Healthy` only if all five required detectors return `OK`. If any detector returns `unknown` (no recent data), property status is `Unknown`, not `Healthy`. We do not claim health for data we cannot see.

## Required detectors (the floor)

These five run on every property, every cycle. They are not customizable — they define what "Healthy" means for the product.

### D1 — Data Arrival (Freshness)
Confirms a snapshot was received within the property's own historical arrival pattern.
- **Algorithm:** compare `last_ingested_at` to `now()` against a per-property P99 latency on a rolling 28-day window of arrival timestamps.
- **Result:** `ok` / `stale` / `unknown`.
- **If `unknown`:** the entire property status becomes `Unknown` regardless of other detectors.

### D2 — Volume Plausibility
Catches "implementation completely broken" — not nuanced drift.
- **Algorithm:** day-of-week-adjusted MAD on a 28-day trailing window, same-weekday only. Minimum 4 matched samples before result is valid.
- **Failure mode:** value is zero or below a MAD-3.5 floor.
- **Source:** `metrics/occurrences` from `POST /reports`.

### D3 — Event / Variable Presence
Catches "container fired but all variables stripped" — a common deploy regression.
- **Algorithm:** simple count > 0 of at least one custom event AND at least one eVar/prop fired in the period. Binary, no baseline needed.
- **Override:** properties known to legitimately have empty periods can be flagged per-property by `agency_admin`.

### D4 — Null / Unclassified Page Name Rate
Catches broken `s.pageName` assignment.
- **Algorithm:** Wilson lower bound on the proportion of hits with `Unspecified`/empty page name, compared to a per-property rolling 28-day median proportion. Alert only if Wilson lower bound drops below `(median - 2 * MAD of daily proportions)`.
- **Source:** `variables/page` top values from `POST /reports`.

### D5 — Tag Delivery Confirmation
Lightweight overlap check that data collection responded — distinct from D2 because D2 measures volume drops, D5 measures complete silence.
- **Algorithm:** ingested hit count is non-null in the most recent N periods (not just "API returned something").

### Composite logic

| If… | Then property status is |
|---|---|
| All 5 = `ok` | `Healthy` |
| D1 = `unknown` | `Unknown` (stop evaluating others) |
| D1 = `ok` AND D2 or D3 anomalous | minimum `Degraded` |
| D1 = `ok` AND only D4 or D5 anomalous (no D2/D3 corroboration) | `Watch` |

## Tiered data surface

We collect more than the floor. Tiers express our confidence about what we can claim from each.

| Tier | Required to claim "Healthy"? | Examples | Source |
|---|---|---|---|
| **A** | Yes | D1–D5 above | API 2.0 |
| **B** | No, but raises confidence | Primary conversion event non-zero, marketing-channel distribution stable, top eVar populations above floor | API 2.0 |
| **C** | No, agency-only diagnostic | Bot traffic share, multi-suite ingestion parity, hour-over-hour latency | API 2.0 (some require per-suite features) |

## What API 2.0 alone CANNOT credibly claim

We're honest with clients about scope. These require Data Feeds (v1.1):

- **Hit-level distribution audits** — whether individual hits contain correct field combinations (e.g., eVar set without the associated event firing on the same hit). API 2.0 aggregates mask this entirely.
- **Processing rule execution verification** — no API surface exposes VISTA / processing rule logs.
- **Exact duplicate hit detection** — API 2.0 deduplicates; you can't see it.
- **Data Feed delivery latency** — by definition, not available until v1.1.

Therefore: when we publish status, we say "**your data flow is healthy**", not "your implementation is healthy." That distinction matters in client communications and is reflected in the warm-voice copy.
