import { ColdStartGlyph } from "@/components/cold-start-glyph";
import { StatusGlyph } from "@/components/status-glyph";
import type { CustomKPIRow } from "@/lib/queries/custom-kpis";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { BellOff, Eye, EyeOff } from "lucide-react";

type Props = {
  kpi: CustomKPIRow;
};

const WEIGHT_BORDER = {
  standard: "",
  elevated: "border-l-[3px] border-l-status-watch",
  critical: "border-l-[3px] border-l-status-critical",
} as const;

export function KPIListRow({ kpi }: Props) {
  const inColdStart =
    kpi.coldStartUntil && new Date(kpi.coldStartUntil) > new Date();
  const isMuted = kpi.mutedUntil && new Date(kpi.mutedUntil) > new Date();

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl bg-card-soft px-5 py-4",
        WEIGHT_BORDER[kpi.weightTier],
      )}
    >
      <span className="shrink-0">
        {inColdStart ? (
          <ColdStartGlyph />
        ) : (
          <StatusGlyph status="healthy" size="md" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-medium text-primary">{kpi.name}</h3>
          <span className="text-xs text-secondary">{kpi.propertyName}</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-secondary">
          <span>{labelForWeight(kpi.weightTier)}</span>
          <span>·</span>
          <span>{labelForSensitivity(kpi.sensitivityTier)}</span>
          {inColdStart && (
            <>
              <span>·</span>
              <span className="font-mono">
                Ready {formatDistanceToNow(new Date(kpi.coldStartUntil!), { addSuffix: true })}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-secondary">
        {isMuted && (
          <span className="inline-flex items-center gap-1 rounded-full bg-card-paper px-2.5 py-1 text-xs">
            <BellOff size={12} aria-hidden />
            <span>
              expires{" "}
              {formatDistanceToNow(new Date(kpi.mutedUntil!), {
                addSuffix: true,
              })}
            </span>
          </span>
        )}
        {kpi.visibleToClient ? (
          <Eye size={14} aria-label="Visible to client" />
        ) : (
          <EyeOff size={14} aria-label="Hidden from client" />
        )}
      </div>
    </div>
  );
}

function labelForWeight(t: CustomKPIRow["weightTier"]): string {
  return t === "standard"
    ? "Standard"
    : t === "elevated"
      ? "Elevated"
      : "Critical";
}

function labelForSensitivity(t: CustomKPIRow["sensitivityTier"]): string {
  return t === "low"
    ? "Notify on big drops only"
    : t === "medium"
      ? "Notify on noticeable drops"
      : "Notify on any unusual change";
}
