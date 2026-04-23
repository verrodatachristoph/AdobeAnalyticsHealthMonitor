# Design framework

> **Direction:** Warm, calm, confident. A trust artifact disguised as a soft, polished product.
> **Inspiration (not copy):** The Crextio-style HR dashboard visual language — warm cream field, charcoal anchors, mustard/amber accent, heavy rounded corners, mixed light+dark card blocks, pill-shaped nav, large light-weight display numerals.
> **Deliberate divergence:** This is an observability/health product, not a social/HR product. We take the warmth and the layering — we reject the playfulness (no photos of people, no celebratory emoji, no party confetti, no decorative gradients, no cheerful illustrations). Trust > delight.

---

## 1. Design principles

1. **Calm beats impressive.** A stakeholder opening the dashboard should feel reassured, not dazzled. Empty fields, generous air, and one confident number outperform five charts.
2. **Warmth signals care.** Cream, not clinical white. Amber, not neon. Rounded, not sharp. The product is run by humans watching over data — the surface should feel that way.
3. **Restraint is the design.** Every element competes for attention; most elements should lose. The only things that should demand attention are: current status, current incidents, and the "we're watching" proof-of-life.
4. **Status is multi-encoded.** Color, glyph, density, and border weight all carry severity. Never lean on color alone.
5. **Both modes are first-class.** Light and dark are designed together, not one adapted from the other. Client-side theme preference is remembered per user.
6. **Motion is an alarm.** If something moves on screen, it's because the system needs attention. Otherwise, perfect stillness.
7. **The grid is felt, not seen.** Subtle column alignment, no visible rules, no borders-for-borders'-sake. Structure comes from spacing and tone, not lines.

---

## 2. Color system

Tokens are semantic. No component references raw hex; everything goes through the token layer so dark mode and future theming work.

### 2.1 Base palette (raw values — for reference, not direct use)

| Name | Light | Dark | Role |
|---|---|---|---|
| `cream-50` | `#FBF8F1` | — | Warm background field, light mode |
| `cream-100` | `#F5EFE2` | — | Raised-card background, light mode |
| `cream-200` | `#EBE3D0` | — | Hairline / subtle divider, light mode |
| `ink-900` | `#12110F` | — | Dark cards, headings in light mode |
| `ink-800` | `#1E1D1A` | `#1E1D1A` | Dark mode field base |
| `ink-700` | `#2A2925` | `#2A2925` | Dark mode raised card |
| `ink-600` | `#3B3A35` | `#3B3A35` | Dark mode hairline |
| `ink-200` | `#9D9A92` | `#9D9A92` | Muted text secondary |
| `paper-50` | `#FFFFFF` | — | Elevated "paper" card (highest surface) |
| `amber-500` | `#E9C94A` | `#E9C94A` | Primary accent — the brand yellow |
| `amber-600` | `#D4B43A` | — | Accent hover / pressed |
| `amber-200` | `#F6E9A5` | — | Accent surface tint (fills) |

### 2.2 Semantic status palette

Status colors are **distinct from the brand accent.** Amber is the brand, not a severity. Using amber for "warning" would collapse brand and status into one signal — a mistake.

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `status-healthy` | `#4B7A52` (sage) | `#7FAF86` | Healthy — calm, confident, unsaturated green |
| `status-watch` | `#C08A3E` (amber-deep, distinct from brand) | `#E0A65A` | Watch — agency-only low-severity |
| `status-investigating` | `#2E5C8A` (steel blue) | `#6AA3DD` | Investigating — agency owns it |
| `status-degraded` | `#B8632A` (terracotta) | `#E58A4F` | Degraded |
| `status-critical` | `#A8322C` (measured red, not alarm-red) | `#D46A63` | Critical |

All status colors are muted on purpose. Saturated red/green/yellow is anxiety-inducing; muted reads as grown-up.

### 2.3 Semantic tokens (what components consume)

