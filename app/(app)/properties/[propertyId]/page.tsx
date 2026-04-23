import { HealthChecksCard } from "@/components/health-checks-card";
import { IncidentBanner } from "@/components/incident-banner";
import { ResolvedCard } from "@/components/resolved-card";
import { StatusGlyph } from "@/components/status-glyph";
import { getSessionWithRole, isAgencyRole } from "@/lib/auth/require-role";
import { STATUS_LABEL } from "@/lib/health/status";
import { loadPropertyDetail } from "@/lib/queries/property-detail";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ propertyId: string }>;
};

export default async function PropertyDetailPage({ params }: Props) {
  const { propertyId } = await params;
  const session = await getSessionWithRole();
  const role = session && isAgencyRole(session.role) ? "agency" : "client";

  const detail = await loadPropertyDetail(propertyId);
  if (!detail) notFound();

  return (
    <section className="space-y-10 pt-12">
      <header className="space-y-3">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wide text-secondary hover:text-primary"
        >
          ← {detail.clientName}
        </Link>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-4xl font-light tracking-tight text-primary md:text-5xl">
            {detail.name}
          </h1>
          {role === "agency" && (
            <span className="font-mono text-xs text-secondary">
              {detail.reportSuiteId}
            </span>
          )}
        </div>
        <StatusBadge status={detail.status} startedAt={detail.activeAnomaly?.startedAt} />
        <p className="max-w-2xl text-base text-primary">
          {role === "client"
            ? clientVerdict(detail)
            : agencyVerdict(detail)}
        </p>
      </header>

      {detail.activeAnomaly && (
        <IncidentBanner anomaly={detail.activeAnomaly} role={role} />
      )}

      {!detail.activeAnomaly && detail.recentlyResolved && (
        <ResolvedCard anomaly={detail.recentlyResolved} role={role} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HealthChecksCard detectors={detail.detectors} role={role} />
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-card-soft p-6">
            <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-secondary">
              At a glance
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Status" value={STATUS_LABEL[detail.status]} />
              <Row label="Required checks" value={`${detail.detectors.filter((d) => d.status === "healthy").length} of 5 passing`} />
              <Row label="Custom KPIs" value={String(detail.customKPICount)} />
            </dl>
          </section>

          {role === "agency" && (
            <section className="rounded-2xl bg-card-contrast p-6 text-on-contrast">
              <h3 className="text-xs font-medium uppercase tracking-[0.12em] opacity-60">
                Quick actions
              </h3>
              <p className="mt-3 text-sm opacity-80">
                Acknowledge, mute, and annotate flows live in the Anomalies log
                drawer. Settings → Custom KPIs lets you add KPIs scoped to this
                property.
              </p>
            </section>
          )}
        </aside>
      </div>
    </section>
  );
}

function StatusBadge({
  status,
  startedAt,
}: {
  status: ReturnType<typeof STATUS_LABEL extends Record<infer K, unknown> ? () => K : never> | string;
  startedAt?: string;
}) {
  const sinceLabel = startedAt
    ? `since ${format(new Date(startedAt), "HH:mm 'UTC'")}`
    : null;
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-card-soft px-3 py-1 text-sm">
      <StatusGlyph
        status={status as Parameters<typeof StatusGlyph>[0]["status"]}
        size="sm"
      />
      <span className="text-primary">
        {STATUS_LABEL[status as keyof typeof STATUS_LABEL] ?? status}
      </span>
      {sinceLabel && (
        <span className="font-mono text-xs text-secondary">{sinceLabel}</span>
      )}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-secondary">{label}</dt>
      <dd className="font-medium text-primary">{value}</dd>
    </div>
  );
}

type Detail = NonNullable<Awaited<ReturnType<typeof loadPropertyDetail>>>;

function clientVerdict(detail: Detail): string {
  if (detail.activeAnomaly) {
    return "We're investigating an issue and will update you here as we learn more.";
  }
  if (detail.recentlyResolved) {
    return "We resolved a recent issue. Your data is accurate and up to date.";
  }
  return "Everything looks good. We're watching your data around the clock.";
}

function agencyVerdict(detail: Detail): string {
  const passing = detail.detectors.filter((d) => d.status === "healthy").length;
  const total = detail.detectors.length;
  return `${passing} of ${total} required checks passing · ${detail.customKPICount} custom ${detail.customKPICount === 1 ? "KPI" : "KPIs"} configured.`;
}
