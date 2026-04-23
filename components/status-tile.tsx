import { Sparkline } from "@/components/sparkline";
import { StatusGlyph, type Status } from "@/components/status-glyph";
import { cn } from "@/lib/utils";
import type { Route } from "next";
import Link from "next/link";

type Props = {
  href: Route;
  propertyName: string;
  clientName?: string;
  status: Status;
  statusLabel: string;
  metadata: string[];
  trend?: number[];
  hasActiveIssue?: boolean;
};

const BORDER_BY_STATUS: Partial<Record<Status, string>> = {
  watch: "border-l-[3px] border-l-status-watch",
  investigating: "border-l-[3px] border-l-status-investigating",
  degraded: "border-l-[3px] border-l-status-degraded",
  critical: "border-l-[3px] border-l-status-critical",
};

/**
 * Property tile on the Overview grid. Multi-encoded status: glyph + label +
 * left-border weight + density-progressive metadata rows.
 *
 * Spec: docs/features/overview.md §2, design-framework §6.
 */
export function StatusTile({
  href,
  propertyName,
  clientName,
  status,
  statusLabel,
  metadata,
  trend,
  hasActiveIssue,
}: Props) {
  const borderClass = hasActiveIssue ? BORDER_BY_STATUS[status] : undefined;

  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-lg bg-card-soft p-6 transition-colors hover:bg-card-paper",
        borderClass,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-medium text-primary line-clamp-2">
            {propertyName}
          </h3>
          {clientName && (
            <p className="mt-0.5 text-xs text-secondary">{clientName}</p>
          )}
        </div>
        <StatusChip status={status} label={statusLabel} />
      </div>

      {trend && trend.length > 0 && (
        <div className="mt-5">
          <Sparkline values={trend} width={120} height={28} />
        </div>
      )}

      {metadata.length > 0 && (
        <ul className="mt-4 space-y-1 font-mono text-xs text-secondary">
          {metadata.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </Link>
  );
}

function StatusChip({ status, label }: { status: Status; label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-card-paper px-2.5 py-1 text-xs">
      <StatusGlyph status={status} size="sm" />
      <span className="text-primary">{label}</span>
    </span>
  );
}
