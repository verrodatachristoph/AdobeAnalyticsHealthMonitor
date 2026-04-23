import { cn } from "@/lib/utils";

export type Status =
  | "healthy"
  | "watch"
  | "investigating"
  | "degraded"
  | "critical"
  | "unknown"
  | "cold-start";

type Size = "sm" | "md" | "lg";

type Props = {
  status: Status;
  size?: Size;
  className?: string;
  label?: string;
};

const SIZES: Record<Size, number> = { sm: 14, md: 16, lg: 20 };

const STATUS_COLOR_CLASS: Record<Exclude<Status, "cold-start">, string> = {
  healthy: "text-status-healthy",
  watch: "text-status-watch",
  investigating: "text-status-investigating",
  degraded: "text-status-degraded",
  critical: "text-status-critical",
  // Unknown is intentionally secondary — it's infrastructure, not health.
  unknown: "text-secondary",
};

const STATUS_LABEL: Record<Status, string> = {
  healthy: "Healthy",
  watch: "Watch",
  investigating: "Investigating",
  degraded: "Degraded",
  critical: "Critical",
  unknown: "Unknown",
  "cold-start": "Building baseline",
};

/**
 * Multi-encoded status glyph. Shape + color + (for critical only) motion.
 * Color is never the sole signal — the glyph shape changes per severity,
 * so colorblind users and screen readers all get the signal.
 *
 * See docs/design/design-framework.md §6.
 */
export function StatusGlyph({ status, size = "md", className, label }: Props) {
  const px = SIZES[size];
  const colorClass =
    status === "cold-start"
      ? "text-secondary"
      : STATUS_COLOR_CLASS[status];

  return (
    <span
      role="img"
      aria-label={label ?? STATUS_LABEL[status]}
      className={cn("inline-flex items-center justify-center", className)}
      style={{ width: px, height: px, color: "currentColor" }}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(colorClass, status === "critical" && "pulse-critical")}
      >
        {renderGlyph(status)}
      </svg>
    </span>
  );
}

function renderGlyph(status: Status) {
  switch (status) {
    case "healthy":
      // Thin open circle
      return (
        <circle
          cx="10"
          cy="10"
          r="7"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      );

    case "watch":
      // Circle with a central dot
      return (
        <>
          <circle
            cx="10"
            cy="10"
            r="7"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="10" cy="10" r="2.5" fill="currentColor" />
        </>
      );

    case "investigating":
      // Filled circle with top-right notch
      return (
        <>
          <path
            d="M10 3a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5V3Z"
            fill="currentColor"
          />
          <path
            d="M10 3v2a5 5 0 0 1 5 5h2a7 7 0 0 0-7-7Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </>
      );

    case "degraded":
      // Filled circle with a bottom notch
      return (
        <>
          <circle cx="10" cy="10" r="7" fill="currentColor" />
          <path
            d="M6 13.5a5 5 0 0 0 8 0"
            stroke="var(--bg-field)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </>
      );

    case "critical":
      // Filled circle with inner slash — pulses via .pulse-critical class
      return (
        <>
          <circle cx="10" cy="10" r="7" fill="currentColor" />
          <path
            d="M6.5 13.5l7-7"
            stroke="var(--bg-field)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      );

    case "unknown":
      // Dashed open circle — infrastructure, not health
      return (
        <circle
          cx="10"
          cy="10"
          r="7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="2 2"
        />
      );

    case "cold-start":
      // Timer-style hourglass outline — NOT a severity color
      return (
        <>
          <path
            d="M6 4h8M6 16h8M7 4c0 4 6 4 6 8s-6 4-6 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );
  }
}