```
--bg-field            cream-50 / ink-800
--bg-card-soft        cream-100 / ink-700     // default warm card
--bg-card-paper       paper-50 / ink-700      // elevated "paper" card
--bg-card-contrast    ink-900 / ink-900       // anchor/contrast card (used in BOTH modes)
--bg-accent-tint      amber-200 / rgba(amber-500, 0.15)

--fg-primary          ink-900 / cream-50
--fg-secondary        ink-200 / ink-200
--fg-on-contrast      cream-50 / cream-50      // text on contrast card
--fg-on-accent        ink-900 / ink-900        // text on amber accent (stays dark in both modes)

--hairline            cream-200 / ink-600
--focus-ring          amber-500 / amber-500
```

**Key decision:** `bg-card-contrast` is charcoal/near-black in BOTH light and dark modes. In Crextio-style layouts the dark card is an anchor, a deliberate focal weight — it keeps that role in dark mode too (the contrast card becomes deeper black against the ink-800 field, preserving its anchor quality).

---

## 3. Typography

A two-family system. No third family. No web-font sprawl.

### 3.1 Families

- **Display / UI:** `Geist`, `Inter`, or `Söhne` (pick one at implementation — Geist is the pragmatic default; ships well, fits the modern but soft feel).
  Used everywhere except timestamps.
- **Mono:** `JetBrains Mono` or `Geist Mono`. Used for: timestamps, UTC offsets, IDs, check-type technical names in the agency view.

### 3.2 Scale

Tight scale, light weights, large range. Echoes the Crextio hero-numeral feel without going cartoonish.

| Token | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| `display-xl` | 72 / 80 | 300 | 1.0 | Single-number KPI (count of healthy properties) |
| `display-lg` | 56 / 60 | 300 | 1.05 | Page heroes (overview status verdict) |
| `display-md` | 40 / 44 | 400 | 1.1 | Screen titles ("Welcome back" sentence-cased) |
| `heading-lg` | 24 / 28 | 500 | 1.2 | Card titles |
| `heading-md` | 18 / 22 | 500 | 1.3 | Subsection titles |
| `body-lg` | 16 / 24 | 400 | 1.5 | Default prose |
| `body-md` | 14 / 20 | 400 | 1.5 | Table text, most UI |
| `body-sm` | 13 / 18 | 400 | 1.5 | Secondary metadata |
| `caption` | 12 / 16 | 500 | 1.4 | Labels above values, pill text, uppercase nav |
| `mono-sm` | 12 / 16 | 400 | 1.5 | Timestamps, UTC offsets, check IDs |

Headings: **sentence case**, not title case. ("Properties" not "Properties List." "Active incidents" not "Active Incidents.") Matches the warm voice.

Large KPI numerals are always weight 300 (light) — never bold. That's the Crextio move and it's what makes big numbers feel elegant rather than loud.

---

## 4. Spacing, radius, and elevation

### 4.1 Spacing scale (rem, mapped to Tailwind if used)

`2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128` px.

Default card interior padding: **24px** (mobile) → **32px** (≥tablet). Overview hero area: **48px** top/bottom.

### 4.2 Radius

Heavy, but with a ceiling — never full-pill on cards (looks like a pill, not a card). Full-pill reserved for nav items, status chips, and small action buttons.

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 10px | Input fields, small chips |
| `radius-md` | 16px | Buttons, inline pills |
| `radius-lg` | 24px | Default card |
| `radius-xl` | 32px | Hero cards, sheet modals |
| `radius-pill` | 9999px | Nav items, severity chips, icon-only buttons |

### 4.3 Elevation

We don't do shadows. The aesthetic is flat with tonal layering — a lighter card sits on a darker field, or vice versa. This is what gives the Crextio look its softness. If you feel tempted to add `box-shadow`, instead bump the card background one step (e.g., `bg-card-soft` → `bg-card-paper`) or change its border/hairline.

Exception: one very soft shadow (`0 1px 2px rgba(0,0,0,0.04)`) is permitted on dropdown/popover surfaces to separate them from underlying content. Nothing else gets a shadow.

---

## 5. Surfaces & card roles

The Crextio layouts use **three card tonalities in the same viewport** and use tonality semantically. We adopt the same discipline:

