import "server-only";

import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";

export type ActivityEntry = {
  id: number;
  type: string;
  message: string;
  propertyName: string;
  clientName: string;
  whenLabel: string;
};

/**
 * Recent activity feed for the Overview right rail.
 * RLS scopes to properties the user can see; client viewers also have
 * a stricter event-type filter applied at the policy level.
 */
export async function loadRecentActivity(limit = 12): Promise<ActivityEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(`
      id, type, message, ts,
      properties ( name, clients ( name ) )
    `)
    .order("ts", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("loadRecentActivity:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const property = row.properties as
      | { name?: string; clients?: { name?: string } | null }
      | null;
    return {
      id: row.id as number,
      type: row.type as string,
      message: (row.message as string) ?? "",
      propertyName: property?.name ?? "",
      clientName: property?.clients?.name ?? "",
      whenLabel: formatDistanceToNow(new Date(row.ts as string), {
        addSuffix: true,
      }),
    };
  });
}
