import { getSessionWithRole, isAgencyRole } from "@/lib/auth/require-role";
import { notFound } from "next/navigation";

// Agency-only area. Client viewers see a true 404 (notFound), NOT a 403.
// We don't want to reveal that /settings exists to users who can't access it.
// Gating here at the layout level rather than in middleware keeps middleware
// fast and leaves role checks co-located with the pages they protect.
export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionWithRole();

  if (!session || !isAgencyRole(session.role)) {
    notFound();
  }

  return (
    <section className="space-y-8 pt-8">
      <nav className="flex gap-6 border-b border-hairline pb-4 text-sm">
        {/* TODO: secondary nav — General / Custom KPIs / Notification rules / Team */}
        <span className="text-secondary">General</span>
        <span className="text-primary underline underline-offset-4 decoration-amber">
          Custom KPIs
        </span>
        <span className="text-secondary">Team</span>
      </nav>
      {children}
    </section>
  );
}
