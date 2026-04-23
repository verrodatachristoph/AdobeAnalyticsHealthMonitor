// Anomalies log — agency triage surface + client incident history.
// Spec: docs/features/anomalies-log.md
//
// The only screen in the app with a left sidebar (FilterRail).

export default function AnomaliesPage() {
  return (
    <section className="space-y-8">
      <header className="flex items-baseline justify-between pt-12">
        <h1 className="text-4xl font-light tracking-tight">
          {/* TODO: "Anomalies" (agency) / "Incident history" (client) */}
          Anomalies
        </h1>
        {/* TODO: agency KPINumber trio — Active now / Acknowledged today / Resolved this period */}
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* TODO: FilterRail (3 cols, agency) — sticky sidebar */}
        <aside className="hidden lg:col-span-3 lg:block" />

        <div className="lg:col-span-9">
          {/* TODO: AnomalyHeatmap (agency only, hidden when filter = single property) */}
          {/* TODO: Active filter summary line */}
          {/* TODO: NewAnomaliesPill (Realtime) */}
          {/* TODO: chronological stream of AnomalyRow items, grouped by day */}
        </div>
      </div>

      {/* TODO: BulkActionBar (sticky bottom, selection mode only) */}
    </section>
  );
}
