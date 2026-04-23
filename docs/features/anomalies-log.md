# Anomalies log (`/anomalies`)

> The agency's primary triage surface. The client's incident history record.
> Same component tree, role-aware projections — but with the most divergent role behavior of any screen in the product (analysts triage, clients read).
> Design tokens live in [docs/design/design-framework.md](../design/design-framework.md).

---

## 1. Screen architecture

### Three user modes (agency)

Analysts open `/anomalies` in one of three modes:
1. **Paged** — find and acknowledge a specific incident fast.
2. **Triage sweep** — morning scan across the portfolio.
3. **QBR review** — historical incidents for a client report.

Screen serves all three without mode-switching.

### First viewport — agency

- `heading-md` sentence-cased title: **"Anomalies"** on `bg-field`, no card chrome, 48px top padding.
- Right of title: a `KPINumber` trio (small scale, weight 300) — **"Active now / Acknowledged today / Resolved this period."** Three numbers that orient triage in one glance. "Active now" uses `status-critical`/`status-degraded` color when non-zero; the other two `fg-secondary`.
- Below: filter rail (compact enough that the first incident rows are visible on load).
- **No summary paragraph, no portfolio banner.** This screen is diagnostic-first.

### First viewport — client

- Same `heading-md` title, but reframed as **"Incident history"** — warmer, less technical.
- Below: single `body-lg` warm sentence: *"Here is what we have detected and resolved across your properties."*
- No filter rail. Only a compact two-pill time range (7 days / 30 days), right-aligned.
- Stream begins immediately. Calm, not sparse.

### Primary content: stream, NOT table

Per Property Detail's principle ("anomalies are events, events are a stream"), this screen extends it. Chronological stream of incident cards, newest at top, **grouped by day** with a `caption` date separator ("Today" / "Yesterday" / "Wed 16 Apr").

**Why not a table:** tables imply every column is co-equal. Anomaly events aren't — severity, state, description are primary; everything else is on-demand. A stream also scales gracefully when rows have varying density (grouped vs single-check).

Each "row" is an `AnomalyRow` rendered as a card strip. Desktop: spans 8 of 12 columns; filter rail occupies the left 3 + gap. Mobile: filter rail becomes a bottom sheet trigger.

### Group-by-incident behavior

When multiple checks fire on the same property in the same evaluation cycle, they're grouped (per the customization spec — alert storm prevention) with a `contributing_checks[]` array.

In the stream, this appears as a **single card visually similar to a single-check anomaly**, with three differences:
- `StatusGlyph` reflects the highest severity across contributing checks.
- Description shows the primary (highest-severity) check.
- Subtle right-aligned `caption` pill: **"3 checks affected"** in `fg-secondary`, `bg-card-soft` fill — informational metadata, NOT an alert count.
- Card has a `2px hairline bottom border` at slightly larger radius — 4px more visual weight, communicates "cluster" without being louder.

**On click → drawer opens** (§4) and shows a "Contributing checks" subsection. **Stream itself does NOT expand inline** — no accordion rows. Inline accordions in a scrolling stream cause disorienting layout shifts.

### Realtime arrival pattern — the "new" pill

New rows arrive via Supabase Realtime. Pattern: **"new items" sticky pill at the top of the stream**, NOT inline insertion.

When ≥1 new row has arrived since the analyst last scrolled to top:
- Pill appears just above the first visible card: **"2 new anomalies — click to load"** in `caption` text, `bg-card-contrast` fill, `fg-on-contrast` text, `radius-pill`.
- Static (no animation, no pulse) — motion is reserved for Critical-state glyphs.
- Click → pill disappears + new rows slide in from above the first existing row (150ms ease-out, matches toast slide-in).
- Pill auto-disappears if the analyst scrolls to top manually.

**Why not auto-insert:** if the analyst is reading and acknowledging row 3, a new row at row 1 shifts everything down and disrupts position. The pill gives them control.

---

## 2. Filter rail

### Placement

**Left sidebar on desktop** (3 of 12 cols, 24px gap to content stream). **The only screen in the app with a sidebar** — earned because this is the primary triage surface and filterable facets are structural here. Tablet → collapsible left drawer (filter icon pill trigger). Mobile → bottom sheet.

`bg-card-soft`, `radius-lg`, padding 24px, **sticky** (stays visible while scrolling). Sections separated by `Separator`, labeled in `caption` uppercase.

### Facets (agency view)

