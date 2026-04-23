import type { Status } from "@/components/status-glyph";

// Severity ordering — lower number = worse. Used to derive a property's
// current status from its open anomalies (the worst one wins).
export const SEVERITY_RANK: Record<Status, number> = {
  critical: 0,
  degraded: 1,
  investigating: 2,
  watch: 3,
  unknown: 4,
  "cold-start": 5,
  healthy: 6,
};

const ANOMALY_TO_STATUS = {
  critical: "critical",
  degraded: "degraded",
  stale_kpi: "watch",
  watch: "watch",
} as const satisfies Record<string, Status>;

export function anomalyToStatus(severity: string): Status {
  return (ANOMALY_TO_STATUS as Record<string, Status>)[severity] ?? "watch";
}

export function pickWorstStatus(statuses: Status[]): Status {
  if (statuses.length === 0) return "healthy";
  return statuses.reduce<Status>(
    (worst, s) => (SEVERITY_RANK[s] < SEVERITY_RANK[worst] ? s : worst),
    "healthy",
  );
}

export const STATUS_LABEL: Record<Status, string> = {
  healthy: "Healthy",
  watch: "Watch",
  investigating: "Investigating",
  degraded: "Degraded",
  critical: "Critical",
  unknown: "Unknown",
  "cold-start": "Building baseline",
};
