import { StatusGlyph } from "@/components/status-glyph";
import type { DetectorRow as DetectorRowData } from "@/lib/queries/property-detail";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const CLIENT_LABEL: Record<string, string> = {
  d1_data_arrival: "Your data is arriving on schedule",
  d2_volume_plausibility: "Your traffic levels look normal",
  d3_event_variable_presence: "Your key events are tracking",
  d4_page_name_nullness: "Your page names are populated",
  d5_tag_delivery: "Your tracking tag is active",
};

const AGENCY_LABEL: Record<string, string> = {
  d1_data_arrival: "Data arrival (D1)",
  d2_volume_plausibility: "Volume plausibility (D2)",
  d3_event_variable_presence: "Event/variable presence (D3)",
  d4_page_name_nullness: "Page-name coverage (D4)",
  d5_tag_delivery: "Tag delivery confirmation (D5)",
};

const ANOMALY_CLIENT_COPY: Record<string, string> = {
  d1_data_arrival: "We noticed something with your data arrival — we're on it.",
  d2_volume_plausibility:
    "We noticed something with your traffic levels — we're on it.",
  d3_event_variable_presence:
    "We noticed something with your event tracking — we're on it.",
  d4_page_name_nullness:
    "We noticed something with your page name coverage — we're on it.",
  d5_tag_delivery:
    "We noticed something with your tracking tag — we're on it.",
};

type Props = {
  detector: DetectorRowData;
  role: "agency" | "client";
};

export function DetectorRow({ detector, role }: Props) {
  const isAnomalous = detector.status !== "healthy" && detector.status !== "unknown";
  const isAgency = role === "agency";

  let label: string;
  if (isAnomalous) {
    label = isAgency
      ? `${AGENCY_LABEL[detector.kind] ?? detector.name} — anomaly detected`
      : ANOMALY_CLIENT_COPY[detector.kind] ?? detector.name;
  } else if (detector.status === "unknown") {
    label = isAgency
      ? `${AGENCY_LABEL[detector.kind] ?? detector.name} — not configured`
      : `${CLIENT_LABEL[detector.kind] ?? detector.name} — pending`;
  } else {
    label = isAgency
      ? AGENCY_LABEL[detector.kind] ?? detector.name
      : CLIENT_LABEL[detector.kind] ?? detector.name;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-2 py-2.5",
        isAnomalous && "rounded-md bg-accent-tint/40 px-3",
      )}
    >
      <StatusGlyph status={detector.status} size="sm" />
      <span className="flex-1 text-sm text-primary">{label}</span>
      {isAgency && detector.lastEvaluatedAt && (
        <span className="font-mono text-xs text-secondary">
          checked{" "}
          {formatDistanceToNow(new Date(detector.lastEvaluatedAt), {
            addSuffix: true,
          })}
        </span>
      )}
    </div>
  );
}
