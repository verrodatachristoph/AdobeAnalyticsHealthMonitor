import { AnomalyRow } from "@/components/anomaly-row";
import { KPINumber } from "@/components/kpi-number";
import { getSessionWithRole, isAgencyRole } from "@/lib/auth/require-role";
import { loadAnomalies } from "@/lib/queries/anomalies";
import { format, isToday, isYesterday } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AnomaliesPage() {
  const session = await getSessionWithRole();
  const role = session && isAgencyRole(session.role) ? "agency" : "client";

  const anomalies = await loadAnomalies({ limit: 100 });

  const activeNow = anomalies.filter(
    (a) => a.state === "detected" || a.state === "investigating",
  ).length;
  const resolvedThisPeriod = anomalies.filter((a) => a.state === "resolved")
    .length;
  const acknowledgedToday = anomalies.filter(
    (a) => a.ackNote && new Date(a.startedAt) > new Date(Date.now() - 86_400_000),
  ).length;

  // Group by day separator
  const groups = groupByDay(anomalies);

  return (
    <section className="space-y-10 pt-12">
      <header className="flex flex-wrap items-baseline justify-between gap-6">
        <div>
          <h1 className="text-4xl font-light tracking-tight">
            {role === "agency" ? "Anomalies" : "Incident history"}
          </h1>
          <p className="mt-2 text-sm text-secondary">
            {role === "agency"
              ? "Triage queue across every property in your scope."
              : "Here is what we have detected and resolved across your properties."}
          </p>
        </div>
        {role === "agency" && (
          <div className="flex gap-8">
            <KPINumber
              caption="Active now"
              value={activeNow}
              size="md"
              tone={activeNow > 0 ? "watch" : "default"}
            />
            <KPINumber
              caption="Acknowledged today"
              value={acknowledgedToday}
              size="md"
              tone="muted"
            />
            <KPINumber
              caption="Resolved this period"
              value={resolvedThisPeriod}
              size="md"
              tone="muted"
            />
          </div>
        )}
      </header>

      {anomalies.length === 0 ? (
        <EmptyState role={role} />
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-secondary">
                {group.label}
              </h2>
              <div className="space-y-2">
                {group.rows.map((row) => (
                  <AnomalyRow key={row.id} anomaly={row} role={role} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

function groupByDay(rows: Awaited<ReturnType<typeof loadAnomalies>>) {
  const map = new Map<string, typeof rows>();
  for (const row of rows) {
    const date = new Date(row.startedAt);
    const label = isToday(date)
      ? "Today"
      : isYesterday(date)
        ? "Yesterday"
        : format(date, "EEE d MMM");
    const existing = map.get(label);
    if (existing) {
      existing.push(row);
    } else {
      map.set(label, [row]);
    }
  }
  return Array.from(map.entries()).map(([label, rows]) => ({ label, rows }));
}

function EmptyState({ role }: { role: "agency" | "client" }) {
  return (
    <div className="rounded-2xl bg-card-soft p-12">
      <h2 className="text-2xl font-light tracking-tight">
        {role === "agency"
          ? "No anomalies in this view."
          : "No incidents in the last period."}
      </h2>
      <p className="mt-3 text-base text-secondary">
        {role === "agency"
          ? "Adjust filters or check back as new anomalies arrive."
          : "We have been watching your Adobe Analytics data around the clock and everything has been on track. We will log any future incidents here so you have a full record."}
      </p>
    </div>
  );
}
