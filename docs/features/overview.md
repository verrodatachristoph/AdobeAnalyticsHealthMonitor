# Overview (`/`)

> The five-second-test view across all properties the user can see. Both audiences land here first.
> Same component tree, role-aware projections.
> Design tokens live in [docs/design/design-framework.md](../design/design-framework.md).

---

## 1. Screen architecture

### Route + rendering

`app/(app)/page.tsx` — Server Component shell. Three `"use client"` islands:
- **`ClientFilterBar`** (interactive pill filter, agency-only)
- **`RealtimeOverlayController`** (subscribes to Supabase Realtime, fans updates to tile state)
- **`RecentActivityRail`** (Realtime-subscribed scroll list)

Page receives role and accessible properties/clients from the auth session. **No client-side fetching on initial render.** Tiles render with at-load status; Realtime updates patch them in-place.

### Page header — `PortfolioBanner`

Full content width, 48px top padding, **no card chrome** — sits directly on `bg-field`. Visual anchor of the first viewport. Property name is NOT the largest text on this screen; **the verdict is**.

### `PortfolioBanner` variants

**All-healthy**
- `display-md`, weight 300: *"Everything looks good."*
- Sub-line `body-sm` `fg-secondary`: *"We're watching your Adobe Analytics around the clock — last check ran **{relativeTime}**."* The bold `relativeTime` is `mono-sm` inline — only non-regular-weight text in the sub-line.
- No glyph, no color. **Cream field is the color.** Absence is the signal.

**One active issue**
- `display-md`: *"We're keeping an eye on one property."*
- Sub-line: *"We noticed something unusual on **{propertyName}** around {relativeTime} and our team is looking into it. No action needed from you."*
- Bare `StatusGlyph` (investigating, steel-blue) left of verdict, 32px, vertically centered to first line. Not a chip.

**Multiple active issues (2–4)**
- `display-md`: *"We're investigating {N} properties."*
- Sub-line: *"Our team is looking into issues across {propertyList}. We'll update this view as we learn more."*
- Same bare glyph, severity of worst active state.

**Multiple active issues (5+)**
- `display-md`: *"Several properties need attention."*
- Sub-line: *"{N} issues across {clientCount} clients are being investigated. Severity-sorted list below."*
- Glyph shifts to `status-degraded` if any property degraded; `status-critical` if any critical.

**Unknown / ingestion stalled**
- `display-md`: *"We're having trouble reaching your data right now."*
- Sub-line: *"Our monitoring hasn't been able to connect to Adobe Analytics for the last {staleDuration}. We're working on it — no action needed from you."*
- Bare `StatusGlyph` "Unknown" variant: open circle with faint dashed stroke, `fg-secondary`. **Does NOT use any status-severity color** — this is infrastructure state, not health.
- **Banner gets `bg-accent-tint`** (very light amber wash) at the card level — distinct without alarming.

### Multi-client scope (agency)

Default: **"All clients"**, no filter. Tile grid groups properties by client via sticky `PropertyGroupHeader` rows (§2). The **`ClientFilterBar`** — horizontal pill strip — renders below the KPI strip, before the tile grid:
- Pills: "All clients" (default active, amber underline) + one pill per client name, alphabetical.
- >6 clients → overflow `+{N} more` opens `Popover` with command-search.
- Selecting a client filters the tile grid; **the banner verdict does NOT change** (always reflects global scope).

Client viewers never see `ClientFilterBar`.

### Below-banner KPI strip (agency-only)

Three `KPINumber`s, no card chrome, 32px below `PortfolioBanner`. Portfolio-wide dashboard-in-a-line.

| Caption (`caption` token) | Numeral | Qualifier (`body-sm`) |
|---|---|---|
| `PROPERTIES HEALTHY` | `{N}` | `of {total} monitored` |
| `ACTIVE ISSUES` | `{N}` | `{N} watch, {N} investigating` (two-line if both non-zero) |
| `LAST CHECK RAN` | `{relativeTime}` | `{absoluteTime} UTC · all schedulers healthy` |

Third numeral renders `display-md` weight 300 even though it's a relative string ("3 min ago"), not a count. Intentional — strip's job is proof-of-life for the analyst, "how recent is our data" is a first-class concern. **When a scheduler is overdue:** third qualifier changes to "check overdue" in `status-watch` text color (no glyph; color + label sufficient).

