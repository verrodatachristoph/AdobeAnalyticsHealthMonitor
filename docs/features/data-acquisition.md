# Data acquisition

> v1 source: **Adobe Analytics 2.0 API only** (OAuth Server-to-Server, NOT JWT). Data Feeds added in v1.1.
> Always use newest supported Adobe methods — when Adobe deprecates an endpoint or auth grant, plan a migration rather than carrying legacy code.

## Credential model

**One IMS integration per Adobe org**, owned by the client (not by verrodata).

The client creates an Adobe IMS project inside their own Adobe org and grants verrodata's integration the appropriate "Adobe Analytics" product profile permissions. This keeps the client in control of revocation and avoids the cross-org access problem (Adobe does not support cross-org via OAuth Server-to-Server cleanly).

If a single client has multiple Adobe orgs (rare in enterprise reseller arrangements), each org needs its own IMS integration record on our side.

### Per-integration credential set

Stored on an `integrations` table, with secrets in Supabase Vault:

| Field | Storage | Notes |
|---|---|---|
| `client_id` | Plain column | Public identifier, safe |
| `client_secret` | **Vault** | Sensitive |
| `organization_id` | Plain column | Format: `XXXXX@AdobeOrg` |
| `technical_account_id` | Plain column | Service account email |
| `global_company_id` | Plain column | Resolved once at setup, used in all API URLs |
| `access_token` | **Vault** | Refreshed every 23h via pg_cron |
| `access_token_expires_at` | Plain column | Drives the refresh schedule |

## Auth flow (OAuth Server-to-Server)

**Token endpoint:** `POST https://ims-na1.adobelogin.com/ims/token/v3`

Payload:
```
grant_type=client_credentials
client_id={client_id}
client_secret={client_secret}
scope=openid,AdobeID,read_organizations,additional_info.projectedProductContext,read_pc.dma_tartan
```

> The Analytics API scope was renamed from `read_pc.aa_api` to `read_pc.dma_tartan` in 2024. Use the current name.

Access tokens last 24 hours. Refresh every 23h via a pg_cron job per integration. Never cache tokens in Edge Function memory across invocations — Vault is the source of truth.

**globalCompanyId resolution (one-time at setup):**
`GET https://analytics.adobe.io/discovery/me` with the bearer token → returns `globalCompanyId`. Store it; it does not change.

All Analytics API calls go to:
`https://analytics.adobe.io/api/{globalCompanyId}/...`

## Endpoint inventory

| Endpoint | Used for | Cadence | Notes |
|---|---|---|---|
| `GET /collections/suites` | Enumerate report suites | Once at onboarding, weekly thereafter | Detects suite additions/removals |
| `GET /users/me` | Confirm credential validity | Each token refresh | Treats credential health as its own check |
| `POST /reports` | Primary metric pulls | Per check schedule (15 min – 4 h) | Workhorse. Rate limit: 12 req/min per `globalCompanyId`. Daily row cap 50k per response — page with `limit`/`page`. |
| `GET /reports/realtime` | "Is data arriving right now" pulse | Optional, opportunistic | Limited metric set; not all suites have it enabled. Don't make checks depend on it. |

### Example `POST /reports` payload (hourly hit volume, trailing 2 days)

```json
{
  "rsid": "myreportsuite",
  "globalFilters": [
    {
      "type": "dateRange",
      "dateRange": "2026-04-21T00:00:00/2026-04-22T23:59:59"
    }
  ],
  "metricContainer": {
    "metrics": [
      { "id": "metrics/occurrences" },
      { "id": "metrics/visits" },
      { "id": "metrics/visitors" }
    ]
  },
  "dimension": "variables/daterangehour",
  "settings": { "granularity": "hour", "limit": 50 }
}
```

For eVar/prop population checks, add a `dimension` (e.g., `variables/evar5`) and pull top values; a top value of `"Unspecified"` or empty string at 95%+ indicates the variable broke.

## Rate-limit handling

- Respect `Retry-After` on 429.
- Exponential backoff with jitter on 5xx.
- Per-`globalCompanyId` concurrency cap (Adobe enforces at org level, not per-suite).
- Circuit breaker: after N consecutive failures for a property, flag the freshness check as `Unknown` and slow polling.

## Adapter design

Isolate all Adobe auth in `lib/adobe/auth.ts`, exporting one function:

```ts
getAccessToken(integrationId: string): Promise<string>
```

Calling code (Edge Functions, health checks) never constructs tokens. When Adobe changes IMS endpoints or grant types — as they did when JWT was deprecated — the change is contained to this one module.

Version IMS endpoint URLs as named constants, not inline strings.
