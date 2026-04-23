import { StatusGlyph } from "@/components/status-glyph";
import type { ActiveAnomaly } from "@/lib/queries/property-detail";
import { format, formatDistanceToNow } from "date-fns";

type Props = {
  anomaly: ActiveAnomaly;
  role: "agency" | "client";
};

export function IncidentBanner({ anomaly, role }: Props) {
  const sinceLabel = format(new Date(anomaly.startedAt), "HH:mm 'UTC'");
  const updatedAgo = formatDistanceToNow(new Date(anomaly.startedAt), {
    addSuffix: true,
  });

  const clientCopy = `We noticed something unusual in ${humanize(anomaly.checkName).toLowerCase()} around ${sinceLabel} and our team is looking into it. No action needed from you.`;
  const agencyCopy =
    anomaly.ackNote ??
    `${anomaly.checkName} flagged at ${sinceLabel} (${anomaly.severity}). Awaiting analyst note.`;

  return (
    <aside
      role="status"
      className="rounded-2xl border-l-[3px] border-l-status-investigating bg-accent-tint p-6"
    >
      <div className="flex items-start gap-4">
        <span className="mt-1 shrink-0">
          <StatusGlyph status="investigating" size="lg" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base text-primary">
            {role === "client" ? clientCopy : agencyCopy}
          </p>
          <p className="mt-2 font-mono text-xs text-secondary">
            Since {sinceLabel} · Updated {updatedAgo}
          </p>
        </div>
      </div>
    </aside>
  );
}

function humanize(s: string): string {
  return s.replace(/[_-]/g, " ");
}
