import "server-only";

import { createClient } from "@/lib/supabase/server";

export type Theme = "light" | "dark" | "system";

export async function loadTheme(): Promise<Theme> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "system";

  const { data } = await supabase
    .from("user_preferences")
    .select("theme")
    .eq("user_id", user.id)
    .maybeSingle();

  return ((data?.theme as Theme | undefined) ?? "system") as Theme;
}
