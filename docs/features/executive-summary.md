# Executive view — "Your summary" (`/summary`)

> A storytelling-first surface for C-level / executive client stakeholders. Opened once a month, in 90 seconds, often on a phone, often during board prep. The viewer should never need to learn statuses, severities, or KPIs.
>
> This is a **client-only** route, NEW top-level surface in the client app. It coexists with the standard property views — it does NOT replace them. Agency users can preview it for QA (see §9). Nav pill label: **"Your summary"**.

---

## 1. The narrative this screen tells (in 30 seconds)

Three messages, in order, for an executive who does not know what eVars are.

1. **"Your data is in good hands."**
   Not "your data is healthy" — that implies the exec needs to *evaluate* health. The exec's job is to feel confident *delegating* this. The word "healthy" appears nowhere above the fold. "your verrodata team" appears in the first full sentence.

2. **"We caught things you didn't have to deal with."**
   The exec's fear isn't that data breaks — it's that they'd find out about it late, from someone else, in a bad meeting. The catch count is the most visible number. *"We caught 4 issues before they touched your reports"* — the sentence that earns the renewal.

3. **"Here is the evidence, in plain English."**
   The exec should be able to forward this screen (or its PDF) to a VP without explanation. Each incident is described in 1–2 sentences using business-impact language ("your homepage campaign wasn't recording for three hours Tuesday morning"), never technical language. Resolution is always stated. No cliffhangers.

---

## 2. Screen-as-a-story — top-to-bottom layout

Five zones (A → E), top to bottom. No sidebar. Cream field breathes throughout.

### Zone A — Header verdict (full-width, no card chrome)

Single sentence verdict in `display-md` weight 300, plus one muted proof-of-life line. Uses the `PortfolioBanner` component pattern but **single-client scope**. Left-aligned desktop; centered on mobile.

**Healthy month copy:**
> A quiet month for your data. your verrodata team monitored 27 checks across 3 properties — everything ran as expected.

**Notable-incident month copy:**
> your verrodata team caught 4 issues this month before they affected your reports. All were resolved. Your data is accurate.

**Muted sub-line** (`mono-sm`, `fg-secondary`, both states):
> April 1–30, 2026 · Last updated today at 9:14 am

Engineering note: period text is rendered from `period_start` / `period_end`; "Last updated today at 9:14 am" is the `generated_at` snapshot timestamp, formatted in user's local tz via `Intl.DateTimeFormat`.

### Zone B — Hero number set (three `KPINumber`s)

Three numbers that tell the agency's value story in three glances. Horizontal on desktop; stacked on mobile.

Sits on a **`bg-card-contrast` band** — the screen's single dark anchor. Wide format: full-width on mobile, 10 of 12 cols on desktop, centered. This is the one place the contrast card is used as a horizontal band rather than a right-rail widget — these three numbers together are the agency's value proof, they deserve the visual weight.

| | Caption (above, `caption` token) | Numeral (`display-xl`, weight 300) | Qualifier (below, `body-sm`) |
|---|---|---|---|
| **#1** Issues caught (the hero — see §3) | `ISSUES CAUGHT BEFORE THEY REACHED YOU` | `4` | `this period` |
| **#2** Days monitored | `DAYS YOUR DATA WAS MONITORED` | `30` | `continuous, including weekends` |
| **#3 (incident months)** Time to resolution | `AVERAGE TIME TO FIX` | `2.1` | `hours, once we noticed` |
| **#3 (healthy months)** Checks completed | `CHECKS COMPLETED` | `842` | `this period` |

### Zone C — Incident narrative (one `ResolvedCard` per notable incident)

Each notable incident from the period in 2 sentences of plain English: what happened, when, that it's resolved.

**"Notable" =** `client_would_have_noticed = true` OR `estimated_data_at_risk` non-null and non-zero. Low-severity incidents the exec wouldn't have felt are suppressed entirely (they appear in the standard client view's incident log).

If the period has no notable incidents, **this zone does not render** — no empty state, no header. Zone A's healthy copy absorbs it.

When incidents exist, zone heading is plain `heading-md` `fg-secondary`:
> What we caught this month

**Standard template (caught & resolved, no client impact):**
> On {dayOfWeek}, {plainLanguageTime}, we noticed that {plainLanguageDescription} had stopped recording correctly. We identified the cause and restored normal tracking by {plainLanguageResolutionTime}. Your reports for this period are accurate.

