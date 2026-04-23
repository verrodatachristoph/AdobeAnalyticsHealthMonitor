# FAQ — Adobe Analytics specifics

> Reference answers about Adobe Analytics behavior that affect what we monitor and how. Useful for both agency staff and curious clients.

## Why might hit volume drop without anything actually breaking?

Several normal causes:
- Day-of-week / holiday patterns (we adjust for these automatically).
- Bot-filtering rule changes on Adobe's side (occasionally retroactive).
- Marketing pause (a paused paid channel reduces inbound traffic).
- Site downtime (a tracking-side check would be wrong here — the issue is upstream).

We require a corroborating signal (e.g., eVar population also drops) before escalating a hit-volume drop to `Critical`.

## Why would page names suddenly become "unknown" or "D=g"?

This usually means the page-name eVar/prop logic in Launch (or AppMeasurement) was broken — often by a developer renaming a data layer key. The data still arrives, but the page-name field is null or falls back to the URL path. We track the rate of nulls/fallbacks as its own check.

## What's an eVar, and why do we monitor populations?

An eVar (conversion variable) is an Adobe Analytics dimension used to track values that persist across pages or sessions. Common uses: campaign IDs, internal search terms, login states. Each implementation defines what each eVar means. If a critical eVar suddenly stops being populated, downstream reports and segments break — even though the rest of the data looks fine.

## What's the difference between Analytics 2.0 API and Data Feeds?

- **Analytics 2.0 API:** queryable HTTP endpoints, near-real-time, rate-limited. Good for "is data flowing and what does today look like."
- **Data Feeds:** raw hit-level data delivered to S3 or SFTP, typically hourly. Definitive truth but more storage/processing required. Good for distribution-level checks (e.g., what percentage of hits had each page name).

We default to API in v1; Data Feeds are a v1.1 add for clients who need deeper diagnostics.

## What's a virtual report suite?

A virtual report suite is a filtered view on top of a base report suite. We monitor the base suites unless the client specifies a virtual suite as their canonical reporting view. (Configurable per property.)

## Why does Adobe sometimes show different numbers than the day before for the same date?

A few reasons:
- Late-arriving hits (mobile SDKs queue offline, sync later).
- Bot-filter recalculation.
- Processing-rule changes.
- VISTA rule changes that retroactively affect prior data.

Our checks tolerate small recalculation jitter; only sustained, large drifts trigger alerts.

## What about Customer Journey Analytics (CJA)?

CJA uses Adobe Experience Platform datasets, not classic Analytics report suites. We don't support CJA in v1. If a client moves to CJA, we'll need a different ingestion adapter against AEP datasets.

## What's the typical processing latency for Adobe?

For most report suites, recent data is available in Workspace within ~30–90 minutes. Hourly data via API has similar latency. Data Feeds typically deliver each hour's data within 1–2 hours. We bake these expectations into our freshness checks.
