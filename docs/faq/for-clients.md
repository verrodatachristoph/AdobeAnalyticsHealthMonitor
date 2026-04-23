# FAQ — for clients

> Plain-language answers for client stakeholders. These chunks are designed to be retrievable individually by a future help/chatbot interface.

## What does "healthy" actually mean?

It means every check we're running on your Adobe Analytics implementation came back inside its expected range, and your data is arriving on schedule. We compare each metric to its own recent history (typically the last 28 days, matched by day of the week) and flag anything outside its normal range.

## What happens if something breaks — do I need to do anything?

No. Your account team is alerted the moment a check goes outside its expected range. They diagnose the issue, coordinate any fix on our side or with your engineering team, and update this dashboard so you can see what happened and when it was resolved. You'll see a "We're investigating" or "We resolved" message in your timeline.

## Why are the numbers different from my Adobe Analytics workspace?

This dashboard is not a reporting tool — it's a health monitor. The numbers you see here are sampled or summarized to detect anomalies, not to match the precise figures in your reports. If you need exact reporting numbers, those come from Adobe Analytics directly. If a number looks meaningfully different, mention it to your account team — sometimes a discrepancy itself is a signal worth investigating.

## Who can see this dashboard?

Only people we've explicitly invited from your team. There is no public sign-up, and we use a secure email-link sign-in. Each client's data is fully isolated from every other client's — your team only ever sees your data.

## What's being monitored?

We monitor a default set of checks for every client, including hit volume, conversion event volume, page name quality, marketing channel attribution, eVar/prop population, bot traffic, and data freshness. The full list is visible in your dashboard under the property's check page. We tune the specific checks and thresholds for each client based on traffic patterns.

## How quickly will you notice if something breaks?

For most checks, within 15 to 60 minutes of the issue starting. Some slower checks (like distribution drift) run every few hours. We publish the actual time-to-detect on every resolved incident so you can see our response times.

## Can I export this for my team?

Quarterly summaries are available as a one-page PDF — your account team can generate one on request. We're working on self-serve exports for v1.1.

## Is this the same as Adobe's own monitoring?

No. Adobe provides some intelligence alerts inside Workspace, but they're tuned for end-user analysts, not for ongoing implementation health. This dashboard is a continuous, agency-managed monitor specifically watching for the things that break Adobe implementations in the wild.

## What if Adobe itself has an outage?

We detect that as a data freshness anomaly and surface it as an Adobe-side issue, not a tracking issue on your site. You won't get false alarms when the problem is upstream of you.

## How do I know this dashboard itself isn't broken?

Every page shows when data was last updated. If our system can't reach Adobe or our database, a banner appears at the top — we never silently show stale data as if it's current.