| Facet | Pattern | Default |
|---|---|---|
| **Severity** | Multi-select chip row: Watch / Investigating / Degraded / Critical. Status-color fill at 15% opacity (25% in dark) on select. | All selected |
| **State** | Multi-select chips: Detected / Investigating / Resolved / Monitoring. (Detected is suppressed for clients.) | Detected + Investigating (triage default — what needs attention now, not historical archive) |
| **Property** | Multi-select with search via `Command` inside `Popover`. Trigger shows count ("3 properties" / "All properties"). | All |
| **Client** | Same `Command` pattern. **`agency_admin` only** — `agency_analyst` already scoped to assigned clients. | All |
| **Time range** | Five pill chips: Today / 7d / 30d / 90d / Custom. Custom opens inline date range picker. | 7 days |
| **Check type** | Multi-select chips: D1 / D2 / D3 / D4 / D5 / Custom KPI / `stale_kpi`. Labeled, not icon-only. | All |
| **Assigned to** | Single-select `Select`: "Anyone" / "Me" / individual analyst names. | Anyone |
| **Acknowledged by me** | Single `Switch`: "Show only mine." | Off |

### URL persistence

All active filters serialize to URL query params: `?severity=degraded,critical&state=investigating&property=p1,p2&range=7d`. **Filter views are shareable** — analysts send pre-filtered links to colleagues. On load, URL params read first; defaults apply when absent. `router.replace` on every change so browser back restores previous filter state.

### Active filter summary (above stream)

`body-sm` `fg-secondary` sentence: **"Showing 12 anomalies — Degraded + Critical, last 7 days."** Resets via `× Clear filters` text link at end of sentence (clears to defaults, not all-selected).

---

## 3. Row anatomy (agency view)

Single `AnomalyRow` in stream, at rest. Left to right:

- **`StatusGlyph`** (20px) — multi-encoded glyph + color. Critical pulses per motion spec.
- **Property name** — `body-md` `fg-primary`, sentence-case, truncate at 24 chars (tooltip for full).
- **Client name** below property — `body-sm` `fg-secondary`. **Agency only** (removed for client view).
- **Check label** — role-aware: agency = technical ("Volume plausibility (D2)") in `mono-sm` `fg-secondary`; client = warm ("Your traffic levels").
- **Description** — one sentence, agency-voiced past-tense: *"Hit volume on `prod_us_main` fell 38% below baseline."* `body-md`.
- **Timestamp** — right-aligned, `mono-sm` `fg-secondary`. Relative ("14 min ago") with absolute tooltip ("09:42 UTC, 16 Apr 2026").
- **State chip** — pill, right of timestamp, status-color at 15% opacity fill: "Detected" / "Investigating" / "Resolved" / "Monitoring."

### Hover behavior

Background lifts from `bg-card-soft` to `bg-card-paper` (tone shift, no shadow). **Four icon actions** appear at the far right, replacing the state chip:
- Lucide `CheckCircle` — Acknowledge (opens drawer to `AcknowledgeControl`)
- Lucide `BellOff` — Mute
- Lucide `Tag` — Add annotation
- Lucide `ArrowUpRight` — View in property (navigates to `/properties/[id]`)

**Multi-select checkbox** appears on hover only when in multi-select mode (§6).

### Grouped-incident row

Identical anatomy except: description refers to primary check; the `"3 checks affected"` `caption` pill inserts between description and timestamp. Row gets 4px more bottom padding for cluster breathing room.

---

## 4. Row → detail drawer

Click anywhere on row (except hover icons) → right-anchored `Sheet`, **640px wide, full-height, `radius-xl` left corners, 200ms ease-out**. Same dimensions and motion as Settings KPI editor sheet. URL gains `?anomaly={id}` (shareable, browser-back closes).

**This is the SAME drawer component used on Property Detail** (the KPI expand drawer), reusing the `MetricBandChart` drawer variant. Configuration difference, not parallel build.

### Drawer contents (top to bottom)

