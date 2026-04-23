# Health checks

A **check** is a configured rule that runs on a property at an interval and produces a status (`healthy` / `watch` / `degraded` / `critical`). The system ships with a default check pack; agency admins can enable, disable, or tune per-property.

## Default check pack

| Check | What it watches | Failure mode it catches |
|---|---|---|
| Hit volume baseline | Daily/hourly hits vs day-of-week baseline | Tag deployment broken; container removed |
| Page name nullness | % of hits with null/`unknown`/`D=g` page names | Page-name eVar/prop logic broken |
| Conversion event volume | Counts of key conversion events vs baseline | Conversion tracking broken OR funnel broken |
| eVar/prop population rate | % of hits populating critical eVars | Data layer key renamed; rule broken |
| Marketing channel mix | Distribution of channel attribution | Channel processing rule misconfigured |
| Bot traffic share | % of hits classified as bot | Bot rules misconfigured; sudden invasion |
| Data freshness | Time since last successful data pull | API outage; Data Feed delivery slipped |
| Suite report-in | Each tagged report suite is reporting | One suite fell off the tagging |
| Mobile/web split | Ratio drift | SDK init broken on one platform |
| Processing latency | Adobe-side delay | Adobe-side incident |

Each check is parameterized: data source, baseline window, severity mapping, mute schedule.

## Severity mapping

- **Healthy (green):** within normal range for this property/day-type.
- **Watch (yellow):** outside normal range, inside historical extremes; agency-visible only by default.
- **Degraded (orange):** clear anomaly + at least one corroborating signal; or sustained Watch >2 baseline periods.
- **Critical (red):** failure-mode-confirming pattern (zero hits + zero events = implementation broken).

## Detection methodology

See `docs/features/anomaly-detection.md` for the math. In short: day-of-week-adjusted rolling baselines, MAD-based outlier scoring for volume metrics, Wilson confidence intervals for ratio metrics, PSI for distribution drift.

## Tuning

Agency admins can per-check, per-property:
- Adjust baseline window (default 28 days)
- Adjust sensitivity (which z/MAD score crosses each severity tier)
- Add mute windows (recurring or one-off)
- Annotate known causes (campaigns, deploys, holidays) so they don't trigger

Tuning changes apply forward only — they do not retroactively rewrite history.
