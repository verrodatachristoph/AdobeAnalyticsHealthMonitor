import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AnomalyListRow = {
  id: string;
  severity: string;
  state: "detected" | "investigating" | "resolved" | "monitoring";
  startedAt: string;
  resolvedAt: string | null;
  ackNote: string | null;
  resolutionNote: string | null;
  propertyId: string;
  propertyName: string;
  clientName: string;
  checkName: string;
  checkKind: string;
};

export type LoadAnomaliesParams = {
  states?: ReadonlyArray<AnomalyListRow["state"]>;
  limit?: number;
};

export async function loadAnomalies({
  states = ["detected", "investigating", "resolved", "monitoring"],
  limit = 100,
}: LoadAnomaliesParams = {}): Promise<AnomalyListRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anomalies")
    .select(
      `
      id, severity, state, started_at, resolved_at, ack_note, resolution_note,
      property_id,
      properties ( name, clients ( name ) ),
      checks ( name, kind )
      `,
    )
    .in("state", states as unknown as string[])
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("loadAnomalies:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const property = row.properties as
      | { name?: string; clients?: { name?: string } | null }
      | null;
    const check = row.checks as { name?: string; kind?: string } | null;
    return {
      id: row.id as string,
      severity: row.severity as string,
      state: row.state as AnomalyListRow["state"],
      startedAt: row.started_at as string,
      resolvedAt: (row.resolved_at as string | null) ?? null,
      ackNote: (row.ack_note as string | null) ?? null,
      resolutionNote: (row.resolution_note as string | null) ?? null,
      propertyId: row.property_id as string,
      propertyName: property?.name ?? "",
      clientName: property?.clients?.name ?? "",
      checkName: check?.name ?? "",
      checkKind: check?.kind ?? "",
    };
  });
}
