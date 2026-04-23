"use server";

import { createClient } from "@/lib/supabase/server";
import type { Theme } from "@/lib/queries/preferences";
import { revalidatePath } from "next/cache";

export async function setTheme(theme: Theme): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("user_preferences")
    .upsert(
      { user_id: user.id, theme, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );

  if (error) return { ok: false };

  revalidatePath("/", "layout");
  return { ok: true };
}
