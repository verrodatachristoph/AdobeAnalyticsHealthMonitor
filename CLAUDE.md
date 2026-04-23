# Adobe Analytics Health Monitor

> Internal observability dashboard built by **verrodata** for agency + client use.
> Surfaces whether each client's Adobe Analytics implementation is healthy and flags anomalies before clients notice.

---

## North star

The product's job is to make a client feel — within five seconds of opening it — that **their data is healthy and the agency is watching**. Every design and engineering decision should ladder up to that.

This is **not** a reporting/insight tool. No segment analysis, no campaign performance, no dashboards-of-dashboards. If a feature drifts toward "BI tool," push back.

---

## Audience

Two distinct users share one app:

| Audience | Role | Default view | Interaction |
|---|---|---|---|
| **Agency analyst / admin** | verrodata staff | Diagnostic-first; raw values, drill-paths, ack controls, settings | Read + write (configure checks, ack incidents, manage clients) |
| **Client viewer** | Client-side stakeholder | Reassurance-first; status, plain-language summaries, incident log | Read-only |

Don't build two apps. Build role-aware components driven by `memberships.role` (`agency_admin` | `agency_analyst` | `client_viewer`).

---

## Tech stack (locked)

- **Next.js** (App Router) + TypeScript strict
- **Vercel** for hosting (Cron for scheduled jobs)
- **Supabase** — Postgres, Auth, Realtime, Edge Functions
- **GitHub** for source control
- **Tailwind CSS** (component layer TBD with user — likely shadcn/ui)

**Auth:** No public signup. No marketing/landing routes. Root redirects to `/sign-in` (unauthenticated) or `/` of the app shell (authenticated). Users are provisioned by agency admins via Supabase Admin API.

---

## Tenancy model

`agencies → clients → properties (Adobe report suites)`

A user is a member of one agency, optionally scoped to one client. RLS enforces isolation:
- Every business table has RLS enabled.
- Policies use `auth.user_client_ids()` SECURITY DEFINER helper, never `auth.uid()` directly.
- Service-role writes (ingestion, admin) only from Edge Functions / server actions.

**The single most important invariant: client A must never see client B's data.** If you change schema or policies, simulate each role with `set request.jwt.claims` before merging.

---

## Repository layout (intended)

```
.
├── .claude/
│   └── agents/                    # Specialized sub-agents (see below)
├── app/                           # Next.js App Router
│   ├── (auth)/sign-in/
│   └── (app)/                     # Auth-gated shell
│       ├── page.tsx               # Overview (the five-second-test view)
│       ├── properties/
│       │   └── [propertyId]/      # Property Detail (role-aware)
│       ├── summary/               # "Your summary" — executive view (client-only)
│       ├── anomalies/
│       └── settings/              # Agency-only
├── components/                    # Shared UI (role-aware where needed)
├── lib/
│   ├── supabase/                  # Server + client + admin clients
│   ├── adobe/                     # Adobe Analytics API + Data Feeds adapters
│   └── health/                    # Detection logic, baseline math, severity mapping
├── supabase/
│   ├── migrations/
│   └── functions/                 # Edge Functions (polling, admin ops)
├── docs/                          # FAQ, help, architecture, onboarding
└── CLAUDE.md
```

---

## Specialized agents

Use these via the Agent tool. Each has scoped expertise and a defined response style.

| Agent | When to use |
|---|---|
| `adobe-analytics-expert` | What to monitor, which Adobe data source to use, interpreting AA-specific symptoms |
| `data-health-monitor` | Detection algorithm choice, baseline windows, thresholds, severity mapping |
| `dashboard-ux-architect` | Page structure, info hierarchy, visualization patterns, role-aware components |
| `supabase-platform-engineer` | Schema, RLS, Auth, Edge Functions, Realtime, retention |
| `nextjs-vercel-engineer` | Routing, server vs client components, caching, middleware, Vercel deployment |
| `client-success-strategist` | Copy, what to expose vs hide from clients, FAQ content, retention framing |

**Default behavior:** when a question spans visual + technical + strategic, consult multiple agents in parallel and synthesize, rather than answering solo.

---

## Conventions

- **Server Components by default.** Reach for `"use client"` only for Realtime subscriptions, charts, and interactive controls.
- **No client bundle ever imports `SUPABASE_SERVICE_ROLE_KEY`.** Service-role usage is server-only (Edge Functions, server actions).
- **Idempotent ingestion.** Snapshot writes use `ON CONFLICT (property_id, metric, ts_bucket) DO UPDATE`.
- **Visual restraint.** Default state is neutral. Color = status, not decoration. No pie charts, no animated chart transitions.
- **Status copy is past-tense, agency-voiced.** "We detected…", "We resolved…" — not "Error" or "Failure."

---

## Out of scope (don't drift here)

- Marketing/landing pages
- Public signup
- Cross-client benchmarking
- Adobe Analytics report-building features
- Anomaly *root cause* automation (we surface signals; analysts diagnose)
- Mobile apps (responsive web is enough)

---

## Locked decisions (kickoff consultation, 2026-04-23)

- **Brand:** Independent product (not verrodata-branded, not per-client white-labeled). Single unified product identity.
- **Aesthetic:** Warm cream + charcoal + mustard/amber accent, heavy rounded corners, mixed light+dark card blocks, pill nav, large light-weight display numerals. Inspired by Crextio-style warmth but dialed for trust/observability — no photos of people, no celebratory emoji, no playful gradients. See `docs/design/design-framework.md`.
- **Dark mode:** Required from v1. Co-equal with light mode, both designed deliberately.
- **Voice:** Warm, agency-present past-tense ("We noticed…", "We resolved…").
- **Scheduler:** Supabase `pg_cron` + Edge Functions. Not Vercel Cron (function-duration ceilings).
- **Adobe data sources:** v1 = Analytics 2.0 API (OAuth Server-to-Server, NOT JWT); v1.1 = Data Feeds. Always use newest supported Adobe methods.
- **Component layer:** shadcn/ui primitives + custom domain components (`StatusTile`, `StatusGlyph`, `AnomalyRow`, `PortfolioBanner`, `MetricBandChart`). Tremor rejected (too SaaS-template).

## Remaining open decisions

(none currently — all v1 scope confirmed as of 2026-04-23)

## v1.1 backlog (deferred, not forgotten)

- **Email notifications.** v1 is in-app + Realtime only.
- **Adobe Data Feeds ingestion adapter** — for hit-level distribution audits, exact-duplicate detection, and the Data Feed delivery SLA check.

These should be resolved before first production deploy.
