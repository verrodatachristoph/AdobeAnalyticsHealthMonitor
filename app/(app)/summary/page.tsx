import { getSessionWithRole, isAgencyRole } from "@/lib/auth/require-role";
import { notFound } from "next/navigation";

// "Your summary" — executive view for C-level stakeholders.
// Spec: docs/features/executive-summary.md
//
// Storytelling-first, no technical surface. CLIENT-ONLY route by default.
// Agency analysts access via an Executive preview affordance on the client
// detail page, which injects `isAgencyPreview: true` through a different entry.

export default async function SummaryPage() {
  const session = await getSessionWithRole();

  // Agency-role users hitting /summary directly get a 404 — they must use
  // the Executive preview flow, not impersonate the client session.
  if (!session || isAgencyRole(session.role)) {
    notFound();
  }

  return (
    <section className="space-y-16 pt-8">
      {/* Zone A — Header verdict (full-width, no card chrome) */}
      <header>
        <h1 className="text-5xl font-light tracking-tight">
          {/* TODO: healthy vs notable-incident variant copy from messages.ts */}
          A quiet month for your data.
        </h1>
        <p className="mt-3 font-mono text-sm text-secondary">
          {/* TODO: {period} · Last updated {generated_at} */}
        </p>
      </header>

      {/* TODO: Zone B — Hero number set on bg-card-contrast band */}
      {/* TODO: Zone C — Incident narratives (ResolvedCard stack) */}
      {/* TODO: Zone D — What we're watching (bg-card-soft reassurance) */}
      {/* TODO: ExecutivePeriodNav — three-pill segmented control */}
      {/* TODO: Zone E — ExportBar with server-action PDF generator */}
    </section>
  );
}