- **Sticky drawer header** — property name (`heading-md`) + state chip + `X` close. `PropertySwitcher`-style breadcrumb: "Client name / Property name" in `body-sm` `fg-secondary`.
- **`MetricBandChart`** — drawer variant (640px): affected metric, baseline band, anomaly window shading, annotation bands, full axis labels (agency) or verdict caption (client).
- **Corroborating signals** — `AnomalyRow` "corroborating-signal" variant (already built for Property Detail). Off-baseline checks at the same time. Empty state: *"No other checks are off-baseline at this time."* **Agency only.**
- **Common root causes** — static curated bullet list per check type (same content as Property Detail's "What could cause this" panel). **Agency only. Human-authored, NO AI text.**
- **Contributing checks list** (grouped incidents only) — `DetectorRow` instances. Click a row → swaps the `MetricBandChart` above to that check's metric (drawer stays open). `caption` breadcrumb above chart tracks which check is showing.
- **`AcknowledgeControl`** — textarea (min 20 chars) + "Acknowledge and take ownership" primary button + "Mute" text link. Inside `bg-card-contrast` block, same as Property Detail's panel. **Agency only.**
- **Mute control** — same popover pattern as KPI muting in Settings: duration `Select` + required reason `Textarea` (min 20 chars).
- **Annotate** — compact inline `Textarea` + `Select` (Deploy / Campaign / Holiday / Other) + "Add annotation" ghost button. On save, renders as `AnnotationBand` on the chart above.
- **Activity history** — chronological text list (NOT a `StateTimeline` — that's for 30-day property health). `mono-sm` `fg-secondary`: *"Detected 09:42 UTC · Acknowledged by J. Park 09:58 UTC · Resolved 11:14 UTC."* One transition per line, newest at bottom (chronological reading order).

### Vs the Property Detail anomaly drawer

Property Detail's expand-on-click sheet is scoped to a single KPI. This drawer is scoped to an **incident that may span multiple KPIs** — structural difference is the "Contributing checks" section + chart-swap behavior. Everything else (chart variant, AcknowledgeControl, corroborating signals, annotation, activity log) is the same component.

---

## 5. Client view of this screen

### What they see

- Page title: **"Incident history"** (warmer than "Anomalies"). Same `heading-md` weight.
- Single warm `body-lg` below: *"Here is what we have detected and resolved across your properties."*
- **Time range picker only** (7d / 30d), right-aligned. No other filters.
- Chronological stream of `AnomalyRow` items — **only `investigating` and `resolved` states**. `detected` and `monitoring` (muted) suppressed (mute is operational, clients don't need to know).
- No client name column (their properties only).
- No technical check labels — warm labels only.
- No hover actions on rows. **Rows are informational.** Click opens the drawer in **read-only client mode**.
- Group-by-incident still applies. Pill translates: *"We found issues with 3 data points during this period."*

### Client drawer (read-only)

Same `Sheet`, but: no `AcknowledgeControl`, no corroborating signals, no root causes panel, no annotate action. Drawer shows: chart (client variant), warm one-sentence summary, activity history filtered to resolved events with agency-voiced copy (*"We resolved this at 11:14 UTC"*).

### Empty state — no incidents in period

Centered `bg-card-soft` block, `radius-lg`, 48px padding, **no illustration**:

> **No incidents in the last 7 days.**
> *We have been watching your Adobe Analytics data around the clock and everything has been on track. We will log any future incidents here so you have a full record.*

No checkmark symbol. No "great job" energy. Steady, professional, warm. Agency is watching — that's the message.

---

## 6. Bulk actions (agency)

### Selection trigger

Hold Shift + click a row, OR a checkbox appears on hover-of-any-row once a first row is selected (the first checkbox reveals on hover; checking it makes all checkboxes visible until deselected). **No persistent checkbox column** in default state — preserves stream aesthetic, avoids bureaucratic-table register.

### Action bar

Once ≥1 row selected: a sticky bar rises from bottom of viewport. `bg-card-contrast`, full content width, `radius-lg` top corners.
- Left: "{N} anomalies selected" in `body-md` `fg-on-contrast`.
- Right: three ghost buttons in `fg-on-contrast` — **"Acknowledge all" / "Mute all" / "Resolve all"**.

Each requires shared metadata (single textarea/picker opens in a `Dialog` above the bar):
- Acknowledge all → shared reason
- Mute all → shared duration + reason
- Resolve all → resolution note

Bar disappears when selection clears (Escape or deselect-all).

**Mobile:** long-press triggers selection mode. Tap toggles selection on each card.

---

## 7. Heatmap / trend strip

**Recommendation: yes — minimal, agency-only, positioned carefully.**

### What it is

12-col-wide strip directly below filter summary line, above first incident row. **Count-by-hour heatmap** for the currently filtered period: 24 cols (hours of day) × N rows (days in period), each cell colored by highest severity in that hour. For 7-day period: 7 × 24 = 168 cells, ~12×12px with 2px gaps. Roughly 60px vertical.

### Why earned

Answers **"when do anomalies cluster?"** before the analyst reads individual rows. A campaign launch causing anomalies every morning at 08:00 for three days appears immediately as a diagonal column of terracotta — no scrolling. The stream cannot answer this; you'd scroll 50 rows to see the pattern.

**Why not a sparkline:** loses the hour-of-day pattern, which is the most actionable dimension. Heatmap is more information-dense in fewer pixels.

### Constraints

- **Agency only.** Clients don't diagnose patterns; they read individual incidents.
- **Hidden when filter is narrowed to a single property** — at that scope the property's `StateTimeline` on Property Detail serves the same purpose better.
- `bg-card-soft` card, `radius-lg`. Cells use status palette at 50% opacity (un-hovered).
- Hover cell → `Tooltip`: *"3 anomalies on Tue 15 Apr, 10:00–11:00 UTC — Degraded, Degraded, Watch."*
- Click cell → filters stream to that hour window.
- **Does NOT animate on data update.** Cells static on first load; on Realtime update, cell color updates without transition.

---

## 8. Anti-patterns avoided on this screen

1. **The anomaly log that becomes a Jira clone.** No assignee fields on rows, no priority labels alongside severity, no due dates, no linked tickets, no comment threads, no sprint groupings. One workflow only: **detect → acknowledge → resolve**. The acknowledge-reason IS the note; one note per state transition is sufficient. When asked "can we add a notes thread to each incident?" the answer is no.
2. **The filter rail that filters nothing visible.** When the current filter combination returns 0 results, show "**0 anomalies match these filters**" in the active filter summary AND inline within the stream area: a `body-md` sentence — *"Try removing the severity or time range filter — there were 4 anomalies in the last 30 days matching the other filters."* The system does the work of suggesting which filter to relax.
3. **The realtime feed that makes the screen feel alive when everything is fine.** No fade-ins on row updates, no ripple effects on severity changes, no motion on data arrival in the normal state. Motion is an alarm. The "N new anomalies" pill is deliberately static. Only the Critical-state glyph pulse is permitted ambient motion.

---

## Component inventory updates

### Reused
`TopNav`, `StatusGlyph`, `AnomalyRow` (stream + corroborating-signal + contrast-card variants), `MetricBandChart` (drawer variant), `AcknowledgeControl`, `AnnotationBand`, `DetectorRow`, `PropertySwitcher` (in drawer breadcrumb), `KPINumber`, `OptionTile`, `ResolvedCard`. shadcn: `Sheet`, `Command`, `Popover`, `Separator`, `Tooltip`, `Switch`, `Select`, `Textarea`, `Button`, `Skeleton`.

### Reused with new variants

- **`AnomalyRow`** — new **"stream" variant**: card strip (not timeline-embedded row). Hover reveals four action icons. Multi-select checkbox appears on hover once selection mode is active. "3 checks affected" pill for grouped incidents.

### New components

| Component | Purpose |
|---|---|
| **`AnomalyHeatmap`** | 24-col × N-row hour-of-day heatmap. Props: `anomalies[]`, `period`, `onCellClick`. Cell color = highest severity that hour. **Agency-only.** |
| **`NewAnomaliesPill`** | Sticky pill above first stream row when Realtime delivers new rows. Props: `count`, `onLoad`. Contrast surface, `radius-pill`, **static (no animation)**. |
| **`BulkActionBar`** | Sticky bottom bar in selection mode. Props: `selectedCount`, `onAcknowledgeAll`, `onMuteAll`, `onResolveAll`. Contrast surface, `radius-lg` top corners. |
| **`FilterRail`** | Left sidebar facet panel. Props: `filters`, `onChange`, `role`. `bg-card-soft` sticky card on desktop; `Sheet` on tablet/mobile. URL-param aware. |
| **`ContributingChecksList`** | Drawer subsection for grouped incidents. Renders `DetectorRow` items; clicking swaps the `MetricBandChart` in the drawer. Props: `checks[]`, `activeCheckId`, `onCheckSelect`. |
| **`IncidentActivityLog`** | Chronological text list of state transitions for one anomaly. `mono-sm` `fg-secondary`. Props: `events[]`. Read-only. Distinct from `StateTimeline` (which encodes 30-day health as blocks). |
