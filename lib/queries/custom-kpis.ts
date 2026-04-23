import "server-only";

import { createClient } from "@/lib/supabase/server";

export type CustomKPIRow = {
  id: string;
  propertyId: string;
  propertyName: string;
  clientName: string;
  name: string;
  kind: string;
  weightTier: "standard" | "elevated" | "critical";
  sensitivityTier: "low" | "medium" | "high";
  baselineWindowDays: 14 | 28;
  visibleToClient: boolean;
  mutedUntil: string | null;
  coldStartUntil: string | null;
  lastEvaluatedAt: string | null;
};

export type PropertyOption = {
  id: string;
  name: string;
  clientName: string;
};

const DETECTOR_KINDS = new Set([
  "d1_data_arrival",
  "d2_volume_plausibility",
  "d3_event_variable_presence",
  "d4_page_name_nullness",
  "d5_tag_delivery",
]);

export async function loadPropertyOptions(): Promise<PropertyOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id, name, clients ( name )")
    .eq("status", "active")
    .order("name", { ascending: true });
  if (error) {
    console.error("loadPropertyOptions:", error);
    return [];
  }
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    clientName:
      (row.clients as { name?: string } | null)?.name ?? "",
  }));
}

export async function loadCustomKPIs(
  propertyId: string,
): Promise<CustomKPIRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("checks")
    .select(
      "id, name, kind, weight_tier, sensitivity_tier, baseline_window_days, visible_to_client, muted_until, cold_start_until, last_evaluated_at, properties ( id, name, clients ( name ) )",
    )
    .eq("property_id", propertyId)
    .order("name", { ascending: true });

  if (error) {
    console.error("loadCustomKPIs:", error);
    return [];
  }

  return (data ?? [])
    .filter((row) => !DETECTOR_KINDS.has(row.kind as string))
    .map((row) => {
      const property = row.properties as
        | { id?: string; name?: string; clients?: { name?: string } | null }
        | null;
      return {
        id: row.id as string,
        propertyId: property?.id ?? propertyId,
        propertyName: property?.name ?? "",
        clientName: property?.clients?.name ?? "",
        name: row.name as string,
        kind: row.kind as string,
        weightTier: row.weight_tier as CustomKPIRow["weightTier"],
        sensitivityTier:
          row.sensitivity_tier as CustomKPIRow["sensitivityTier"],
        baselineWindowDays:
          row.baseline_window_days as CustomKPIRow["baselineWindowDays"],
        visibleToClient: row.visible_to_client as boolean,
        mutedUntil: (row.muted_until as string | null) ?? null,
        coldStartUntil: (row.cold_start_until as string | null) ?? null,
        lastEvaluatedAt:
          (row.last_evaluated_at as string | null) ?? null,
      };
    });
}