Clients don't see this strip — for them, the `PortfolioBanner` sub-line carries the proof-of-life.

### Above-the-fold divergence by role

| Zone | Agency analyst | Client viewer |
|---|---|---|
| `PortfolioBanner` | Global portfolio verdict, all clients | Scoped to their client only |
| `ClientFilterBar` | Rendered | Not rendered |
| KPI strip | Rendered | Not rendered |
| Active issues section | If issues exist, with ack affordance | If issues exist, no ack affordance |
| Tile grid | All clients × properties, grouped | Their properties only, ungrouped |
| Recent activity rail | All clients, all event types | Their properties, resolved + investigating only |

---

## 2. Property tile grid

### Default sort

Severity DESC (Critical → Degraded → Investigating → Watch → Unknown → Healthy), then alphabetical within tier. **"Recently changed"** (status flipped in last hour) → subtle amber dot on the tile; does NOT re-sort. **Severity is the primary axis.** Prevents the grid from reordering itself while the analyst is reading.

### `StatusTile` content

Multi-encoded per design framework: tile background tint + glyph + border weight + density. All four signals agree.

**Base content (all roles):**
- Property name in `heading-md`, two-line cap with text-ellipsis.
- `StatusGlyph` (16px) + status word chip (pill, low-opacity fill).
- `Sparkline` — 24h trend of property's highest-weight metric. 48px tall, muted stroke, single marker dot on most recent point. **Agency:** always shown. **Client:** only if KPI is `visible_to_client`.

**Density-progressive metadata rows:**
- **Healthy** → 1 row: `mono-sm` `fg-secondary` "last check {relativeTime}"
- **Watch** → 2 rows: + "Slight deviation on {metricName}"
- **Investigating** → 3 rows: + "Unusual {metricName} since {HH:MM UTC}" + "We're looking into it" (client) / "D{N} off-baseline" (agency)
- **Degraded/Critical** → 4 rows: includes "Since {HH:MM UTC}" in `mono-sm` at top + explicit duration

### Agency hover reveal

- Suite ID in `mono-sm` `fg-secondary`
- Two text links: **"View detail"** (navigate) and **"Acknowledge"** (opens compact inline `AcknowledgeControl` `Popover` — for analysts who want to ack without leaving Overview)
- D1–D5 pass/fail in a tiny 5-dot row: five 6px circles, sage if passing, status-color if anomalous

### Client hover reveal

**None.** Tiles are navigable, not interactive in other ways for clients. Hover triggers only the tone-shift (1–2px lift from `bg-card-soft` to `bg-card-paper`) per motion spec.

### Responsive grid

| Breakpoint | Layout |
|---|---|
| ≥1280px | 4-up (3 of 12 cols each) |
| ≥1024px | 4-up |
| ≥768px | 3-up |
| 480–767px | 2-up |
| <480px | 1-up |

Tile aspect ratio: **fixed 3:2 on desktop**; tiles grow vertically via density mechanism as severity increases — higher-severity tiles are physically taller.

### 30+ properties (agency)

Properties grouped by client with sticky **`PropertyGroupHeader`**: thin `hairline` separator + client name in `caption` uppercase + property count ("Acme Corp · 8 properties") + `ClientFilterBar` shortcut chevron.

A 30-property grid becomes 8 groups of 3–5 tiles — cognitively manageable. Alphabetical by client name; **critical-status clients do NOT float to the top** of the group list. Severity sort operates within each group, not across. Cross-group prioritization is visible via the active issues section.

**No pagination.** Full grid renders single-scroll. Virtualization (`@tanstack/react-virtual`) when total tiles > 40 — looks identical to flat render.

A `Search` input (Lucide `Search` icon, `radius-pill`) sits at the right end of the `ClientFilterBar` row. Typing filters tiles across all groups in real time (client-side filter on rendered tiles, no new fetch). Non-matching tiles hidden; group headers with zero matches hidden.

### Click

Tile click → `/properties/[propertyId]`. **No drill-down drawer on Overview.** Tiles point elsewhere; they don't expand.

---

## 3. Active issues area

When ≥1 issue exists, this section renders **above the tile grid**, **below the KPI strip / `ClientFilterBar`**. Pushes tile grid down — analyst doesn't hunt for the alert.

### Treatment

Stacked list of `AnomalyRow` entries in **contrast-card variant**, inside a `bg-card-contrast` card titled "Active issues" (`heading-md`, `fg-on-contrast`). Full content width, `radius-lg`. **The screen's single contrast card above the fold** (per the design framework rule).

