import "server-only";

import type { Status } from "@/components/status-glyph";
import { anomalyToStatus } from "@/lib/health/status";
import { createClient } from "@/lib/supabase/server";

export type PropertyOverview = {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  status: Status;
  activeAnomalyCount: number;
  primaryMessage: string | null;
  lastCheckedAt: string | null;
  trend: number[];
};

export type OverviewSnapshot = {
  properties: PropertyOverview[];
  totalsByStatus: Record<Status, number>;
  lastCheckRanAt: string | null;
};

/**
 * Loads the per-property data the Overview screen needs.
 * Runs as the calling user — RLS gates which properties are visible.
 */
export async function loadOverviewSnapshot(): Promise<OverviewSnapshot> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("properties")
    .select(
      `
      id,
      name,
      client_id,
      clients ( name ),
      anomalies (
        id, severity, state, started_at,
        checks ( name, kind )
      )
    `,
    )
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    console.error("loadOverviewSnapshot:", error);
    return { properties: [], totalsByStatus: emptyTotals(), lastCheckRanAt: null };
  }

  const properties: PropertyOverview[] = (rows ?? []).map((row) => {
    const activeAnomalies = (row.anomalies ?? []).filter(
      (a: { state: string }) =>
        a.state === "detected" || a.state === "investigating",
    );

    const worst = activeAnomalies.reduce<Status>((worst, a) => {
      const s = anomalyToStatus(a.severity as string);
      return rank(s) < rank(worst) ? s : worst;
    }, "healthy");

    const primary = activeAnomalies[0] as
      | { checks?: { name?: string } | null; severity: string; started_at: string }
      | undefined;

    return {
      id: row.id as string,
      name: row.name as string,
      clientId: row.client_id as string,
      clientName: (row.clients as { name?: string } | null)?.name ?? "",
      status: worst,
      activeAnomalyCount: activeAnomalies.length,
      primaryMessage: primary?.checks?.name
        ? `Unusual ${primary.checks.name.toLowerCase()}`
        : null,
      lastCheckedAt: null, // TODO: pull from checks.last_evaluated_at view
      trend: synthesizeTrendForDemo(row.id as string),
    };
  });

  const totalsByStatus = properties.reduce<Record<Status, number>>(
    (acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    },
    emptyTotals(),
  );

  return {
    properties,
    totalsByStatus,
    lastCheckRanAt: new Date().toISOString(),
  };
}

function emptyTotals(): Record<Status, number> {
  return {
    healthy: 0,
    watch: 0,
    investigating: 0,
    degraded: 0,
    critical: 0,
    unknown: 0,
    "cold-start": 0,
  };
}

function rank(s: Status): number {
  const ranks: Record<Status, number> = {
    critical: 0,
    degraded: 1,
    investigating: 2,
    watch: 3,
    unknown: 4,
    "cold-start": 5,
    healthy: 6,
  };
  return ranks[s];
}

// Until ingestion is wired to Adobe, sparklines are synthesized from a
// deterministic per-property seed so reloads don't reshuffle the curves.
// Replace with real metric_snapshots reads once the ingestion path exists.
function synthesizeTrendForDemo(seed: string): number[] {
  const points = 24;
  const seedNum = [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rng = (i: number) => {
    const x = Math.sin(seedNum + i * 17) * 10000;
    return x - Math.floor(x);
  };
  const values: number[] = [];
  let v = 50 + rng(0) * 30;
  for (let i = 0; i < points; i++) {
    v += (rng(i) - 0.5) * 6;
    values.push(Math.max(20, Math.min(95, v)));
  }
  return values;
}
