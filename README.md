# Adobe Analytics Health Monitor

Internal observability dashboard built by **verrodata** for agency + client use.

> **Working principles, audiences, scope guardrails, and tech locks** live in [CLAUDE.md](./CLAUDE.md).
>
> **Product, technical, and design docs** live in [docs/](./docs/).
>
> **Specialized sub-agents** for collaboration live in [.claude/agents/](./.claude/agents/).

---

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Adobe credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — unauthenticated requests redirect to `/sign-in`.

## Stack

- **Next.js 15** (App Router) + TypeScript strict + React 19
- **Tailwind CSS v4** (CSS-first config; tokens in [app/globals.css](./app/globals.css))
- **Supabase** — Postgres + Auth + Realtime + Edge Functions (`@supabase/ssr` for SSR-safe auth)
- **Vercel** for hosting; **Supabase pg_cron** for scheduled Adobe polling
- **shadcn/ui** primitives + custom domain components — see [docs/design/design-framework.md](./docs/design/design-framework.md)

## Repository layout

```
.
├── .claude/agents/        # Specialized sub-agents
├── app/                   # Next.js App Router
│   ├── (auth)/sign-in/    # Only public route
│   └── (app)/             # Auth-gated shell
├── components/            # Shared UI
├── lib/
│   ├── supabase/          # Server, client, middleware Supabase clients
│   └── auth/              # Role-gating helpers
├── supabase/              # Migrations + Edge Functions
├── docs/                  # Product, technical, design, FAQ
├── CLAUDE.md              # Project north star + conventions
└── README.md              # This file
```

## Conventions

- **Server Components by default.** `"use client"` only for Realtime subscriptions, charts, and interactive controls.
- **Service-role key is server-only.** Never imported into client bundles.
- **Status copy is past-tense, agency-voiced** ("We detected…", "We resolved…").
- **Status is multi-encoded** — color, glyph, density, border. Never lean on color alone.

For deeper rules, see [CLAUDE.md](./CLAUDE.md).