| Card role | Background | When to use |
|---|---|---|
| **Soft** | `bg-card-soft` (warm cream in light, warm charcoal in dark) | Default card. Most content lives here. |
| **Paper** | `bg-card-paper` (bright white in light, neutral charcoal in dark) | Elevated or "primary" content in a group. Use for the single most important card in a composition. |
| **Contrast** | `bg-card-contrast` (near-black in both modes) | Anchor / focal cards — used for "watch list" style widgets (active incidents list, current investigating, QBR summary). Draws the eye. Cream/amber text on top. |
| **Accent** | `bg-accent-tint` | Rare — only to highlight a specific CTA or a recently-resolved incident banner. |

**Rule of composition:** every screen has at most one contrast card above the fold. Two dark cards is a fight for attention.

---

## 6. Status encoding

Four-tier status, multi-encoded so color is never the sole signal.

| Status | Color token | Glyph | Border weight (on its tile) | Density |
|---|---|---|---|---|
| Healthy | `status-healthy` | `○` thin open circle | 0px (no border) | Sparse; generous padding |
| Watch | `status-watch` | `◐` half circle | 0px | Sparse; +1 metadata row |
| Investigating | `status-investigating` | `⬤` filled circle with notch | 2px left edge | Medium; +2 metadata rows |
| Degraded | `status-degraded` | `⬤` filled with bottom notch | 2px left edge | Medium; +2 metadata rows |
| Critical | `status-critical` | `⬤` filled with pulse | 2px full border | Dense; +3 metadata rows incl. since-timestamp |

**Motion:** only Critical pulses. 2s slow opacity cycle (1.0 → 0.55 → 1.0) on the glyph only. Never on card, number, or chart.

**Chips** for inline status labels are pill-shaped, sentence-case text, left-iconed with the glyph, filled at low opacity (`color @ 15%` in light, `color @ 25%` in dark).

---

## 7. Component inventory

Consumed at implementation time — scaffolded via shadcn/ui where a primitive exists, custom-built where the brand carries.

### 7.1 From shadcn/ui (styled to our tokens)

`Button`, `Card`, `Tabs`, `Dialog`, `Sheet`, `Dropdown`, `Command`, `Tooltip`, `Popover`, `Input`, `Select`, `Checkbox`, `Switch`, `Label`, `Separator`, `Skeleton`, `Toast` (via `sonner`).

### 7.2 Custom domain components (carry the brand)

