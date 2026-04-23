# Property Detail (`/properties/[propertyId]`)

> The screen a client opens when they want reassurance. The screen an analyst opens when they need to diagnose. **Same component tree, role-aware projections.** Design tokens live in [docs/design/design-framework.md](../design/design-framework.md).

---

## 1. Screen architecture

### Route + rendering model

`/properties/[propertyId]` — Server Component shell with three `"use client"` islands: `MetricBandChart` (Recharts/visx), `StateTimeline` (hover interaction), `AcknowledgeControl`.

### Property switcher in the header

A **`PropertySwitcher` pill** (NOT in the top nav) — `Dropdown` trigger with current property name + Lucide `ChevronsUpDown`. Click opens a `Popover` listing scoped properties: each row = live `StatusGlyph` + name + suite ID in `mono-sm`. Selecting navigates to that property's URL. Both roles see it; clients see only their accessible properties.

### Page header zone — first viewport

```
[PropertySwitcher pill]                        [Suite ID in mono-sm — agency only]

[Property display name — display-md, weight 300]
[Status chip — StatusGlyph + status word + "since HH:MM UTC" in mono-sm]

[Verdict line — body-lg]
```

Sits on `bg-field` (no card chrome), 48px top padding. The property name is the largest text on screen.

**Verdict line — client viewer (uses content tone tokens):**
- Healthy: *"Everything looks good. We're watching your data around the clock — last check ran 3 minutes ago."*
- Investigating: *"We noticed something unusual in your Conversion events around 14:32 UTC and our team is looking into it. No action needed from you."*
- Resolved: *"We resolved a brief reporting gap. Your data is accurate and up to date."*

**Verdict line — agency analyst:** terse `body-sm` `fg-secondary` mono summary instead — `"47 checks · last run 09:41 UTC · composite −4 pts from baseline."`

### StateTimeline strip

Directly below the header, **full-width, before any cards** — the visual transition from "what now" to "what has it been doing." Last 30 days, one block per day, colored by that day's worst status. ~28–32px wide blocks, 2px gaps.

- Hover → `Tooltip` with date, status, and (agency only) check count that fired.
- Click (agency only) → scrolls Recent activity rail to that date.
- `caption` below right: "Last 30 days" in `fg-secondary`.

---

## 2. Active state treatments

### (a) All healthy

Header chip is sage; timeline is unbroken sage; **nothing else demands attention**. Restraint as trust signal.

- KPI grid below is calm — all open-circle `StatusGlyph` in `status-healthy`.
- Proof-of-life cue: "last check ran N minutes ago" in the verdict.
- **Do NOT render** an empty "Active incidents" card or a "No active incidents ✓" affordance. Absence is the message.
- For agency view only: a collapsed-by-default `<details>` expander labeled "Required checks" in `caption` — quietest possible D1–D5 confirmation. Clients never see this.

### (b) Active investigating

The incident dominates. `IncidentBanner` is inserted **between the header zone and the StateTimeline**, full content-width.

- `bg-accent-tint`, `radius-lg`, 24px padding. **3px solid `status-investigating` left edge.**
- Investigating glyph (filled w/ notch, steel-blue) at left → warm-voice copy → `mono-sm` "Since HH:MM UTC · Updated MM:SS ago" right-aligned.
- Agency-only: right-aligned text link "View details" scrolls to the affected KPI tile.

The `MetricBandChart` for the affected metric **expands to full 12-column width** directly below the banner, above the StateTimeline.
- Agency view: anomaly window marked with `bg-accent-tint @ 40%` vertical region + tooltip "Anomaly detected 09:42 UTC." Baseline band remains.
- Client view: chart shows band + line only. No anomaly annotation, no axis numbers. `body-sm` caption below: *"We noticed something unusual here — our team is investigating."*

The agency-only "What could cause this" panel renders as a `bg-card-contrast` card below this expanded chart (see §7).

### (c) Recently resolved (last 24–48 h)

`IncidentBanner` is gone. In its place: a `ResolvedCard` at the same position above the StateTimeline.

