import { cn } from "@/lib/utils";

type Props = {
  caption: string;
  value: string | number;
  qualifier?: React.ReactNode;
  size?: "md" | "lg" | "xl";
  tone?: "default" | "muted" | "watch";
  className?: string;
};

const SIZE_CLASS = {
  md: "text-4xl",
  lg: "text-5xl",
  xl: "text-6xl md:text-7xl",
};

const TONE_CLASS = {
  default: "text-primary",
  muted: "text-secondary",
  watch: "text-status-watch",
};

/**
 * KPI numeral — light-weight display style. Caption above (uppercase, spaced),
 * large light-weight numeral, optional qualifier line below.
 *
 * Used in the Overview agency KPI strip + Executive summary hero band.
 * Design framework §3.2 — display-* tokens, weight 300.
 */
export function KPINumber({
  caption,
  value,
  qualifier,
  size = "lg",
  tone = "default",
  className,
}: Props) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-secondary">
        {caption}
      </span>
      <span
        className={cn(
          "font-light leading-none tracking-tight tabular-nums",
          SIZE_CLASS[size],
          TONE_CLASS[tone],
        )}
      >
        {value}
      </span>
      {qualifier && (
        <span className="text-sm text-secondary">{qualifier}</span>
      )}
    </div>
  );
}
