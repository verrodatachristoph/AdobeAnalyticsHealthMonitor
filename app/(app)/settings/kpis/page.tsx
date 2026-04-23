// Settings → Custom KPIs.
// Spec: docs/features/settings-custom-kpis.md
//
// Scope is always a single property at a time. Scope control bar at top;
// Add KPI opens a right-anchored 560px Sheet with 5 sequenced sections.

export default function CustomKPIsPage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-4xl font-light tracking-tight">Custom KPIs</h1>
      </header>

      {/* TODO: Scope control bar — property Select + Add KPI button + needs-review chip */}
      {/* TODO: Inline "Needs your attention" section when review items exist */}
      {/* TODO: KPI list — KPIRow components with cold-start / muted / stale variants */}
      {/* TODO: First-time empty state per spec §6 */}
      {/* TODO: KPI editor Sheet (Add/Edit) — 5 sections: Identity, Source, Detection,
          Visibility & Priority, Mute (existing only). */}
    </section>
  );
}