- `bg-card-soft`, `radius-lg`, 24px padding. Sage 8px dot at left.
- Copy: *"We resolved a brief {description} on {property name}. Your reporting is accurate and any affected data has been backfilled. No action required."*
- Below in `mono-sm` `fg-secondary`: "Resolved at HH:MM UTC · {duration} after detection."
- Agency view: right-aligned "See incident log" opens the anomaly drawer. Client view: no link — just resolved copy.

After 48h, `ResolvedCard` moves to the Recent activity rail and disappears from above-the-fold.

---

## 3. Required-detector cards (D1–D5)

D1–D5 do NOT get five separate cards (chart wall in waiting). Instead: a single **"Health checks" card** with a consolidated sub-row pattern.

- `bg-card-paper`, `radius-lg`, 32px padding.
- Title "Health checks" (`heading-md`), `Separator` below.
- Five sub-rows (40px tall each), one per detector:
  - Left: small inline `StatusGlyph` (14px)
  - Center: detector name (role-aware label below)
  - Right: `mono-sm` `fg-secondary` last-checked timestamp (agency only)

### Role-aware detector labels

| | **Client label** | **Agency label** |
|---|---|---|
| D1 Data Arrival | "Your data is arriving on schedule" | "Data arrival (D1)" |
| D2 Volume Plausibility | "Your traffic levels look normal" | "Volume plausibility (D2)" |
| D3 Event/Variable Presence | "Your key events are tracking" | "Event/variable presence (D3)" |
| D4 Page-name nullness | "Your page names are populated" | "Page-name coverage (D4)" |
| D5 Tag delivery | "Your tracking tag is active" | "Tag delivery confirmation (D5)" |

No sparklines in the sub-rows — sparklines live in the KPI grid below.

**When a detector goes anomalous:** `StatusGlyph` updates to severity color + glyph. Row background lifts to `bg-accent-tint @ 20%`. Text changes:
- Agency: *"Data arrival anomaly detected 09:42 UTC"*
- Client: *"We noticed something with your data arrival — we're on it."*

### Card layout context

- Spans 8 of 12 columns on desktop; Recent activity rail occupies the right 4.
- Agency view in all-healthy: card defaults to **collapsed** to a one-line summary "All 5 checks passing · last run 09:41 UTC." Expand to see sub-rows.
- Client view: **always expanded** — these five plain-language rows are the page's primary reassurance content for them. Most credibility-bearing surface on the page.

---

## 4. KPI grid (Tier B + custom KPIs + Tier C)

### Layout
- 3-column grid on desktop (4 cols each), 2-col tablet, 1-col mobile.
- Default sort: Custom KPIs marked `visible_to_client` → Tier B → Tier C (agency only). Within each: weight tier (critical → elevated → standard) → alphabetical.
- Filter strip above: pill buttons "All" / "Watch or above" / "Custom" / "Agency only" (last hidden for clients). Amber underline on active. `Search` input on the right of the strip. Strip sits on field, not a card.

### Weight tier on tiles — left border, NOT a chip

Avoids cluttering the tile face with admin metadata clients don't need.
- Standard → no border
- Elevated → 3px left edge, `status-watch` color
- Critical → 3px left edge, `status-critical` color

For agency: hover the left edge → `Tooltip` "Elevated weight — sustained drops can move this property to Watch or Degraded."

### Client "Your priorities" section

Starred KPIs surface in a dedicated section **above** the main KPI grid.
- `heading-md` "Your priorities"
- `caption` below: "These are the metrics you've marked as most important."
- Section only renders when ≥1 KPI is starred.
- Same 3-col grid, identical tile treatment — **no special star badge on the tile face**.
- Star icon lives in **tile hover state** only — clicking toggles starred status. **This is the only write action a client viewer performs.**

Below: `Separator` + main KPI grid labeled "All tracked metrics" (`heading-md`). Starred tiles do NOT repeat in the main grid.

### Cold-start tile treatment

