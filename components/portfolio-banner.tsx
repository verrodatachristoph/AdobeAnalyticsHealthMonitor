import { StatusGlyph, type Status } from "@/components/status-glyph";
import { cn } from "@/lib/utils";

export type PortfolioBannerVariant =
  | "all-healthy"
  | "issues-one"
  | "issues-many"
  | "unknown"
  | "single-client";

type Props = {
  variant: PortfolioBannerVariant;
  verdict: string;
  subline: React.ReactNode;
  glyphStatus?: Status;
  className?: string;
};

/**
 * Full-width hero verdict at the top of Overview / Property Detail.
 * No card chrome — sits directly on bg-field with generous top padding.
 * Property name is NOT the largest text on the screen — the verdict is.
 *
 * Spec: docs/features/overview.md §1, design-framework §16.
 */
export function PortfolioBanner({
  variant,
  verdict,
  subline,
  glyphStatus,
  className,
}: Props) {
  const isAccented = variant === "unknown";

  return (
    <header
      className={cn(
        "rounded-lg",
        isAccented && "bg-accent-tint p-8",
        !isAccented && "px-0",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        {glyphStatus && (
          <span className="mt-2 shrink-0">
            <StatusGlyph status={glyphStatus} size="lg" />
          </span>
        )}
        <h1 className="text-4xl font-light tracking-tight text-primary md:text-5xl">
          {verdict}
        </h1>
      </div>
      <p className="mt-3 text-sm text-secondary">{subline}</p>
    </header>
  );
}
