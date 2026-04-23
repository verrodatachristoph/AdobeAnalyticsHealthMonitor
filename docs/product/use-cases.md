# Core use cases

## UC-1: Daily reassurance check (client)

**Trigger:** Client opens the dashboard link bookmarked from an email.

**Flow:**
1. Land directly on Overview (no auth screen if session is valid; magic-link otherwise).
2. See `Healthy · updated 4 min ago` plus a one-line summary across all their properties.
3. Close the tab. Total time on page: ~10 seconds.

**Success:** They never opened a chart, never read an explanation, never had a question.

## UC-2: Caught-it-first incident (agency-led)

**Trigger:** Detection layer flags an anomaly on a client property at 09:42 UTC.

**Flow:**
1. Agency analyst sees the anomaly on Overview within 1 minute (Realtime push).
2. Drills into the property → sees the metric vs baseline, corroborating signals, and a "what could cause this" panel.
3. Diagnoses (e.g., Launch deploy at 09:30 broke a rule), acknowledges with a note.
4. Coordinates fix with client engineering.
5. Marks resolved when metric returns to baseline.
6. Client opens dashboard later that day → sees the incident in their timeline as `[Agency] resolved · 2h 14m duration` with the agency's note rendered as a plain-language summary.

**Success:** Client never had to chase the agency. The incident becomes evidence of value, not a complaint.

## UC-3: New client onboarding (agency admin)

**Trigger:** New client signed; agency wants the dashboard live before the kickoff call.

**Flow:**
1. Admin opens Settings → Clients → "Add client."
2. Adds client name + Adobe Analytics report suites + relevant credentials (stored encrypted via Vault).
3. Selects the default check pack (recommended for the client's vertical).
4. System backfills 28 days of baseline data in the background.
5. Admin invites the client's primary stakeholder via email (magic link).
6. Client clicks the link days later, lands on a populated Overview that has been monitoring for a week.

**Success:** Client never sees an empty state, setup wizard, or "Welcome to [Product]" modal. The dashboard feels like it has always been there.

## UC-4: Threshold tuning (agency analyst)

**Trigger:** A client's Tuesday morning consistently triggers a `Watch` warning because their B2B traffic pattern is unusual.

**Flow:**
1. Analyst opens the noisy check from the Anomalies log.
2. Sees the historical pattern overlaid; recognizes Tuesday-morning baseline is wrong.
3. Adjusts the day-of-week baseline window or whitelists a recurring annotation.
4. Change applies forward; doesn't retroactively affect history.

**Success:** False positive rate drops; client never saw the noisy warnings in the first place (these were agency-only `Watch` states).

## UC-5: Quarterly business review (account director)

**Trigger:** QBR with client; need a credible "what we did for you" artifact.

**Flow:**
1. Director opens the dashboard, switches to QBR/export view.
2. Selects date range (last quarter); generates a branded PDF/email summary.
3. Output: anomalies caught (count + severity), incidents resolved, MTTR, time saved, plus a clean health-over-time chart.

**Success:** The dashboard *is* the QBR slide. Renewal conversation has a built-in artifact of value.
