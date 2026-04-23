import { ThemeToggle } from "@/components/theme-toggle";
import { getSessionWithRole, isAgencyRole } from "@/lib/auth/require-role";
import { loadTheme } from "@/lib/queries/preferences";
import type { Route } from "next";
import { TopNavPills, type NavItem } from "./top-nav-pills";

// Server component. Reads the user's role and emits a role-aware nav item
// list to the client component, which handles active-pill highlighting via
// usePathname(). Keeping the read on the server means no role probing in the
// browser and no flash of the wrong nav.
//
// Design framework §7.2 — pill cluster, product logo pill at left,
// right-side utility pills (notifications / settings / avatar TBD).

export async function TopNav() {
  const [session, theme] = await Promise.all([
    getSessionWithRole(),
    loadTheme(),
  ]);
  if (!session) return null;

  const items: NavItem[] = isAgencyRole(session.role)
    ? [
        { label: "Overview", href: "/" as Route },
        { label: "Properties", href: "/properties" as Route },
        { label: "Anomalies", href: "/anomalies" as Route },
        { label: "Settings", href: "/settings" as Route },
      ]
    : [
        { label: "Overview", href: "/" as Route },
        { label: "Properties", href: "/properties" as Route },
        { label: "Incident history", href: "/anomalies" as Route },
        { label: "Your summary", href: "/summary" as Route },
      ];

  return (
    <div className="flex items-center justify-between gap-4 pt-6">
      <span className="rounded-full border border-hairline bg-card-paper px-4 py-2 text-sm font-medium tracking-tight text-primary">
        Health Monitor
      </span>
      <TopNavPills items={items} />
      <ThemeToggle initialTheme={theme} />
    </div>
  );
}