- `bg-card-soft @ 85% opacity` (visual dimming, not hidden).
- KPI name in `heading-md`.
- `ColdStartGlyph` where `StatusGlyph` would be.
- Client: *"Coming soon — ready by {date}"* in `body-sm` `fg-secondary`.
- Agency: *"Shadow mode · Ready in N days"* in `mono-sm` + thin `hairline` track with sage fill = days elapsed / 56.
- No status chip, no border treatment, no star affordance (starring an un-baselined KPI is meaningless).

### Muted tile treatment

- **Agency:** tile at 0.7 opacity. `BellOff` 12px `fg-secondary` icon top-right with tooltip "Muted until {relative date} — {reason}". `StatusGlyph` shows last known status, not a muted state.
- **Client:** tile fully normal — last known status, no opacity change, no mute indicator. Reads healthy as healthy. Matches Settings spec.

---

## 5. Charts pattern

`MetricBandChart` does NOT live inside KPI tiles on this page. Tiles carry `Sparkline` only. Full chart appears in two places:

1. **Inline + full-width (12 cols)** when an active incident exists — directly below `IncidentBanner` or `ResolvedCard`. The chart IS the incident evidence; not behind a click.
2. **Expand-on-click `Sheet`** (right-anchored, 640px) for individual KPI tiles. Contains: full `MetricBandChart` for that KPI's metric + `StateTimeline` for that KPI alone (7-day, more granular) + annotation layer. Same drawer for both roles, role-aware feature differences below.

### Annotations

- Render as **vertical bands** on the `MetricBandChart` (light fill, `fg-secondary @ 8% opacity`) — NOT a colored vertical line, must not compete with baseline band.
- Small `caption` `fg-secondary` label at top of band: "Deploy" / "Campaign" / "Holiday."
- Hover band → `Tooltip` with full annotation text, date, and (agency only) author name.
- Both roles see annotation bands and tooltips.

### Role-aware chart features

| | Agency | Client |
|---|---|---|
| Y-axis tick labels | Yes (actual values) | None (no raw numbers) |
| Threshold line | Yes (dashed, `status-watch` w/ "Alert threshold" caption) | None |
| Anomaly window shading | Yes | None |
| Anomaly marker dot on line | Yes | None |
| Verdict caption below chart | None | Yes (`body-sm`): *"This metric has been within normal range for the past N days."* |

Charts carry `role="img"`; agency-side `aria-label` summarizes the trend; client-side `aria-describedby` points at the verdict caption.

---

## 6. Recent activity rail

- Desktop: right rail, 4 of 12 cols, top-aligned with Health checks card to bottom of page. Mobile/tablet: below the KPI grid.
- **`bg-card-contrast`** (near-black both modes) — the Crextio-style anchor card. The single dark element above-the-fold in the all-healthy state.
- Title "Recent activity" (`heading-md`, `fg-on-contrast`).
- Scrollable list of `AnomalyRow` entries for this property, newest first. **Contrast-card variant:** amber-tinted timestamp in `mono-sm`, glyph, one-sentence description. Reads like a watchman's log.

### What goes in the rail per role

**Agency analysts see:**
- All status transitions (healthy → watch → investigating → degraded → resolved)
- Mute events ("Volume metric muted for 7 days — {reason}")
- Acknowledgement events ("Investigating acknowledged by {analyst name} at HH:MM UTC")
- Annotation additions ("Deploy annotation added by {analyst name}")
- KPI status flips ("Custom KPI 'Checkout completions' moved to Watch")
- Shadow-to-live transitions

**Client viewers see:**
- Investigating events (only after acknowledgement — never raw `detected`)
- Resolved events
- No mute events, no analyst names, no annotation changes

**Empty rail:** *"No recent activity for this property."* (`body-sm` `fg-secondary`). No empty-state illustration.

---

## 7. Agency-only "What could cause this" panel

Exists ONLY when an active anomaly is in `investigating` state. Not visible to clients. Sits after the expanded `MetricBandChart` and before the KPI grid.

- `bg-card-contrast`, `radius-lg`, 32px padding. Same tonality as Recent activity rail.
- Title "What could cause this" (`heading-md`, `fg-on-contrast`).

