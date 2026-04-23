# User personas

The dashboard serves two primary roles, with a third (super-admin) for internal operations.

## 1. Agency analyst (`agency_analyst`)

**Who:** verrodata analyst responsible for one or more client implementations.

**Goals:**
- Know within seconds whether any client implementation has degraded.
- Diagnose anomalies quickly with enough context to act.
- Acknowledge / mute known issues so the dashboard reflects current reality.
- Communicate findings to the client without leaving the app.

**Comfort with detail:** High. They want to see baseline math, raw values, timestamps, and underlying check definitions.

**Primary surfaces:** Overview, Anomalies log, per-property detail, ack workflow.

## 2. Agency admin (`agency_admin`)

**Who:** verrodata senior staff, account director, or technical lead.

**Goals:** All of the above, plus:
- Add new clients and properties.
- Provision client viewer accounts (no signup; admin-issued invites).
- Configure which checks run on which properties.
- Tune thresholds for noisy clients.

**Primary surfaces:** Adds Settings (clients, users, checks).

## 3. Client viewer (`client_viewer`)

**Who:** Marketing manager, analytics lead, or executive at a client organization.

**Goals:**
- Confirm at a glance that "everything is fine."
- Understand what was wrong if something was — in plain language, without needing to ask the agency.
- Have a single shareable link to send to their team or leadership.

**Comfort with detail:** Low to medium. They know Adobe is "the analytics tool" but may not know what an eVar is.

**Primary surfaces:** Overview, simplified per-property view, incident timeline. **Cannot see:** Settings, other clients, raw API errors, threshold math, or any debugging context.

## Design implications

- The same overview component renders differently per role: client gets a simpler tile + plain-language status; agency gets the same data plus debug overlay (timestamps, baseline numbers, drill links).
- All copy must work for the lowest-context audience on that screen. If a screen serves both roles, it's written for the client and progressively reveals technical detail to the agency role.
- A single user always has exactly one role. No multi-role accounts in v1.
