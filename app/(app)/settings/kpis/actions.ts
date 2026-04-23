"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const KPISchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  metric: z.string().trim().min(1).max(120),
  segment: z.string().trim().max(120).optional(),
  baselineWindowDays: z.union([z.literal(14), z.literal(28)]),
  sensitivityTier: z.enum(["low", "medium", "high"]),
  weightTier: z.enum(["standard", "elevated", "critical"]),
  visibleToClient: z.boolean(),
});

type FormState = { ok: boolean; message: string } | null;

export async function createCustomKPI(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = KPISchema.safeParse({
    propertyId: formData.get("propertyId"),
    name: formData.get("name"),
    metric: formData.get("metric"),
    segment: formData.get("segment") || undefined,
    baselineWindowDays: Number(formData.get("baselineWindowDays")),
    sensitivityTier: formData.get("sensitivityTier"),
    weightTier: formData.get("weightTier"),
    visibleToClient: formData.get("visibleToClient") === "on",
  });

  if (!parsed.success) {
    return { ok: false, message: "Some fields look off — please review." };
  }

  const supabase = await createClient();
  const config = {
    metric: parsed.data.metric,
    segment: parsed.data.segment ?? null,
  };
  const coldStartUntil = new Date(
    Date.now() + 56 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error } = await supabase.from("checks").insert({
    property_id: parsed.data.propertyId,
    kind: "custom_kpi",
    name: parsed.data.name,
    config,
    weight_tier: parsed.data.weightTier,
    sensitivity_tier: parsed.data.sensitivityTier,
    baseline_window_days: parsed.data.baselineWindowDays,
    visible_to_client: parsed.data.visibleToClient,
    cold_start_until: coldStartUntil,
  });

  if (error) {
    return { ok: false, message: "We couldn't save that KPI. Try again." };
  }

  revalidatePath("/settings/kpis");
  return {
    ok: true,
    message: `Added '${parsed.data.name}'. It will run in shadow mode for 56 days before contributing to the score.`,
  };
}
