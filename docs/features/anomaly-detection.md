# Anomaly detection methodology

This document describes how the system decides whether a metric is anomalous. The goal is **high signal, low false-positive rate** — clients who see noisy alerts stop trusting the dashboard within a week.

## Core principle

We do not use static thresholds on metrics that grow with the business. Every check uses a **rolling, day-of-week-aware baseline**.

## Per-metric-type approach

### Volume metrics (hits, sessions, conversions)
- **Baseline:** 28-day rolling window, matched by weekday and hour.
- **Detector:** Median Absolute Deviation (MAD), more robust than z-score for spiky data.
- **Default thresholds:** Watch at |MAD score| ≥ 3.5; Degraded at ≥ 5; Critical at ≥ 8 *and* corroborating signal present.
- **Optional:** STL decomposition or Prophet for properties with strong seasonality.

### Ratio / proportion metrics (bounce rate, conversion rate, % null page names)
- **Baseline:** Wilson confidence interval over the rolling window.
- **Detector:** today's value outside the baseline interval at chosen confidence level.
- **Watch:** denominator collapses — many "rate spikes" are denominator drops, not numerator changes. Always check denominator volume alongside ratio.

### Categorical drift (page name distribution, browser mix, eVar value shape)
- **Detector:** Population Stability Index (PSI) or Jensen-Shannon divergence on the top-N value distribution.
- **Plus:** explicit tracking of new and disappeared values — the smoking gun for "data layer key renamed."

### Latency / freshness
- **Detector:** compare actual arrival time to the property's own 99th-percentile arrival lag.
- **Don't** alert on a fixed "data is X minutes late" — Adobe processing lag is naturally variable.

## Severity escalation

A single check firing is rarely enough for a high-severity alert. The system looks for **corroboration**:
- Hit volume drop alone → Watch.
- Hit volume drop + eVar population drop + page-name nullness spike → Critical (the implementation is genuinely broken).

This corroboration logic prevents alert storms where one root cause triggers many dependent checks at high severity.

## False-positive guards

Legitimate causes of anomalies that should NOT page anyone:
- Weekend / holiday traffic dips (seasonality-adjusted baseline handles most)
- Marketing campaign spikes (admin-annotated; suppressed automatically)
- Time-zone boundary effects in hourly data (use the property's configured timezone)
- Adobe-side processing delays (latency check handles this; other checks gate on freshness OK)
- Adobe bot-filtering recalculation events (require sustained anomaly, not single-bucket)

## Acknowledgement

Any anomaly can be acknowledged with a required note. Ack:
- Suppresses re-alerting for the same root cause
- Appears in the timeline as `[Analyst] acknowledged · investigating`
- For client-viewers, displays as `Investigating` (not the raw note) until resolved

## Health score (composite)

A property's health score is a weighted sum of its severity-classified checks, NOT an average of raw metrics. Weights default equal but are tunable per-check. The score is always shown alongside its component checks — never as a black box.
