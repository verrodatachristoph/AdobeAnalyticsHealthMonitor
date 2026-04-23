import { Timer } from "lucide-react";

export function ColdStartGlyph({ size = 16 }: { size?: number }) {
  return (
    <span
      role="img"
      aria-label="Building baseline"
      className="inline-flex items-center justify-center text-secondary"
    >
      <Timer size={size} aria-hidden />
    </span>
  );
}
