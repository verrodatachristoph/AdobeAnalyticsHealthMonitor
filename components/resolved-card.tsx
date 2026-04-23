import type { ActiveAnomaly } from "@/lib/queries/property-detail";
import { cn } from "@/lib/utils";
import { format, formatDistanceStrict } from "date-fns";

type Props = {
  anomaly: ActiveAnomaly;
  role: "agency" | "client";
  variant?: "standard" | "gold";
};

export function ResolvedCard({ anomaly, role, variant = "standard" }: Props) {
  if (!anomaly.resolvedAt) return null;
  const startedAt = new Date(anomaly.startedAt);
  const resolvedAt = new Date(anomaly.resolvedAt);
  const duration = formatDistanceStrict(resolvedAt, startedAt);
  const resolvedTime = format(resolvedAt, "HH:mm 'UTC'");

  // Client never sees the agency's raw ack note; we use the resolution note
  // (which is written agency-voiced and intended for client consumption).
  // Agency view shows whichever is most informative.
  const copy =
    role === "client"
      ? anomaly.resolutionNote ??
        `We resolved a brief ${humanize(anomaly.checkName).toLowerCase()} issue. Your reporting is accurate and any affected data has been backfilled. No action required.`
      : anomaly.resolutionNote ?? anomaly.ackNote ??
        `${anomaly.checkName} resolved.`;

  return (
    <article
      className={cn(
        "rounded-2xl p-6",
        variant === "gold" ? "bg-accent-tint" : "bg-card-soft",
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "mt-2 inline-block h-2 w-2 shrink-0 rounded-full",
            variant === "gold" ? "bg-amber" : "bg-status-healthy",
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-base text-primary">{copy}</p>
          <p className="mt-2 font-mono text-xs text-secondary">
            Resolved at {resolvedTime} · {duration} after detection
          </p>
        </div>
      </div>
    </article>
  );
}

function humanize(s: string): string {
  return s.replace(/[_-]/g, " ");
}
