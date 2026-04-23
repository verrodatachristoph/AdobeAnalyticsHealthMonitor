import "server-only";

import type { Status } from "@/components/status-glyph";
import { anomalyToStatus, pickWorstStatus } from "@/lib/health/status";
import { createClient } from "@/lib/supabase/server";

export type DetectorRow = {
  id: string;
  kind: string;
  name: string;
  status: Status;
  lastEvaluatedAt: string | null;
};

export type ActiveAnomaly = {
  id: string;
  severity: string;
  state: "detected" | "investigating" | "resolved" | "monitoring";
  startedAt: string;
  ackNote: string | null;
  resolutionNote: string | null;
  resolvedAt: string | null;
  checkName: string;
  checkKind: string;
};

export type PropertyDetail = {
  id: string;
  name: string;
  reportSuiteId: string;
  clientId: string;
  clientName: string;
  status: Status;
  detectors: DetectorRow[];
  activeAnomaly: ActiveAnomaly | null;
  recentlyResolved: ActiveAnomaly | null;
  customKPICount: number;
};

const DETECTOR_KINDS = [
  "d1_data_arrival",
  "d2_volume_plausibility",
  "d3_event_variable_presence",
  "d4_page_name_nullness",
  "d5_tag_delivery",
] as const;

export async function loadPropertyDetail(
  propertyId: string,
): Promise<PropertyDetail | null> {
  const supabase = await createClient();

  const [{ data: property }, { data: checks }, { data: anomalies }] =
    await Promise.all([
      supabase
        .from("properties")
        .select("id, name, adobe_report_suite_id, client_id, clients ( name )")
        .eq("id", propertyId)
        .maybeSingle(),
      supabase
        .from("checks")
        .select("id, kind, name, last_evaluated_at, weight_tier")
        .eq("property_id", propertyId),
      supabase
        .from("anomalies")
        .select(
          "id, severity, state, started_at, ack_note, resolution_note, resolved_at, check_id, checks ( name, kind )",
        )
        .eq("property_id", propertyId)
        .order("started_at", { ascending: false }),
    ]);

  if (!property) return null;

  const checkRows = checks ?? [];
  const allAnomalies = anomalies ?? [];
  const activeAnomalies = allAnomalies.filter(
    (a) => a.state === "detected" || a.state === "investigating",
  );

  // Build the five required detector rows. If a detector check exists for this
  // property, use its real anomaly state; otherwise it's healthy (or unknown
  // if we have no row for it).
  const detectors: DetectorRow[] = DETECTOR_KINDS.map((kind) => {
    const check = checkRows.find((c) => c.kind === kind);
    const anomaly = activeAnomalies.find((a) => a.check_id === check?.id);
    const status: Status = anomaly
      ? anomalyToStatus(anomaly.severity as string)
      : check
        ? "healthy"
        : "unknown";
    return {
      id: check?.id ?? kind,
      kind,
      name: check?.name ?? kindToName(kind),
      status,
      lastEvaluatedAt: (check?.last_evaluated_at as string | null) ?? null,
    };
  });

  // Map active + recently resolved (within 48h) into typed shapes.
  // Supabase types nested embeds as arrays; we narrow with a runtime check.
  const mapped = activeAnomalies.map((a) => toActiveAnomaly(narrowJoinedRow(a)));
  const activeAnomaly =
    mapped.sort((a, b) => severityRank(a.severity) - severityRank(b.severity))[0] ??
    null;

  const recentlyResolved = allAnomalies
    .filter(
      (a) =>
        a.state === "resolved" &&
        a.resolved_at &&
        Date.now() - new Date(a.resolved_at as string).getTime() <
          48 * 60 * 60 * 1000,
    )
    .map((a) => toActiveAnomaly(narrowJoinedRow(a)))[0] ?? null;

  const customKPICount = checkRows.filter(
    (c) => !DETECTOR_KINDS.includes(c.kind as (typeof DETECTOR_KINDS)[number]),
  ).length;

  const overallStatus = pickWorstStatus([
    ...detectors.map((d) => d.status),
    ...mapped.map((a) => anomalyToStatus(a.severity)),
  ]);

  return {
    id: property.id as string,
    name: property.name as string,
    reportSuiteId: property.adobe_report_suite_id as string,
    clientId: property.client_id as string,
    clientName:
      (property.clients as { name?: string } | null)?.name ?? "",
    status: overallStatus,
    detectors,
    activeAnomaly,
    recentlyResolved,
    customKPICount,
  };
}

type JoinedAnomalyRow = {
  id: string;
  severity: string;
  state: string;
  started_at: string;
  ack_note: string | null;
  resolution_note: string | null;
  resolved_at: string | null;
  checks: { name?: string; kind?: string } | null;
};

// Supabase JS sometimes types embedded relationships as arrays even when the
// relationship is to-one. Normalize here so the rest of the file can stay
// strict.
function narrowJoinedRow(row: unknown): JoinedAnomalyRow {
  const r = row as Record<string, unknown>;
  const checksRaw = r.checks;
  const checks = Array.isArray(checksRaw)
    ? (checksRaw[0] as JoinedAnomalyRow["checks"]) ?? null
    : (checksRaw as JoinedAnomalyRow["checks"]) ?? null;
  return {
    id: r.id as string,
    severity: r.severity as string,
    state: r.state as string,
    started_at: r.started_at as string,
    ack_note: (r.ack_note as string | null) ?? null,
    resolution_note: (r.resolution_note as string | null) ?? null,
    resolved_at: (r.resolved_at as string | null) ?? null,
    checks,
  };
}

function toActiveAnomaly(row: JoinedAnomalyRow): ActiveAnomaly {
  return {
    id: row.id,
    severity: row.severity,
    state: row.state as ActiveAnomaly["state"],
    startedAt: row.started_at,
    ackNote: row.ack_note,
    resolutionNote: row.resolution_note,
    resolvedAt: row.resolved_at,
    checkName: row.checks?.name ?? "",
    checkKind: row.checks?.kind ?? "",
  };
}

function severityRank(severity: string): number {
  switch (severity) {
    case "critical": return 0;
    case "degraded": return 1;
    case "stale_kpi": return 2;
    case "watch": return 3;
    default: return 4;
  }
}

function kindToName(kind: string): string {
  const map: Record<string, string> = {
    d1_data_arrival: "Data arrival",
    d2_volume_plausibility: "Volume plausibility",
    d3_event_variable_presence: "Event / variable presence",
    d4_page_name_nullness: "Page name coverage",
    d5_tag_delivery: "Tag delivery confirmation",
  };
  return map[kind] ?? kind;
}
