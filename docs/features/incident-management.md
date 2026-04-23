# Incident management

When a check transitions from `healthy` to a degraded state, an **anomaly** is created. As an analyst works it, it moves through a defined lifecycle visible to both agency and client (with role-appropriate detail).

## Lifecycle

```
detected → investigating → resolved
              ↘ muted (agency-decided non-issue)
```

| State | Trigger | Visible to client as | Visible to agency as |
|---|---|---|---|
| `detected` | Check fires | (hidden until escalated or acked) | New anomaly with raw values |
| `investigating` | Analyst acknowledges with note | "We're investigating an issue with X" | Note + ack timestamp + analyst name |
| `resolved` | Metric returns to baseline + analyst confirms | "We resolved an issue with X (duration: 2h 14m)" | Plus root-cause note if filled |
| `muted` | Analyst marks "known non-issue" with reason | (not shown) | Visible in muted log |

## Why hide raw `detected` from clients

A `Watch`-level signal that an analyst has not yet looked at would create anxiety, not trust. The client only sees state transitions that the agency has owned (`investigating`) or closed (`resolved`). This is a deliberate trust-building choice, not a transparency failure — the agency is doing its job before the client has to ask.

## Acknowledgement workflow

When an analyst acknowledges:
1. Required: short note explaining the working hypothesis.
2. Required: estimated impact (none / partial / full data loss).
3. Optional: link to relevant deploy / Slack thread / ticket.
4. The note is stored verbatim for agency view.
5. A client-safe rendering is generated (or: the note IS already client-safe — let the analyst write it well, with a "this will be visible to the client" indicator in the UI).

## Resolution workflow

When the metric returns to baseline:
1. System auto-suggests resolution; analyst confirms with optional root-cause note.
2. Duration is computed from `detected → resolved` and shown on the incident card.
3. Auto-resolution happens after N consecutive healthy intervals (configurable, default 3).
4. Resolved incidents stay in the timeline indefinitely (cheap, audit-relevant).

## Notifications (out of scope for v1, planned for v1.1)

In v1, the dashboard is the only surface — Realtime push keeps it fresh. v1.1 adds opt-in email/Slack for `Degraded` and `Critical` only. `Watch` never pages.