**Gold template (`client_would_have_noticed = true`):**
> On {dayOfWeek}, we caught an issue with {plainLanguageDescription} before it reached your reports. Without our monitoring, this would likely have appeared as missing data in {affectedReportArea}. We resolved it within {resolutionHours} hours. No data was lost.

The phrase **"Without our monitoring"** is the agency value statement — factual, not boastful, the exact sentence the exec will repeat to their CMO.

**Gold-case visual treatment:** `bg-accent-tint` background instead of default soft card; sage dot replaced by amber accent dot. No other change. A single color distinction makes "we caught it first" cards stand out without being alarming.

**Maximum 4 incident cards.** If a period has more than 4 notable incidents, render a single sober card instead:
> We resolved 7 issues this month, which is above the expected range. your verrodata team is reviewing the root causes and will follow up.

### Zone D — What we're watching (reassurance)

`bg-card-soft`, `radius-xl`. Two-col desktop, one-col mobile.

> **What we watch for you**
> We monitor 27 checks across your 3 properties, running every hour, including outside business hours. The checks cover hit volume, campaign tracking, conversion events, product catalog integrity, and data processing latency.

Checks are NOT enumerated as a list of technical names. Business-language category names in 1–2 sentences. Actual D1–D5 list lives in the standard client view; this screen summarizes by category.

This zone does NOT change based on incident state. The point is "we are always watching," which is true regardless.

Below the prose, muted one-liner (`body-sm` `fg-secondary`):
> Questions about what's covered? Reply to any email from your verrodata team.

**No link to a settings page. No "learn more."** A reply-to-email CTA is warm and human; a link is transactional.

### Zone E — Export bar (bottom of screen)

Slim ghost-style button, right-aligned desktop, full-width mobile:
> Generate April summary (PDF)

Triggers server-side PDF generation (see §6). Always present — the exec may want a healthy-month summary just as much as an incident-month one.

---

## 3. The hero metric

**The number: "Issues caught before they reached you."**
Source: `COUNT(incidents WHERE client_would_have_noticed = true AND status = 'resolved')` for the period.

### Why this one

1. **Quantifies a near-miss.** "We ran 842 checks" is activity. "We caught 4 issues before they reached your reports" is outcomes. An exec intuitively grasps what 4 near-misses mean — 4 moments the agency protected them.
2. **Doesn't require a healthy month to be impressive.** Zero is a quiet month; 4 is the most valuable QBR artifact the agency can produce.
3. **Directly answers "am I getting value from this engagement?"** in one breath: *"They caught four issues before they touched our reports."*

### Zero-case framing

Show as `0` with qualifier *"a clean period — no issues reached you."* Don't hide it. Frame converts zero into a positive. A zero-incident period is a success story, not a blank metric.

---

## 4. Mobile-first

Primary render context: phone, portrait, under 90 seconds.