### Two sub-sections (separated by `Separator`)

**Corroborating signals** — list of detectors/KPIs off-baseline at the same time. Each is a compact `AnomalyRow` variant (no timestamp column — just glyph + name + deviation summary). When none: *"No other checks are off-baseline at this time — the anomaly appears isolated."*

**Common root causes** — static curated list (3–5 items) per check type, plain language. Examples:
- D1 Data Arrival → "Processing pipeline delay" / "Tag management system outage" / "Midnight-boundary processing gap"
- D2 Volume Plausibility → "Marketing campaign pause or launch" / "Tag firing condition changed" / "Bot filter adjustment"

`body-sm` bullets, not interactive. **Human-authored lookup by check type — no AI-generated text.**

### Bottom of panel

`AcknowledgeControl` (new component): textarea (min 20 chars to enable) + "Acknowledge & take ownership" primary button. Acknowledging sets state `investigating`, records the note, assigns the analyst. Below: secondary text link "Mute related alerts" → opens the mute popover. Server-action-backed.

---

## 8. Anti-patterns avoided on this screen

1. **The chart wall.** Every KPI gets a full chart → 12–20 charts stacked vertically, slow + exhausting + reader can't tell if they should be worried. Fix: `Sparkline` on tiles; full chart only in the expand drawer and on active incidents. Reserve the full chart for the moment when it earns its space.
2. **Symmetric treatment for all states.** Same card layout regardless of healthy vs degraded. A healthy property page and a degraded one should feel materially different at a glance. The `IncidentBanner` forcing its way into the layout (not a sidebar element, not a toast) is the mechanism.
3. **Exposing the detector/KPI taxonomy to clients.** "D1," "D2," "Tier B," "weight tier," "shadow mode" are internal ops constructs. Client variant replaces every such label with a plain-English description of what it means for their data.

---

## Component inventory updates

### Reused without changes
`TopNav`, `StatusGlyph`, `StatusTile` (in property switcher popover), `MetricBandChart`, `Sparkline`, `AnomalyRow`, `IncidentBanner`, `ResolvedCard`, `KPINumber`, `StateTimeline`, `ColdStartGlyph`, `OptionTile`, shadcn (`Dropdown`, `Popover`, `Sheet`, `Tooltip`, `Separator`, `Skeleton`, `Button`).

### Reused with new variants
- **`MetricBandChart`** — new "incident-expanded" variant (full 12-col, anomaly window shading, client caption). New "drawer" variant (640px sheet, same features).
- **`AnomalyRow`** — new "contrast-card" variant for Recent activity rail (amber timestamp on dark). New "corroborating-signal" variant (compact, no timestamp column).
- **`KPIRow`** → new **`KPITile` variant** (card layout vs list-row layout) for the KPI grid. All state variants (cold-start, muted, starred) carry over. Existing `KPIRow` list layout remains for Settings.
- **`StateTimeline`** — new "single-KPI" 7-day variant for the expand drawer.

### New components

| Component | Purpose |
|---|---|
| **`PropertySwitcher`** | Dropdown pill with `ChevronsUpDown`; opens `Popover` listing scoped properties with live `StatusGlyph`. Navigates on select. |
| **`DetectorRow`** | Sub-row inside Health checks card: small `StatusGlyph` + role-aware label + optional timestamp. Anomalous variant has `bg-accent-tint @ 20%` row wash. |
| **`KPITile`** | Card-layout variant of `KPIRow`. Props: `kpi`, `role`, `starred`, `onStar`, `onClick` (opens expand drawer). All state variants carry over. |
| **`AcknowledgeControl`** | Textarea + "Acknowledge & take ownership" button + "Mute related alerts" link. Min-20-char enforcement. Agency-only. Inside the "What could cause this" contrast card. |
| **`AnnotationBand`** | Visual primitive on `MetricBandChart` — vertical band layer with label cap and tooltip. Props: `startTs`, `endTs`, `label`, `description`. |
