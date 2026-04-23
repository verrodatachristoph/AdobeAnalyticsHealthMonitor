# Overview view

The Overview is the home screen — the surface that must pass the **five-second test**: a user opening it should know within five seconds whether everything is healthy.

## Information hierarchy (top → bottom)

1. **Overall status badge** — single word + color + last-updated timestamp.
   Example: `Healthy · updated 4 min ago`
2. **One-line natural-language summary.**
   Example: `All 4 properties reporting on schedule. No anomalies in the last 24h.`
3. **Per-property tile grid** — one tile per monitored property.
   Each tile: name, status color, top-line metric trend (sparkline), last anomaly timestamp.
4. **Active issues list** — only rendered if any exist. Severity-sorted. Each item is a sentence (`Hit volume on prod_us_main is 38% below baseline since 09:42 UTC`), not a chart.
5. **Recent timeline** — compact event log of state changes (detected → acknowledged → resolved).
6. **Trend strip** (lower priority) — sparklines for top metrics across all properties.

## What does NOT belong here

Detailed charts, eVar tables, configuration UI, raw data exports, login walls, marketing content. The Overview is read-only by design.

## Role variation

| Element | Client viewer | Agency analyst |
|---|---|---|
| Status badge | Yes | Yes |
| Summary line | Plain language | Plain language + drill link |
| Tile grid | Status + sparkline | Status + sparkline + raw last-checked timestamp |
| Active issues | Resolved + investigating only (no raw alerts) | All severities, with ack control inline |
| Timeline | Resolved/published events only | Full event stream including internal acks |
| Trend strip | Yes | Yes |

## States

- **All healthy:** lean into it. Don't apologize for "no data to show." Show a confident `All systems healthy` with the timestamp.
- **One issue:** elevate that issue to top of viewport; everything else dims slightly.
- **Multiple issues:** group by severity, then by property.
- **Dashboard itself can't reach Adobe or Supabase:** show a top banner. Don't render stale data as if it's current.

## Refresh behavior

Initial render: server-rendered with fresh data via Supabase server client.
Post-hydration: subscribe to Realtime channels on `events` and `anomalies`, merge deltas client-side. No polling.