**Vertical stack order:**
1. Zone A (header verdict) — full width, `display-md` preserved.
2. Zone B (hero numbers) — contrast card, three numbers stacked vertically: Issues Caught → Days Monitored → Time to Fix / Checks Completed.
3. Zone C (incident cards) — full-width `ResolvedCard` stack, no truncation.
4. Zone D (what we're watching) — full-width soft card.
5. Zone E (export bar) — full-width button.

**Nothing essential collapses.** If the executive view can't be read end-to-end on mobile in one continuous scroll, the content is too long — cut incident cards above 4, cut Zone D prose to 2 sentences. **No "read more" expansion** on cards — if copy is too long for a glance on mobile, that's a writing problem.

**All three hero numbers are stacked**, never collapsed behind a "more" disclosure.
**Header verdict is never truncated with an ellipsis.**
**Touch targets ≥ 48×48px** — execs are skimming, not precision-tapping.
**No horizontal scroll.** Contrast card in Zone B is full viewport width with 16px inset padding on mobile.

---

## 5. Time-range model

**Default: previous complete calendar month.** A rolling-30-day window would mean the number changes every day, undermining artifact quality and incoherent in a board deck ("what period does '30 days' mean?").

**Range switcher** — three pills only via `Tabs` styled as pills:

`← March` / `April so far` / `Q1 summary`

- The left arrow on the previous-month pill makes navigation feel like flipping a page, not configuring a filter.
- "April so far" (NOT "Current month") signals it's a partial period with live numbers.
- Quarter view gives a QBR-ready aggregation without extra steps.
- **No dropdown, no date picker, no custom range.** Executives don't set date ranges.

The active period's label appears in Zone A's muted sub-line and in the PDF filename.

**Quarter view:** same layout, aggregated. Incident cards show only `client_would_have_noticed = true` from the quarter — max 6. Zone B numbers aggregate (total issues caught, total days monitored, median time to resolution).

---

## 6. Export-as-artifact

**PDF is the primary export format.** Not CSV, not Excel. The exec pastes a PDF into a board deck or forwards it. Must look like a designed document, not a browser print.

### "Generate {Period} summary (PDF)" — what happens

1. Server action calls Supabase Edge Function `generate-executive-summary`. Function renders the same data via server-side HTML-to-PDF (Puppeteer or equivalent inside the Edge Function). Does NOT use the browser print stylesheet.
2. **Dimensions:** A4 / US Letter (user locale determines default). One page for a quiet month, two pages max for an incident-heavy month.
3. **Header:** product logo top-left, client name top-right, period label ("April 2026" / "Q1 2026"). verrodata is NOT displayed in a large font — the product is its own brand. Footer: "Prepared by your verrodata team · {month} {year}" in small muted text.
4. **Zone B numbers** typeset in the same light-weight display style as the screen. Non-negotiable — a PDF where the hero numbers default to a browser serif is a trust failure.
5. **Incident narratives** (Zone C) appear in full prose. No bullet points, no tables. Reads like a letter, not a spreadsheet.
6. Zone D condensed to one sentence to save space. Zone E does not appear.
7. **Filename:** `{ClientName}_DataHealth_{Month}_{Year}.pdf` — readable as an email attachment, readable in a folder.

### No `@media print` stylesheet
PDF is always generated server-side. If an exec uses the browser print dialog, the result is acceptable but not designed — that's fine. Quality artifact = the server-side export, controlled by the agency.

### Agency can also trigger
Agency analysts can trigger the export for any client from the agency settings panel — attach to a QBR deck, email directly. PDF is identical regardless of who clicked.

---

## 7. What this screen MUST NEVER show

- **Uptime percentages.** "99.7% uptime" → "uptime of what?" — opens an awkward conversation. Also implies 0.3% failure is acceptable.
- **Charts with axes, gridlines, comparison lines.** Charts are interpretation tasks, not reassurance. `MetricBandChart` and `Sparkline` belong to the analyst view, not here.
- **Raw timestamps in UTC / ISO format.** "2026-04-15T14:02:33Z" on an executive screen is disqualifying. Use plain language: "Tuesday morning," "around 2pm last Thursday," "early April."
- **Status labels from the analyst view.** "Degraded," "Investigating," "Watch" belong to the analyst's mental model. Executive view has NO status chips. Status is conveyed via narrative copy.
- **Anything with "Configure," "Settings," or "Edit" affordance.** This is read-only for a read-only audience. Even technically-permission-blocked affordances signal "this is a tool you should be operating."
- **Currently-unresolved incident counter.** If something is being investigated *right now*, it does NOT appear here. Ongoing investigations appear as resolved in the next period's export. The screen never breaks the agency contract: "we'll reach out if you need to know something."
- **Any reference to other clients, multi-tenancy, or the word "client" referring to them.** This is *their* dashboard. They are the subject, not an object in a SaaS product.
- **Counts or names of individual analysts.** "Sarah from your verrodata team" is too personal and creates key-person dependency risk. **"your verrodata team"** is always the attribution.

---

## 8. Voice templates — five exact strings

Drop into `messages.ts`. Tokens in `{brackets}` are interpolated.

### 1. Header verdict — healthy month
> A quiet {month} for your data. your verrodata team monitored {checkCount} checks across {propertyCount} {property|properties} — everything ran as expected.

### 2. Header verdict — notable-incident month
> your verrodata team caught {issueCount} {issue|issues} in {month} before {it|they} affected your reports. All {was|were} resolved. Your data is accurate.

(Pluralize / concord against `issueCount`. String is grammatically complete whether 1 or 4.)

### 3. Incident caught and resolved (standard template)
> On {dayOfWeek}, {plainLanguageTime}, we noticed that {plainLanguageDescription} had stopped recording correctly. We identified the cause and restored normal tracking by {plainLanguageResolutionTime}. Your reports for this period are accurate.

### 4. Incident the client would have noticed — caught first (the gold template)
> On {dayOfWeek}, we caught an issue with {plainLanguageDescription} before it reached your reports. Without our monitoring, this would likely have appeared as missing data in {affectedReportArea}. We resolved it within {resolutionHours} hours. No data was lost.

### 5. Reassurance close-line (bottom of Zone D, above export bar)
> Questions about what's covered, or anything you see here? Reply to any email from your verrodata team — we're here.

(NOT a hyperlink. Says "reply to an email" — how executives actually communicate, routes back to the agency relationship, not a helpdesk queue.)

---

## 9. How agency analysts QA this view

**Pattern: a dedicated preview mode** accessible from the agency-side client detail page.

In the agency view, each client's detail page has a pill-nav item labeled **"Executive preview."** Clicking renders the `/summary` route for that client, wrapped in a sticky non-interactive amber banner at the top:

> You are previewing the executive summary for {ClientName} — {Month}. This is exactly what their stakeholders see. [Exit preview]

- Banner: `bg-accent-tint`, `fg-on-accent`. `position: sticky; top: 0; z-index: 50` so always visible while scrolling.
- Page content below is the **real, unmodified executive view** — same data, same copy, same component render.
- **No "preview mode" watermark on the page content itself** — would invalidate the test.
- Analyst can switch the time range within preview using the same segmented control.
- Analyst can trigger the PDF export from preview and receive the actual PDF artifact for inspection.

**No role-impersonation.** Analyst does NOT switch user accounts. Preview is a server-rendered prop: `isAgencyPreview: true` flag — display-layer only — suppresses the banner from the exec's actual session and renders the agency banner instead. Data query is identical.

---

## 10. Anti-patterns to design against

### 1. The executive view that becomes a marketing landing page
What it looks like: agency-capability headline copy, "what we offer" sections, "upgrade" / "learn more" CTAs, imagery of graphs going up. Happens when the team confuses "telling the agency's value story" with "selling the agency's services." The exec is already a paying client.

**The rule:** every sentence must contain a specific number, date, or description that is only true for this client in this period. If a sentence could appear on the agency's public website, it doesn't belong here.

### 2. The executive view that creeps toward the analyst view
What it looks like: a "drill in" link on each incident card opening a property detail drawer, a "view raw data" toggle, a "detection threshold" callout, a property-by-property status grid. Happens because engineers add depth ("the exec might want to know more"). They don't. If they want to know more, they email their account manager.

**The rule:** zero outbound links on the executive view except the reply-to-email CTA, which isn't a link — it's a sentence.

### 3. The executive view that shows a concerning number with no narrative frame
What it looks like: hero number shows `7`, header reads "your verrodata team caught 7 issues" — exec's first thought: "seven? that's a lot — is that bad?" Happens when data is surfaced without editorial judgment.

**The fix:** don't soften the number — frame the anxiety before it forms. If issue count is materially above baseline, Zone A copy switches to:
> This was a more active month than usual for your data. your verrodata team caught and resolved 7 issues — all before they reached your reports. We'll share more context in our next check-in.

The screen must always have an answer to "should I be worried about this?" built into the copy. Engineer parameterizes a `narrativeTone` prop (`'quiet' | 'normal' | 'active'`) derived from `issueCount` relative to the rolling 3-month average — server action computes this before rendering.

---

## Component inventory updates

### Reused as-is
`KPINumber`, `ResolvedCard`, `PortfolioBanner` (repurposed for Zone A — single-client scope, not portfolio), `StatusGlyph` (amber variant only, on Zone C gold cards).

### Reused with new props
**`ResolvedCard`** gets a `variant` prop: `'standard' | 'gold'`. Gold = `bg-accent-tint` background + amber dot instead of sage dot. Layout and typography identical otherwise.

### New components

| Component | Purpose |
|---|---|
| **`ExecutivePeriodNav`** | Three-pill segmented control (prev month / current-month-so-far / quarter). Stateless, driven by `?period=2026-03`. shadcn `Tabs` styled as pills. Left-arrow Lucide `ChevronLeft` 14px on the previous-month pill. |
| **`ExportBar`** | Slim full-width bar with the "Generate {Period} summary (PDF)" ghost button. Thin `hairline` top border. 16px vertical padding flush with page outer gutter. Server-action triggered; pending state = skeleton shimmer on button label only. |
| **`AgencyPreviewBanner`** | Amber-tinted sticky top bar, rendered ONLY when `isAgencyPreview = true`. Preview context string + "Exit preview" link returning to agency client detail. Lives in agency-only component path; never shipped to client bundle. |

### Route + rendering model
`app/(app)/summary/page.tsx` — Server Component fetches the period's aggregated data, computes `narrativeTone`, and passes **fully-formed copy strings (not raw data)** to display components. All display components are Server Components on this page. **No client-side data fetching on the executive view** — page is statically renderable on request and can be edge-cached with a short TTL.
