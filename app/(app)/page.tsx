import { KPINumber } from "@/components/kpi-number";
import {
  PortfolioBanner,
  type PortfolioBannerVariant,
} from "@/components/portfolio-banner";
import { RecentActivityRail } from "@/components/recent-activity-rail";
import { StatusTile } from "@/components/status-tile";
import { getSessionWithRole, isAgencyRole } from "@/lib/auth/require-role";
import { STATUS_LABEL } from "@/lib/health/status";
import { loadOverviewSnapshot, type PropertyOverview } from "@/lib/queries/overview";
import { loadRecentActivity } from "@/lib/queries/recent-activity";
import { formatDistanceToNow } from "date-fns";
import type { Route } from "next";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const session = await getSessionWithRole();
  const isAgency = session ? isAgencyRole(session.role) : false;

  const [snapshot, activity] = await Promise.all([
    loadOverviewSnapshot(),
    loadRecentActivity(),
  ]);

  const totals = snapshot.totalsByStatus;
  const activeIssueCount =
    totals.critical +
    totals.degraded +
    totals.investigating +
    totals.watch;
  const propertyCount = snapshot.properties.length;
  const healthyCount = totals.healthy;
  const lastCheck = snapshot.lastCheckRanAt
    ? formatDistanceToNow(new Date(snapshot.lastCheckRanAt), {
        addSuffix: true,
      })
    : null;

  const bannerVariant: PortfolioBannerVariant =
    activeIssueCount === 0
      ? "all-healthy"
      : activeIssueCount === 1
        ? "issues-one"
        : "issues-many";

  const bannerVerdict =
    activeIssueCount === 0
      ? "Everything looks good."
      : activeIssueCount === 1
        ? "We're keeping an eye on one property."
        : `We're investigating ${activeIssueCount} properties.`;

  // Group properties by client (agency view)
  const grouped = groupByClient(snapshot.properties);

  return (
    <section className="space-y-12 pt-12">
      <PortfolioBanner
        variant={bannerVariant}
        verdict={bannerVerdict}
        subline={renderSubline(activeIssueCount, lastCheck, propertyCount)}
        glyphStatus={
          activeIssueCount > 0
            ? totals.critical > 0
              ? "critical"
              : totals.degraded > 0
                ? "degraded"
                : "investigating"
            : undefined
        }
      />

      {isAgency && propertyCount > 0 && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <KPINumber
            caption="Properties healthy"
            value={healthyCount}
            qualifier={`of ${propertyCount} monitored`}
          />
          <KPINumber
            caption="Active issues"
            value={activeIssueCount}
            qualifier={
              activeIssueCount > 0
                ? `${totals.watch} watch · ${totals.investigating + totals.degraded + totals.critical} investigating`
                : "all clear"
            }
            tone={activeIssueCount > 0 ? "watch" : "default"}
          />
          <KPINumber
            caption="Last check ran"
            value={lastCheck ?? "—"}
            qualifier="all schedulers healthy"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-8">
          {grouped.length === 0 ? (
            <EmptyState />
          ) : (
            grouped.map((group) => (
              <section key={group.clientId} aria-labelledby={`group-${group.clientId}`}>
                {isAgency && (
                  <header className="mb-4 flex items-baseline justify-between border-b border-hairline pb-2">
                    <h2
                      id={`group-${group.clientId}`}
                      className="text-xs font-medium uppercase tracking-[0.12em] text-secondary"
                    >
                      {group.clientName}
                    </h2>
                    <span className="text-xs text-secondary">
                      {group.properties.length}{" "}
                      {group.properties.length === 1 ? "property" : "properties"}
                    </span>
                  </header>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {group.properties.map((p) => (
                    <StatusTile
                      key={p.id}
                      href={`/properties/${p.id}` as Route}
                      propertyName={p.name}
                      clientName={isAgency ? undefined : p.clientName}
                      status={p.status}
                      statusLabel={STATUS_LABEL[p.status]}
                      metadata={metadataForTile(p)}
                      trend={p.trend}
                      hasActiveIssue={p.activeAnomalyCount > 0}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <RecentActivityRail entries={activity} className="lg:col-span-4" />
      </div>
    </section>
  );
}

function renderSubline(
  activeCount: number,
  lastCheck: string | null,
  propertyCount: number,
) {
  if (activeCount === 0) {
    return (
      <>
        We&rsquo;re watching your Adobe Analytics around the clock — last check
        ran <span className="font-mono">{lastCheck ?? "moments ago"}</span>.
      </>
    );
  }
  return (
    <>
      Our team is looking into {activeCount}{" "}
      {activeCount === 1 ? "issue" : "issues"} across {propertyCount}{" "}
      monitored {propertyCount === 1 ? "property" : "properties"}. We&rsquo;ll
      update this view as we learn more.
    </>
  );
}

function metadataForTile(p: PropertyOverview): string[] {
  const lines: string[] = [];
  if (p.activeAnomalyCount > 0) {
    if (p.primaryMessage) lines.push(p.primaryMessage);
    if (p.activeAnomalyCount > 1) {
      lines.push(`${p.activeAnomalyCount} active checks`);
    }
  }
  lines.push("checked moments ago");
  return lines;
}

type ClientGroup = {
  clientId: string;
  clientName: string;
  properties: PropertyOverview[];
};

function groupByClient(properties: PropertyOverview[]): ClientGroup[] {
  const map = new Map<string, ClientGroup>();
  for (const p of properties) {
    const existing = map.get(p.clientId);
    if (existing) {
      existing.properties.push(p);
    } else {
      map.set(p.clientId, {
        clientId: p.clientId,
        clientName: p.clientName,
        properties: [p],
      });
    }
  }
  // Sort: critical clients first within group; alphabetical between groups
  const groups = Array.from(map.values());
  for (const g of groups) {
    g.properties.sort((a, b) => a.name.localeCompare(b.name));
  }
  groups.sort((a, b) => a.clientName.localeCompare(b.clientName));
  return groups;
}

function EmptyState() {
  return (
    <div className="rounded-lg bg-card-soft p-12 text-center">
      <h2 className="text-2xl font-light tracking-tight">No properties yet</h2>
      <p className="mt-3 text-sm text-secondary">
        Add your first client to start monitoring Adobe Analytics properties.
      </p>
    </div>
  );
}
