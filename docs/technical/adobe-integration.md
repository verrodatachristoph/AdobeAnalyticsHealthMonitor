# Adobe Analytics integration

> Status: **partially decided.** Source mix is open (see CLAUDE.md "Open decisions"). This doc captures what we know and the trade-offs.

## Available data egress paths

| Source | Latency | Throughput | Cost | Best for |
|---|---|---|---|---|
| **Analytics 2.0 API** | ~minutes | Rate-limited | API quota | "Is data flowing?" + sampled metrics |
| **Data Warehouse** | hours | High (batch) | Adobe-side | Backfills, ad-hoc deep dives |
| **Data Feeds** | ~hourly | Hit-level raw | S3/SFTP storage | Definitive truth, distribution checks |
| **Customer Journey Analytics** | varies | AEP datasets | AEP entitlement | Future, if client is on CJA |

**Recommendation for v1:** Analytics 2.0 API as the primary source — covers volume, freshness, and most ratio checks at acceptable latency. Add Data Feeds in v1.1 for clients that need distribution-level diagnostics (e.g., page-name nullness audits at scale).

## Auth model

Adobe Analytics API uses Adobe IMS (OAuth 2 server-to-server JWT, transitioning to OAuth Service Account credentials).
- Per-property credential set: client ID, client secret, technical account ID, organization ID, private key.
- Stored encrypted in Supabase (Vault or `pgsodium` on a `credentials` table). Never in env vars or repo.
- Token refresh handled in the ingestion adapter; cached per-property with TTL aligned to Adobe's expiry.

## Polling cadence

| Check type | Cadence |
|---|---|
| Hit volume, freshness | Every 15 min |
| Conversion events | Hourly |
| Marketing channel mix, eVar populations | Hourly |
| Distribution drift (PSI) | Every 6 hours |
| Backfill (new property) | Burst on first add, then settle into normal cadence |

`next_poll_at` lives on `checks` (or a derived schedule table) so the scheduler picks only due work, not everything per tick.

## Rate-limit handling

- Respect `Retry-After` header on 429.
- Exponential backoff with jitter on 5xx.
- Per-org concurrency cap (Adobe limits per-org, not per-API-key).
- Circuit breaker: if N consecutive failures for a property, mark its data freshness check as `Degraded` and slow polling.

## Failure modes (ingestion side, distinct from Adobe-side)

- IMS token expired / revoked → `Critical` data freshness for affected property
- Report suite ID changed without us being told → `Critical`, surface as "credentials no longer valid"
- Adobe API outage → `Watch` on freshness across affected properties (don't escalate; not the client's problem to fix)
- Vercel Cron missed a tick → next run picks up dropped work via `next_poll_at`

## What we do NOT do

- We do not write back to Adobe (no segment creation, no calculated metric pushes, no annotations sync).
- We do not surface raw Adobe API errors to clients.
- We do not retry forever. After ~1h of failures for a property, we surface a credentials-likely-broken message to the agency.