### Copy

**1 issue:**
- Title: "Active issue" (singular) + amber `status-investigating` chip inline right of title
- Row: *"Hit volume on **{propertyName}** has been 38% below baseline since 09:42 UTC. We're looking into it."*

**2 issues:**
- Title: "2 active issues"
- Two `AnomalyRow` entries, severity-sorted: Critical → Degraded → Investigating → Watch

**5+ issues:**
- Title: "{N} active issues"
- First 3 rows rendered. Below: text link **"Show {N−3} more →"** that expands inline (no navigation). Reveals remaining rows in same contrast card — no separate page.

### Affected tiles in the grid

Properties with an active issue carry a **3px solid left border in the corresponding status color** on their `StatusTile`. Same border weight as the design framework's status encoding — not an additional treatment, just the correct treatment. Contrast card above and tile below point to the same property without explicit cross-referencing. **No badge, no number overlay, no ribbon.**

### Acknowledge from Overview

Agency analysts can ack via the hover-reveal "Acknowledge" link on the **tile** (opens `AcknowledgeControl` `Popover`). They **cannot** ack from `AnomalyRow` inside the active issues card — those rows have a single "View →" text link that navigates to Property Detail where the full `AcknowledgeControl` is surfaced WITH the corroborating-signals context.

**Rationale:** acknowledging without seeing corroborating signals is a bad pattern at the property level. The tile shortcut is for analysts who already know the issue (e.g. a check-in after a deploy).

---

## 4. Recent activity rail

### Layout

- **Desktop:** right rail, 4 of 12 cols, top-aligned with the top of the tile grid (or with the active issues section when present). Extends to bottom of page content. **Scrolls with the page** (not sticky).
- **Tablet/mobile:** below tile grid, full width.

### Surface

`bg-card-contrast` — same charcoal anchor as Property Detail. Note: when the active issues section is also present, both can be charcoal. The "one contrast card above the fold" rule applies to first viewport; the rail typically renders below fold for most analyst grid sizes.

**Edge case:** if both would appear above the fold (e.g., a client with one property + an active issue), rail uses `bg-card-soft` instead; active issues keeps contrast. Server-side check: if total properties in view = 1 AND active issue exists → rail = soft.

### Title

"Recent activity" (`heading-md`, `fg-on-contrast`). Thin `hairline` below.

### Contents by role

**Agency analysts** see across all managed properties: status transitions, mute events, ack events, annotation additions, shadow-to-live transitions. Each `AnomalyRow` (contrast-card variant): amber `mono-sm` timestamp | `StatusGlyph` | property name in `body-sm` bold | one-sentence description. Up to **15 rows** before "View all in Anomalies →" text link.

**Client viewers** see only investigating events (post-acknowledgement — never `detected`) + resolved events for their properties. Mute events, analyst names, annotation changes hidden. Up to **8 rows**.

**Empty state:** *"No recent activity."* in `body-sm` `fg-secondary` (renders as `fg-on-contrast` inside contrast card via token hierarchy). No illustration.

---

## 5. Client view specifics

### Single-property client

**Do NOT redirect to Property Detail.** Render Overview with the single `StatusTile` at 6-col width (centered, not full-width). Banner in single-client scoped variant.

**Why:** the Overview URL is what the agency emails; it's the root of the authenticated session; it should be a stable landing they return to. Redirecting means clicking the logo / "Overview" nav always bounces them away from a property detail page → disorienting. The one-tile Overview is a stable home.

The single tile renders at increased density — 6-col width lets the chip, sparkline, and last-check timestamp breathe at a property-card size, not a grid-item size. **No aspect-ratio lock**; height is intrinsic.

### Multi-property client

Same component tree as agency view, but: no `ClientFilterBar`, no group headers, no KPI strip, no agency hover reveals. Tile grid renders ungrouped. Sort: severity DESC, alphabetical. For 4–6 properties this grid is perfectly legible as-is.

### "Your priorities" on Overview

Starred KPIs section appears for client viewers when ≥1 KPI is starred across any of their properties. Renders **between `PortfolioBanner` and tile grid**:
- `heading-md`: "Your priorities"
- `caption` sub-line: "The metrics you've marked as most important, across all your properties."
- **Horizontal scroll strip** (NOT a grid) of `KPITile` `compact` variant — 3 visible at once on desktop, fade-out right edge. Each tile: property name in `caption`, KPI name in `heading-md`, current value + trend sparkline, status chip.
- Click a `KPITile` → navigates to property detail, scrolled to that KPI's tile.

