# Settings → Custom KPIs (screen spec)

> The most decision-heavy screen in the agency app. Where data acquisition, sufficiency, and customization decisions converge into UI.
> Design framework tokens (colors, type, radii, motion) live in [docs/design/design-framework.md](../design/design-framework.md). This doc specifies layout, behavior, and copy.

---

## 1. Screen architecture

### Settings shell + secondary nav

The Settings route renders a horizontal **secondary nav strip** below the top pill nav: plain text tabs for `General` / `Custom KPIs` / `Notification rules` / `Team`. Active tab uses an amber underline (NOT a filled pill — filled pill is reserved for the primary `TopNav`).

### Custom KPIs content area — three stacked zones

1. **Scope control bar** — property selector (left), `Add KPI` primary button (right), and the "needs review" count chip (right of button, when non-zero).
2. **KPI list** — scrollable body, one `KPIRow` per KPI.
3. **Empty state** — replaces the list when no KPIs exist for the selected property.

There is no global KPI list. **Scope is always one property at a time** — metric and segment lists are per-RSID, so cross-property listing would mislead. The property selector defaults to the first property alphabetically.

### Getting to the form

Click `Add KPI` → a **right-anchored side sheet** slides in (200ms ease-out, width 560px on desktop, full-height, `radius-xl` on the left corners). Background dims to 40% scrim (NOT a backdrop blur — blur reads as blocking modal).

The sheet pushes a query param (`?kpi=new` or `?kpi={id}`) so the URL is shareable and back closes the sheet. Editing an existing KPI opens the same sheet pre-populated.

### KPI row at-a-glance

`bg-card-soft`, `radius-lg`, padding 16px / 24px. Shows:

- **KPI name** (`heading-md`, single line, ellipsis-truncate)
- **Property name** below (`body-sm`, `fg-secondary`) — kept even when scope is filtered, since screenshots get shared
- **Weight tier chip** (pill: standard = neutral; elevated = `status-watch` tint; critical = `status-critical` tint)
- **Sensitivity label** in `body-sm` — e.g. "Notify on noticeable drops"
- **Status indicator:**
  - Live KPI → `StatusGlyph` (current health)
  - Shadow mode → `ColdStartGlyph` (Lucide `Timer`, `fg-secondary`) + "Ready in N days" in `mono-sm`
  - Stale → Lucide `AlertCircle` in `status-watch` color
- **Muted badge** when active: pill "Muted · expires {relative date}" in muted-lavender neutral (NOT a severity color)
- **Last evaluated timestamp** in `mono-sm` `fg-secondary`, far right
- **Visibility icon** — Lucide `Eye` / `EyeOff`, no label (tooltip on hover)
- **Star count** — Lucide `Star` + integer (agency only)

**Hover behavior:** background lifts to `bg-card-paper`; three icon actions appear at the far right replacing the timestamp — `Edit` / `Mute` / `Delete`. Delete is `status-degraded` color, disabled with tooltip if the analyst did not create the KPI.

---

## 2. The Custom KPI editor (side sheet)

Five **non-collapsing** sections separated by labeled `Separator`s. Read top to bottom as a workflow.

### Section A — Identity
- **KPI name** — `Input`, max 80 chars, character count below right-aligned. Required.
- **Description (optional)** — `Textarea`, 2 rows. Note-to-future-self / context for admin reviewers.

### Section B — Source

The most technically complex section. Order: metric → segment → dimension filter (because metric drives everything else, and analysts think metric-first).

**Metric selector.** The Adobe metric list is 150–300+ entries per RSID. A plain `Select` is unusable. Pattern:

- Trigger looks like an `Input` with a Lucide `ChevronsUpDown` icon → opens a **`Command` (cmdk) inside a `Popover`** matched to field width.
- Inside: search input (auto-focused), grouped results (Adobe categories: Traffic / Conversion / Commerce / Video / Custom events), with **"Recently used" (last 4 picks across any property)** pinned at top.
- Each result row shows the **display name** (bold) + **API identifier** in `mono-sm` `fg-secondary`.
- Search hides the "Recently used" group to reduce noise.

**Segment selector.** Same cmdk pattern, lighter stakes. Empty state placeholder: "All traffic (no segment)."

**Dimension filter (optional).** Two-field inline row (dimension `Select` + value `Input`), with a Lucide `Plus` button to append rows up to 3, and `X` to remove each.

### Section C — Detection

Two grouped fields, always visible together.

**Baseline window** — two `OptionTile`s side-by-side (full width split):

| Tile | Consequence |
|---|---|
| **14 days** | Faster to detect trend changes, more sensitive to one-off events. |
| **28 days** | Smoother baseline, better for stable recurring metrics. |

**Sensitivity tier** — three `OptionTile`s stacked vertically (consequence text needs the horizontal room). Default: Medium.

| Tile | Consequence |
|---|---|
| **Notify on big drops only** | We alert when a metric falls well outside the historical range — significant enough that a client would likely notice. |
| **Notify on noticeable drops** *(default)* | We alert on meaningful deviations — the kind an analyst watching daily would flag in a Monday report. |
| **Notify on any unusual change** | We alert early, including subtle movements. Expect more notifications; each one may need analyst judgment to prioritize. |

