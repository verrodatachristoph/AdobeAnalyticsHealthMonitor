"use client";

import { cn } from "@/lib/utils";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  label: string;
  href: Route;
};

type Props = {
  items: NavItem[];
};

/**
 * Pill-cluster top nav. Floating ~24px from the top. Active item = filled
 * charcoal pill (high contrast, intentional anchor). Inactive items are
 * transparent text pills.
 *
 * Design framework §10 — no sidebar nav in the product; top nav + context-
 * specific secondary nav only.
 */
export function TopNavPills({ items }: Props) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="sticky top-6 z-40 mx-auto flex w-fit items-center gap-1 rounded-full border border-hairline bg-card-paper/80 p-1 backdrop-blur-md"
    >
      {items.map((item) => {
        const isActive = matchesRoute(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-colors",
              isActive
                ? "bg-card-contrast text-on-contrast"
                : "text-primary hover:bg-card-soft",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function matchesRoute(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}