**Rationale for strip vs grid:** on Overview this section is secondary to status tiles. A full grid would compete; a strip signals "more here, but not the primary action."

Agency analysts do NOT see this section on their Overview — starring is a client action; analysts read starred KPIs in Property Detail.

### "Your summary" (executive view) discoverability

Two places:
1. **Top nav** — rightmost pill labeled **"Your summary"**. Client-only (agency analysts access via "Executive preview" affordance on the client detail page).
2. **On Overview** — below `PortfolioBanner` for client viewers, subtle text link in `body-sm` `fg-secondary`: **"View your monthly summary →"** Not a CTA card, not a button — discoverable text link. Lives below verdict, doesn't compete with tiles.

---

## 6. Realtime behavior

The `RealtimeOverlayController` subscribes to `INSERT` events on `anomalies` (filtered to user's accessible property IDs via Supabase Realtime's RLS channel filter).

### Tile updates

Affected tile's `StatusGlyph` and chip update in-place via React state. Border weight updates. **Tile does not animate, does not flash** — the background token shift from the new status is the only visual change. **Does not scroll into view** — analyst may be reading elsewhere.

### Active issues card

If a new issue creates the **first** `AnomalyRow`: contrast card enters DOM via `motion.div` with **200ms ease-out fade** from `opacity: 0` to `opacity: 1`. **The one permitted entry animation on the page** — the system signaling "something appeared that requires attention" (motion-as-alarm).

For subsequent rows added to existing card: **prepend with 100ms fade**, no card-level animation.

### Recent activity rail

New rows prepend with 100ms fade — identical to existing `AnomalyRow` entry animation. **No scroll-to-top.** Analyst not forced to look at the rail.

### Client viewer treatment

Identical mechanism, but anomaly description uses warm-voice client copy (*"We noticed something unusual on {propertyName} — our team is looking into it."*). Tile glyph/chip use status-investigating encoding. **No toast for clients** — visual update to the tile IS the notification.

**Agency analysts** do see a `Toast` (sonner, 150ms slide-in, `body-sm`) with the description and "View →" link — for analysts who may be on a different browser tab.

---

## 7. Empty states

### Agency, no clients yet
- `PortfolioBanner`: "No clients yet." (`display-md`)
- Below in `body-lg`: "Add your first client to start monitoring Adobe Analytics properties."
- Primary `Button` "Add client →" → `/settings/clients`.
- KPI strip and tile grid do NOT render. Recent activity rail does NOT render.

### Agency, clients exist but zero properties
- Banner: "No properties configured." Same pattern.
- Button: "Add a property →" → `/settings/clients/[clientId]/properties/new`.

### Client viewer, newly onboarded (cold-start)

Should be rare (per CLAUDE.md, backfill completes before invite). When it occurs:
- Tile grid renders with tiles in cold-start treatment (dimmed, `ColdStartGlyph`, "Coming soon — ready by {date}").
- `PortfolioBanner`: *"We're setting up your monitoring — almost ready."* (`display-md`)
- Sub-line: *"We're collecting your historical data to establish a baseline. Your monitoring will be fully active by {date}."*
- No status chips, no sparklines on cold-start tiles.
- **Do NOT show as Unknown / error state** — use warm-gray, not a status color.

### All-healthy

**No special empty-state treatment.** Tiles exist; they're all sage. Banner says "Everything looks good." — sufficient. **Do NOT render a `ResolvedCard` or "No active issues ✓" anywhere.** The absence of the contrast-card issues section IS the message.

---

## 8. Time range and "last check ran" affordance

### Where it lives

- **Primary:** in the `PortfolioBanner` sub-line — *"last check ran **{relativeTime}**"* — for both roles. Where the client viewer's eyes land first.
- **Secondary (agency):** the third `KPINumber` — full `{relativeTime}` numeral + `{absoluteTime} UTC` qualifier. Analysts need both relative and absolute for situational awareness.
- **Per-tile:** single `mono-sm` `fg-secondary` line "checked {relativeTime}" at the bottom of metadata. Per-property proof-of-life.

### `relativeTime` granularity

