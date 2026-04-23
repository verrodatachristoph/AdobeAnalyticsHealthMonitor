import { cn } from "@/lib/utils";

type Props = {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
  showEndDot?: boolean;
};

/**
 * Tiny trend line. Muted stroke; optional dot on the most recent point.
 * No axes, no gridlines, no animation. Pure SVG, server-renderable.
 *
 * Design framework — used inside StatusTile (24h trend) and Property Detail
 * KPITile previews. Full charts live in MetricBandChart, never here.
 */
export function Sparkline({
  values,
  width = 100,
  height = 28,
  className,
  showEndDot = true,
}: Props) {
  if (values.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn("text-secondary", className)}
        aria-hidden="true"
      >
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          strokeDasharray="2 3"
        />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    // Inset 2px so the dot doesn't get clipped at the top/bottom edge
    const y = height - 2 - ((v - min) / range) * (height - 4);
    return [x, y] as const;
  });

  const path = points
    .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
    .join(" ");

  const last = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("text-primary", className)}
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.7"
      />
      {showEndDot && (
        <circle cx={last[0]} cy={last[1]} r="2" fill="currentColor" />
      )}
    </svg>
  );
}
