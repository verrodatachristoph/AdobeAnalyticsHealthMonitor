import { StatusGlyph, type Status } from "@/components/status-glyph";
import type { ActivityEntry } from "@/lib/queries/recent-activity";

const TYPE_TO_STATUS: Record<string, Status> = {
  detected: "watch",
  investigating: "investigating",
  resolved: "healthy",
  monitoring: "watch",
  acknowledged: "investigating",
  muted: "unknown",
};

type Props = {
  entries: ActivityEntry[];
  className?: string;
};

/**
 * Right-rail activity feed. Charcoal anchor card with amber timestamps —
 * the "watchman's log" register from the design framework.
 *
 * Spec: docs/features/overview.md §4 + design-framework §16.
 */
export function RecentActivityRail({ entries, className }: Props) {
  return (
    <aside
      aria-label="Recent activity"
      className={`rounded-xl bg-card-contrast p-6 text-on-contrast ${className ?? ""}`}
    >
      <h2 className="text-lg font-medium">Recent activity</h2>
      <div className="mt-1 h-px w-full bg-white/10" />

      {entries.length === 0 ? (
        <p className="mt-6 text-sm opacity-60">
          No recent activity.
        </p>
      ) : (
        <ul className="mt-5 space-y-5">
          {entries.map((entry) => (
            <li key={entry.id} className="flex gap-3">
              <span className="mt-0.5 shrink-0">
                <StatusGlyph
                  status={TYPE_TO_STATUS[entry.type] ?? "unknown"}
                  size="sm"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] uppercase tracking-wide text-amber">
                  {entry.whenLabel}
                </p>
                <p className="mt-0.5 text-sm font-medium opacity-95">
                  {entry.propertyName}
                </p>
                {entry.message && (
                  <p className="mt-0.5 text-sm leading-snug opacity-70">
                    {entry.message}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