| Elapsed | String |
|---|---|
| 0–59s | "moments ago" |
| 1–4 min | "{N} min ago" |
| 5–59 min | "{N} min ago" (consistent format) |
| 60+ min | "over an hour ago" (triggers overdue treatment) |

**Never "just now"** — reads as a system default, not agency voice. "Moments ago" reads as human.

### Overdue treatment

When a check is overdue (no successful poll in last `schedule_interval × 1.5`):
- `PortfolioBanner` sub-line replaces proof-of-life with: *"We're having trouble reaching your data right now — last successful check was **{relativeTime}**."* Banner shifts to `bg-accent-tint` (the unknown-data variant).
- Agency KPI strip's third qualifier → "check overdue" in `status-watch` color text.
- Individual overdue tiles add a `ColdStartGlyph`-adjacent "?" indicator in `fg-secondary` next to the per-tile timestamp. **Status does NOT change** — reflects the last known state, not Unknown. Overdue indicator is purely a freshness signal.

**Clients never see the words "overdue," "stalled," "failed."** Their copy is the warm banner sentence + `staleDuration`. The per-tile overdue indicator is agency-only (suppressed for clients, even though clients see the tile timestamp).

---

## 9. Anti-patterns avoided on this screen

1. **The Overview that becomes a metrics dashboard.** Full-size `MetricBandChart`s above the fold per property, "top metrics" sections with trend arrows for 10 KPIs, hit-volume sparkline strips across the header. Five-second test fails. **Rule:** one sparkline per tile, inside the tile. No standalone metric widgets anywhere on Overview. Any number outside a `StatusTile` must answer "are we healthy" (KPI strip) or "what happened" (recent activity rail), not "how much."

2. **The Overview that shows a red dashboard for a healthy agency.** Status-severity color used decoratively (colored card headers, amber gradients on nav, red/green trend arrows). Client opens on a healthy day, sees noise that reads as alerting. **Rule:** default state is visually neutral — cream field, charcoal text, no status colors in view if all healthy. Color appears only when it means something. Page earns personality from typography and spacing, not color.

3. **The Overview that disappears when all is healthy.** "No active issues" cards with checkmarks, large empty-state illustrations, "All good!" cards in the center. Layout collapses to near-empty viewport. Clients feel they're looking at a placeholder. **Rule:** the all-healthy Overview is the most important state to design well. Full tile grid renders regardless. Banner verdict is confident and specific. Recent activity rail shows past-tense resolved events (agency track record). Absence of issues section is not emptiness — it IS the message.

---

## Component inventory updates

### Reused
`TopNav`, `StatusGlyph`, `StatusTile`, `KPINumber`, `Sparkline`, `AnomalyRow` (contrast-card variant), `PortfolioBanner`, `ResolvedCard`, `KPITile`, `ColdStartGlyph`. shadcn: `Popover`, `Tooltip`, `Skeleton`, `Toast` (sonner), `Button`, `Separator`.

### Reused with new variants

- **`PortfolioBanner`** — four new `variant` props: `'all-healthy' | 'issues-one' | 'issues-many' | 'unknown'`. The `unknown` variant adds `bg-accent-tint` wash and a dashed-circle `StatusGlyph`. Existing Property Detail usage passes `'single-client'`.
- **`AnomalyRow`** — existing contrast-card variant used inside the active issues section. No new variant; new context only.
- **`KPITile`** — new `compact` boolean prop: renders in horizontal scroll strip format for "Your priorities" section. Property name added as `caption` above KPI name.

### New components

| Component | Purpose |
|---|---|
| **`ClientFilterBar`** | `"use client"` pill row for agency. "All clients" + per-client pills + overflow `Popover` + search input. Filters tile grid via local state. Never rendered for clients. |
| **`RealtimeOverlayController`** | `"use client"` invisible controller. Subscribes to Supabase Realtime on `anomalies` INSERT for accessible property IDs. Fans status updates to sibling `StatusTile`s via React context. Manages the one permitted entry animation for new active-issues card. |
| **`PropertyGroupHeader`** | Agency-only sticky divider: `hairline` separator + client name in `caption` uppercase + property count + filter shortcut chevron. Renders inside tile grid between client groups. |
| **`PrioritiesStrip`** | Horizontal scroll container for client "Your priorities". Fade-out right edge. Houses `KPITile` `compact` instances. Navigates to property detail on click. Renders only when ≥1 starred KPI exists. |
