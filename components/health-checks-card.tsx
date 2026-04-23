import { DetectorRow } from "@/components/detector-row";
import { Separator } from "@/components/ui/separator";
import type { DetectorRow as DetectorRowData } from "@/lib/queries/property-detail";

type Props = {
  detectors: DetectorRowData[];
  role: "agency" | "client";
};

export function HealthChecksCard({ detectors, role }: Props) {
  const allHealthy = detectors.every(
    (d) => d.status === "healthy" || d.status === "unknown",
  );

  return (
    <section className="rounded-2xl bg-card-paper p-8" aria-labelledby="health-checks-title">
      <header className="flex items-baseline justify-between">
        <h2 id="health-checks-title" className="text-xl font-medium text-primary">
          Health checks
        </h2>
        {allHealthy && (
          <span className="text-xs text-secondary">
            {detectors.filter((d) => d.status === "healthy").length} of{" "}
            {detectors.length} passing
          </span>
        )}
      </header>
      <Separator className="mt-3 mb-1" />
      <div className="divide-y divide-hairline">
        {detectors.map((d) => (
          <DetectorRow key={d.id} detector={d} role={role} />
        ))}
      </div>
    </section>
  );
}
