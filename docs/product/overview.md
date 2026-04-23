# Product overview

**Product name:** Adobe Analytics Health Monitor

## What this is

A health and observability dashboard for Adobe Analytics implementations. It continuously checks each client's Adobe report suites for signs that data collection is broken, drifting, or anomalous — and surfaces those findings in a calm, glanceable interface designed to be shared with the client.

## What problem it solves

Adobe Analytics implementations break silently. A developer renames a data layer key, a tag manager container is removed, a marketing channel rule is misconfigured — and tracking quietly degrades for days or weeks before anyone notices. By the time a client asks "why does our dashboard look weird?", the agency is already on the back foot.

This product flips that dynamic: the agency sees the problem first, and can either fix it before the client notices or proactively surface it ("we detected and resolved X for you"). The dashboard becomes both a diagnostic tool for the agency and a credibility artifact for the client.

## Who it's for

- **verrodata internal staff** (analysts, account leads) — for monitoring and diagnostic work.
- **verrodata's clients** — for ongoing reassurance and as a shared incident log.

It is **not** for end consumers, prospects, or the public. There is no sign-up flow, no marketing site.

## What it is not

- Not a reporting or insight tool. It does not replace Adobe Workspace or any BI surface.
- Not a tag-debugging tool. It detects symptoms, not root causes.
- Not a multi-vendor analytics monitor. Adobe Analytics is the single supported source (CJA later, perhaps).
- Not white-label SaaS. It is an agency-owned product used with agency-served clients.

## The trust premise

Every client interaction with the dashboard should reinforce one of three messages:
1. **"Your data is healthy."** (Most common state. Make this beautiful, not boring.)
2. **"We caught something before you noticed."** (The killer moment.)
3. **"Here's what we did about it."** (Closes the loop.)

A feature that doesn't ladder up to one of these doesn't belong in the client-facing surface.
