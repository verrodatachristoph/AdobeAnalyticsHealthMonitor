import "server-only";

import { createClient } from "@/lib/supabase/server";

export type Role = "agency_admin" | "agency_analyst" | "client_viewer";

export type SessionWithRole = {
  userId: string;
  email: string | undefined;
  role: Role;
  agencyId: string | null;
  clientId: string | null;
};

/**
 * Load the current user's session + membership.
 * Returns null when the user is unauthenticated or has no membership row.
 *
 * Membership roles are queried live (NOT read from JWT claims) to avoid
 * staleness after an admin updates a membership — per the supabase-platform-engineer
 * gotcha #1 in docs/technical/architecture.md.
 */
export async function getSessionWithRole(): Promise<SessionWithRole | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("agency_id, client_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) return null;

  return {
    userId: user.id,
    email: user.email,
    role: membership.role as Role,
    agencyId: membership.agency_id,
    clientId: membership.client_id,
  };
}

export function isAgencyRole(role: Role): boolean {
  return role === "agency_admin" || role === "agency_analyst";
}