### Section D — Visibility & Priority

**`visible_to_client` toggle** uses the new **`VisibilityControl`** component:

- Full-width `bg-card-soft` block, padding 16px.
- Left: `Switch` + label "Show to client."
- Right when ON: a compact **non-interactive client-view preview inset** showing the KPI name + placeholder sparkline labeled "Client view" in `caption`.
- Right when OFF: muted note "Hidden from client — only agency staff can see this KPI."

The preview makes the toggle consequential and visible — a single `Switch` is too easy to miss.

**Weight tier** — three `OptionTile`s stacked vertically.

| Tile | Consequence | Analyst restriction |
|---|---|---|
| **Standard** | Contributes to the property's composite health score. | Selectable |
| **Elevated** | A sustained drop can move the property to Watch or Degraded. | Selectable |
| **Critical — admin only** | A sustained drop can move the property to Critical. Reserved for agency admins. | **Disabled (opacity 0.4, Lucide `Lock` corner icon)**, NOT hidden — analysts know it exists. Tooltip: "We've reserved Critical weight for agency admins to prevent accidental client-visible escalations. Ask your admin to configure this if needed." Not keyboard-focusable for analysts. |

**Composite weight cap signal** (passive inline note below Weight tier):
- 30–39% of the 40% cap → `body-sm` neutral note: "Custom KPIs for this property are currently at {N}% of the 40% composite cap. Adding or upgrading weight tiers may cause the system to proportionally scale all custom KPI weights down."
- ≥40% → `body-sm` `status-degraded` note: "This property has reached the 40% cap. Weights will be scaled automatically."

No blocking modal. The system handles it transparently per the data model; the UI just tells the truth.

### Section E — Mute (existing KPIs only)

Omitted for new-KPI creation. For existing KPIs, this section shows the current mute state and the duration/reason controls. (Detail in §4 below.)

### Save flow

Sticky footer inside the sheet: `Cancel` (ghost) and `Save KPI` (filled, `amber-500`, `fg-on-accent`). **No autosave. No draft state.** Reason: KPI changes cascade into composite score and client-visible status — autosave would create ambiguity about when a change took effect.

- On save: button label → "Saving…" (disabled, no spinner, just label change).
- On success: sheet closes; `sonner` toast bottom-right: *"We added '{KPI name}' to {Property name}. It will run in shadow mode for 56 days before contributing to the score."*
- On failure: button returns to "Save KPI"; inline note above footer in `status-degraded` color: *"We weren't able to save that KPI. Check your connection and try again — your changes are still here."*

---

## 3. Cold-start communication (shadow mode)

### Agency side

- KPI list row → `ColdStartGlyph` + "Ready in N days" in `mono-sm`.
- Editor (when reopening a shadow-mode KPI) → persistent `bg-accent-tint` block at top: *"This KPI is in shadow mode — We've been learning its baseline since {start date}. It will contribute to the score and trigger alerts after {ready date} (in N days)."*

### Client side (in property detail view, NOT Settings)

The client property view lists shadow-mode KPIs in "Your tracked metrics" with a subdued treatment:
- KPI name + `caption` label "Coming soon"
- One-line warm copy: *"We're building a baseline for this metric — it will be active by {ready date}."*
- No progress bar (implies a job to monitor), no spinner (implies loading), no status color (implies a problem)
- Tile uses `bg-card-soft` at reduced weight; no `StatusGlyph`.

Client should read this as "the agency has set this up and it's maturing," not "something is pending or broken."

### Shadow → live transition

Quietly. No banner. No client notification. The `ColdStartGlyph` simply disappears, replaced by the normal `StatusGlyph`. On the client view, the "Coming soon" tile becomes a live KPI tile on next page load. If an analyst is actively watching the KPI list at that moment, a small `sonner` toast fires agency-side: *"'{KPI name}' is now live and contributing to {Property name}'s score."*

Shadow-to-live is not an incident. It's a good thing happening quietly.

---

## 4. Mute UX

### Row-level (quick path)

Lucide `BellOff` row action → small inline `Popover` anchored to the button:
- **Duration** `Select`: "Until end of today" / "3 days" / "7 days" / "14 days (max)".
- **Reason** `Textarea` (2 rows, no resize), required, **min 20 characters before the "Mute KPI" button enables**. The disabled-button-as-feedback pattern communicates "we expect a real reason" without lecturing.
- "Mute KPI" (filled primary) + "Cancel" (ghost), right-aligned.

### Editor-level (Section E)

Same controls with more context. If already muted, shows current state inline: *"Muted until {date} — Reason: '{reason}'"* with a "Remove mute" text link. Analyst can extend or change without removing first.

### At-a-glance state on a muted row

- Weight & sensitivity chips dimmed to 0.5 opacity (NOT hidden).
- "Muted" pill in secondary metadata: "Muted · expires {relative date}" — relative English, not UTC. ("in 4 days", "tomorrow")
- Hover the pill → tooltip with the full reason text.