- **`TopNav`** — centered pill-cluster navigation, with product logo at left in a pill, settings/notifications/avatar in pills at right. Active item is a filled dark pill. Matches the Crextio nav lockup structurally, styled to our tokens.
- **`PortfolioBanner`** — full-width hero at top of Overview: large display-lg verdict text + small timestamped proof-of-life line. No card chrome. `variant` prop: `'all-healthy' | 'issues-one' | 'issues-many' | 'unknown' | 'single-client'`. The `unknown` variant adds `bg-accent-tint` wash and a dashed-circle `StatusGlyph`.
- **`StatusTile`** — property tile: name (heading-md), status glyph + chip, 24h sparkline, last-checked metadata. Role-aware (agency vs client variants).
- **`StatusGlyph`** — the geometric status symbol alone. Reused in tiles, chips, rows, timeline.
- **`MetricBandChart`** — band-as-baseline, line-on-top chart. Client variant hides axis numbers + thresholds; agency variant shows them. Never animates on refresh. Variants: default tile/inline, "incident-expanded" (full 12-col, anomaly window shading + client caption), and "drawer" (640px Sheet).
- **`Sparkline`** — tiny trend line (agency-only), no axis, muted stroke, optional marker dot.
- **`AnomalyRow`** — timeline-style row: timestamp | glyph | property | one-sentence description | hover-revealed actions. Used in Anomalies log, drawer panels, recent-activity rail. Variants: default, "stream" (card strip on Anomalies log; hover reveals four action icons), "contrast-card" (amber timestamp on dark, used in recent activity rails), "corroborating-signal" (compact, no timestamp column).
- **`IncidentBanner`** — amber-tinted card used sparingly for active-investigating notice on a property detail page.
- **`ResolvedCard`** — soft card with sage dot, past-tense copy, subtle "you don't need to do anything" cue. `variant` prop: `'standard' | 'gold'`. Gold = `bg-accent-tint` + amber dot, used on the executive summary for "we caught it before you noticed" incidents.
- **`KPINumber`** — light-weight display numerals with a caption label above (Crextio's 78 · Employe pattern, restyled).
- **`StateTimeline`** — horizontal strip of tiny colored blocks, one per interval, showing status over the last 30 days. Grafana-inspired. New "single-KPI" 7-day variant for the property detail expand drawer.
- **`KPIRow`** — Settings list row for custom KPIs. Role-aware actions (edit / mute / delete), cold-start variant, muted variant, stale variant. Distinct from `AnomalyRow` (different data shape and interaction model). See [docs/features/settings-custom-kpis.md](../features/settings-custom-kpis.md).
- **`OptionTile`** — Large tap-target selector tile carrying a primary label + a one-line consequence string. Replaces segmented controls when the choice has real downstream consequences (sensitivity tier, weight tier, baseline window). Props: `label`, `description`, `selected`, `disabled`, `lockIcon`, `onSelect`.
- **`VisibilityControl`** — `visible_to_client` toggle with a live, non-interactive client-view preview inset on the right side. Makes a single `Switch` consequential.
- **`ColdStartGlyph`** — Timer-icon glyph variant used for shadow-mode KPIs. Deliberately not a status color — "maturing" must not look like "broken" or "warning."
- **`PropertySwitcher`** — Dropdown pill in the property detail page header (NOT in top nav). Opens a `Popover` listing scoped properties with live `StatusGlyph`. See [docs/features/property-detail.md](../features/property-detail.md).
- **`DetectorRow`** — Sub-row inside the Health checks card on Property Detail: small `StatusGlyph` + role-aware label + optional timestamp. Anomalous variant gets a `bg-accent-tint @ 20%` row wash.
- **`KPITile`** — Card-layout variant of `KPIRow` for the Property Detail KPI grid. Carries cold-start, muted, and starred state variants. `compact` boolean prop: renders in horizontal scroll strip format for the client Overview "Your priorities" section.
- **`AcknowledgeControl`** — Textarea + acknowledgement button + mute link. Min-20-char enforcement. Agency-only. Lives inside the "What could cause this" contrast card on Property Detail.
- **`AnnotationBand`** — Visual primitive on `MetricBandChart`: vertical band layer with a label cap and tooltip. Used for deploys, campaigns, holidays.
- **`ExecutivePeriodNav`** — Three-pill segmented control (prev month / current-month-so-far / quarter) for the executive summary. Driven by `?period=` query param. See [docs/features/executive-summary.md](../features/executive-summary.md).
- **`ExportBar`** — Slim full-width bar carrying the "Generate {Period} summary (PDF)" ghost button. Used on the executive summary view; server-action backed.
- **`AgencyPreviewBanner`** — Sticky amber-tinted top banner shown ONLY when an agency analyst previews a client surface (e.g. the executive summary). Lives in the agency-only component path; never shipped to the client bundle.
- **`AnomalyHeatmap`** — 24-col × N-row hour-of-day heatmap. Cell = highest severity that hour. Used at the top of the Anomalies log (agency only). See [docs/features/anomalies-log.md](../features/anomalies-log.md).
- **`NewAnomaliesPill`** — Sticky pill above the first anomaly stream row when Realtime delivers new entries. Static (no animation, no pulse) — motion is an alarm, this is just an opt-in.
- **`BulkActionBar`** — Sticky bottom bar in selection mode on the Anomalies log. Contrast surface, `radius-lg` top corners.
- **`FilterRail`** — Left sidebar facet panel on Anomalies log (the only screen with a sidebar). URL-param-aware. `bg-card-soft` sticky card on desktop; `Sheet` on tablet/mobile.
- **`ContributingChecksList`** — Drawer subsection for grouped incidents. Renders `DetectorRow` items; clicking swaps the `MetricBandChart` in the drawer.
- **`IncidentActivityLog`** — Chronological text list of state transitions for one anomaly. Distinct from `StateTimeline` (which encodes 30-day health as blocks).
- **`ClientFilterBar`** — Pill row for agency Overview. "All clients" + per-client pills + overflow + search. See [docs/features/overview.md](../features/overview.md). Never rendered for clients.
- **`RealtimeOverlayController`** — Invisible client component on Overview that subscribes to Supabase Realtime and fans status updates to sibling tiles via React context. Manages the one permitted entry animation for a new active-issues card.
- **`PropertyGroupHeader`** — Agency-only sticky divider in the Overview tile grid: `hairline` separator + client name + property count + filter shortcut chevron.
- **`PrioritiesStrip`** — Horizontal scroll container for client "Your priorities" on Overview. Fade-out right edge. Houses `KPITile` `compact` instances. Renders only when ≥1 starred KPI exists.

### 7.3 Primitives we will NOT build

Pie/doughnut charts, gauge meters (even though Crextio shows a "78% high risk" gauge), any 3D, any animated chart transitions, skeuomorphic icons, cartoon illustrations, confetti/emoji reactions.

---

## 8. Iconography

- Single icon system: **Lucide** (ships with shadcn/ui). Line-weight 1.5, size snapping to the spacing scale.
- No color on icons by default — they inherit the text color. Severity-colored icons appear only inside `StatusGlyph`.
- No icon-only buttons without aria-label.
- Small "proof-of-life" icons (tiny signal waves, dotted circles) for the "last check ran Xm ago" affordance — subtle, muted, decorative-but-earns-its-place.

---

## 9. Motion

| Allowed | Not allowed |
|---|---|
| Modal / sheet open-close (200ms, ease-out) | Page-transition animations |
| Tile hover — 1–2px lift via background tone shift (NOT shadow) | Chart line-draw animations on data refresh |
| Critical-state glyph pulse (2s cycle) | Auto-rotating carousels of any kind |
| Skeleton loader shimmer (300ms, subtle) | Parallax, scroll-jacking, counter "rolling up" animations |
| Toast slide-in (150ms) | Cursor-following effects |

Respect `prefers-reduced-motion` — if set, all allowed motion drops to 0ms except the critical-state pulse (which degrades to a solid solid state, no animation).

---

## 10. Layout

- **Max content width:** 1440px. Center on wider screens; side gutters fill with field color.
- **Outer gutter:** 32px mobile, 64px tablet, 96px desktop.
- **Grid:** 12-column on desktop (≥1024px), 6-column on tablet, 1-column mobile. Charts can span 6–12, tiles 3–4, anchor cards 4–6.
- **Top nav:** floating pill cluster, centered horizontally, with a small gap from the top of the viewport (~24px) so the cream field breathes above it.
- **No sidebar for navigation.** Per Crextio, the hierarchy lives in the top pill nav + context-specific secondary nav. A sidebar adds visual weight that erodes the calm.

---

## 11. Dark mode discipline

Dark mode isn't "light mode inverted." It's redesigned with the same emotional goal — warmth, calm, trust — in a low-light context.

- **Field:** warm charcoal `ink-800`, NOT pure black. Pure black feels like a terminal, not a dashboard.
- **Soft cards** lift one step to `ink-700` (not lighter than field). Layering still reads.
- **Paper cards** shift to a neutral charcoal, giving the same "this card is elevated" cue. In light mode paper = brightest; in dark mode paper = same-as-soft visually but with a hairline to distinguish it.
- **Contrast cards stay black.** In dark mode they become the *deepest* surface; the ink-800 field surrounds them as if floating.
- **Amber accent preserved** — same hex both modes. Desaturate slightly (85% saturation) to reduce glow in dark.
- **Status colors** all shift one step lighter and slightly desaturated (see §2.2 dark column).
- **Text:** `cream-50` primary, `ink-200` secondary. No pure white — pure white on charcoal hurts at 2am.

Both themes share identical component layout. Only tokens change.

---

## 12. Accessibility

- All text/background combos meet WCAG AA (4.5:1 for body, 3:1 for large display text).
- Focus rings: 2px `amber-500` outline, offset 2px. Visible in both modes.
- Status never communicated by color alone — always color + glyph + text label.
- Minimum target size 40x40 for interactive elements.
- Keyboard navigation: full parity with mouse. Tab order follows visual flow top-to-bottom, left-to-right.
- Skip-to-content link present on every page.
- Charts carry `role="img"` with an `aria-label` summarizing the trend in words (agency variant); client variant charts have a `aria-describedby` pointing at the human-language caption.

---

## 13. Content tone tokens

Not typically in a design system, but tone IS design here. Canonical strings (from the client-success agent's warm variant):

- Healthy: "Everything looks good."
- Healthy caption: "We're watching your Adobe Analytics around the clock — last check ran **{relativeTime}**."
- Watch (agency-only): "Keeping an eye on {metric} — within historical range but slightly off pattern."
- Investigating: "We noticed something unusual in your {metric} around {time} and our team is looking into it. No action needed."
- Resolved: "We resolved a brief {description}. Your reporting is accurate and backfilled. No action required."
- All empty / no incidents: "No incidents in the last {range}."

Never in client-visible copy: "error", "failure", "fault", "broken", "crash", "fail-safe", "alert fired", "warning", "alarm."

---

## 14. What we deliberately REJECT from the Crextio reference

- **Photos of people.** This is a data-trust product. A smiling stock photo in the corner would undercut authority. Avatars (where needed for "Your team") are minimal initials-in-a-circle.
- **Party emoji / birthday cards / confetti.** Out.
- **Match-rate progress bars in green/orange/red gradient.** Too saturated, too playful. Our severity colors are muted.
- **The "78% High Risk" gauge.** Gauges flatten nuance into a single number and feel like consumer fitness apps. We show status instead.
- **Hiring-style line charts with wavy dotted lines.** Our charts are band-over-line, with a clean baseline band (soft fill) and a clean actual line.
- **Geographic map widget.** Out. Geographic distribution is noise, not health.
- **Pricing-card visuals.** There is no pricing. There is no self-serve tier. Agency provisions everything.
- **"Daily meeting" / "Onboarding session" calendar blocks.** Out. Our "timeline" is incident-based, not appointment-based.

---

## 15. Design-to-code handoff notes

- Tokens defined in `tailwind.config.ts` under `theme.extend.colors` + CSS variables in `globals.css` so dark mode flips via a single `[data-theme="dark"]` selector.
- A `ThemeProvider` (client component) wraps the `(app)` layout; persists the user's preference in Supabase `user_preferences` (not localStorage alone — we want the setting to follow them across devices).
- Figma source of truth (if/when produced) should mirror these tokens 1:1. No Figma-only colors.
- All copy strings live in a typed `messages.ts` or similar — no inline strings in JSX — so the warm voice stays consistent and can be tuned/reviewed without code review.

---

## 16. Example compositions (described, not mocked)

### Overview, all-healthy, light mode

- Cream field fills viewport. Centered pill nav floats 24px from top.
- Large display-md title: "Everything looks good." (sentence case, light weight)
- Below, in mono-sm muted: "Last check ran 2 minutes ago · 47 metrics monitored."
- A quiet row of 3 `KPINumber` widgets: properties healthy, checks run today, average time-to-detect this month.
- Below: a responsive grid of `StatusTile` components, all wearing the `status-healthy` glyph, evenly spaced with generous gutters. No motion.
- Right rail (desktop) or below (mobile): a **contrast card** titled "Recent activity," containing the last 3–5 `AnomalyRow` entries in past-tense resolved copy. The black anchor card is the only dark element above the fold — and it signals "here is the agency's active memory."

### Property detail, active investigating, dark mode

- Charcoal field. Pill nav floats, now with the active nav item filled amber-tinted instead of dark.
- Hero block: property name (display-lg), status chip "Investigating" left-iconed with steel-blue glyph, "since 14:32 UTC" in mono-sm.
- Directly below: a soft `IncidentBanner` (amber tint) with the warm copy: "We noticed something unusual in Conversion events around 14:32 UTC and our team is looking into it. We'll update this banner as we learn more."
- Full-width `MetricBandChart` — baseline band soft-filled in `bg-accent-tint`, actual line in `fg-primary`, today's anomaly region shaded slightly deeper.
- Secondary `StateTimeline` strip showing last 30 days of health for this property as tiny colored blocks.
- At bottom, a **contrast card** titled "What could cause this" listing corroborating signals (agency-only; hidden for client viewers).
