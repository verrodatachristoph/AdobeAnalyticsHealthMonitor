import { StatusGlyph, type Status } from "@/components/status-glyph";
import { anomalyToStatus } from "@/lib/health/status";
import type { AnomalyListRow } from "@/lib/queries/anomalies";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import type { Route } from "next";
import Link from "next/link";

const STATE_LABEL: Record<AnomalyListRow["state"], string> = {
  detected: "Detected",
  investigating: "Investigating",
  resolved: "Resolved",
  monitoring: "Monitoring",
};

type Props = {
  anomaly: AnomalyListRow;
  role: "agency" | "client";
};

export function AnomalyRow({ anomaly, role }: Props) {
  const status: Status =
    anomaly.state === "resolved"
      ? "healthy"
      : anomalyToStatus(anomaly.severity);
  const description = describe(anomaly, role);
  const ts = new Date(anomaly.startedAt);

  return (
    <Link
      href={`/properties/${anomaly.propertyId}` as Route}
      className="block rounded-xl bg-card-soft px-5 py-4 transition-colors hover:bg-card-paper"
    >
      <div className="flex items-start gap-4">
        <span className="mt-1 shrink-0">
          <StatusGlyph status={status} size="md" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-primary">
              {anomaly.propertyName}
            </span>
            {role === "agency" && anomaly.clientName && (
              <span className="text-xs text-secondary">
                — {anomaly.clientName}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-primary">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-right">
          <StateChip state={anomaly.state} />
          <time
            dateTime={anomaly.startedAt}
            title={format(ts, "PPpp")}
            className="font-mono text-xs text-secondary"
          >
            {formatDistanceToNow(ts, { addSuffix: true })}
          </time>
        </div>
      </div>
    </Link>
  );
}

function describe(a: AnomalyListRow, role: "agency" | "client"): string {
  if (a.state === "resolved" && a.resolutionNote) return a.resolutionNote;
  if (role === "agency" && a.ackNote) return a.ackNote;
  if (role === "agency") {
    return `${a.checkName} flagged at ${a.severity} severity.`;
  }
  return `We noticed something unusual in ${a.checkName.toLowerCase()} — our team is looking into it.`;
}

function StateChip({ state }: { state: AnomalyListRow["state"] }) {
  const tone =
    state === "investigating"
      ? "bg-status-investigating/15 text-status-investigating"
      : state === "resolved"
        ? "bg-status-healthy/15 text-status-healthy"
        : "bg-card-paper text-secondary";
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium",
        tone,
      )}
    >
      {STATE_LABEL[state]}
    </span>
  );
}