### What clients see when their starred KPI is muted

The client property view does NOT expose mute state. The KPI tile continues to appear in "Your tracked metrics" with its **last known status** (e.g., "Healthy" if it was healthy when muted). No "Muted" label is shown.

Rationale: mute is an operational agency decision ("we know about this, it's intentional"). Showing clients "Muted" raises the question "muted from what?" and creates worry where there is none. The data isn't suppressed — alerts simply don't fire during the mute window.

---

## 5. The "needs review" affordance

### Badge location

A small numeric badge inside the **Settings pill** in the top nav (right edge, like notification counts in mail clients). Background uses `status-watch` tint (NOT `status-critical` — this isn't an emergency). Counts:
- Orphaned KPIs (owner inactive)
- KPIs with `last_evaluated_at` NULL past cold-start
- Currently muted KPIs (so analysts don't forget what they silenced)

No duplicate badge on the Custom KPIs secondary tab — once inside Settings the inline review section makes a tab badge redundant.

### Review queue treatment

Not a separate route. An **inline sticky section** at the top of the Custom KPIs list (between the scope control bar and regular rows) titled "Needs your attention" in `heading-md`.

Each item is a `KPIRow` variant with `bg-accent-tint` background and a right-aligned reason label:
- "Owner inactive — no analyst has edited this in 90 days"
- "Not evaluating — last checked {relative time ago}"
- "Muted since {date} — expires {date}"

Each row has an **Edit** action. Section collapses when all items are resolved. **No "dismiss all" button** — each item must be intentionally handled.

---

## 6. Empty & edge states

### First-time empty

When the selected property has no custom KPIs, render a centered block on `bg-card-soft`, `radius-lg`, padding 48px:

- Caption: "No custom KPIs yet"
- `body-lg`: *"Custom KPIs let you track the metrics that matter most to this client — beyond the standard health checks we run automatically."*
- Secondary line: *"They start in shadow mode and build a 56-day baseline before contributing to the property score."*
- Repeat the `Add KPI` button here for in-context entry.

**No illustration. No arrow. No celebratory copy.** This is configuration, not onboarding.

### Analyst viewing a Critical-weight KPI (read-only)

- Row renders normally; weight chip is "Critical" in `status-critical` tint.
- Hover → "Edit" icon replaced by Lucide `Eye`.
- Click → sheet opens read-only: fields are static text (not form controls); persistent `bg-accent-tint` note at top: *"This KPI is configured at Critical weight — editing is reserved for agency admins. You can view but not change its settings."* Footer shows "Close" only; no "Save KPI" button.

### Stale KPI (`stale_kpi`)

- Row glyph → Lucide `AlertCircle` in `status-watch` color (NOT critical — data hygiene issue, not a client incident).
- Secondary metadata: *"Not evaluating — underlying metric returned no data."*
- Hover → "Delete" gets primary-action emphasis (this is the suggested resolution).
- Inside editor → persistent `status-watch` note above Section B: *"We couldn't find data for the selected metric in the last evaluation window. Verify the metric ID is still active in this report suite, or select a different metric."*

### Approaching composite weight cap

Handled passively inline in §2 Section D. No modal, no toast.

---

## 7. Anti-patterns avoided on this screen

1. **Settings page that becomes a configuration debugger.** Every data point on the row must answer "what is this KPI?" or "is it working?" — never "how does the system process this?". Raw API IDs go inside the editor in `mono-sm`, not on rows. Evaluation internals live in a future "System logs" view, not here.

2. **The form that pretends to be simple but surprises you at save.** Every `OptionTile` shows its consequence in plain language **before** the save button — not in a tooltip, not in a post-save toast.

3. **The "add KPI" flow as three separate screens.** A property selector → KPI-type selector → form is bureaucratic. Single side sheet with sequenced sections; complexity absorbed by `cmdk` Command components, not by adding routes.

---

## Component inventory updates

### Reused
`StatusGlyph`, `KPINumber`, `TopNav`, `Sparkline` (for client-side cold-start preview). shadcn primitives: `Sheet`, `Command`, `Popover`, `Select`, `Input`, `Textarea`, `Switch`, `Separator`, `Tooltip`, `Button`, `Toast` (sonner).

### New domain components

| Component | Purpose |
|---|---|
| **`KPIRow`** | KPI list row with role-aware actions, cold-start and muted state variants. Distinct from `AnomalyRow` — different data shape and interaction model. |
| **`OptionTile`** | Large tap-target selector tile with primary label + consequence text. Replaces segmented controls for high-stakes choices. Will recur in notification rules and threshold flows. Generic props: `label`, `description`, `selected`, `disabled`, `lockIcon`, `onSelect`. |
| **`VisibilityControl`** | `visible_to_client` toggle with live client-preview inset. |
| **`ColdStartGlyph`** | Timer-icon glyph for shadow-mode KPIs. Distinct from `StatusGlyph` so "maturing" isn't conflated with a health status. |
