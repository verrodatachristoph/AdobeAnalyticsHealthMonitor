"use client";

import { setTheme } from "@/app/(app)/preferences/actions";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useState, useTransition } from "react";

type Theme = "light" | "dark" | "system";

type Props = {
  initialTheme: Theme;
};

/**
 * Pill-shaped icon button that toggles light ↔ dark.
 * Persists per-user via user_preferences (cross-device).
 * Optimistically updates the document attribute so the flip is instant.
 */
export function ThemeToggle({ initialTheme }: Props) {
  const [theme, setLocalTheme] = useState<Theme>(initialTheme);
  const [pending, startTransition] = useTransition();

  const resolved = resolveTheme(theme);

  function flip() {
    const next: Theme = resolved === "dark" ? "light" : "dark";
    setLocalTheme(next);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = next;
    }
    startTransition(async () => {
      await setTheme(next);
    });
  }

  return (
    <button
      type="button"
      onClick={flip}
      disabled={pending}
      aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
      className={cn(
        "rounded-full border border-hairline bg-card-paper p-2 text-primary transition-colors",
        "hover:bg-card-soft disabled:opacity-50",
      )}
    >
      {resolved === "dark" ? (
        <Sun size={16} aria-hidden />
      ) : (
        <Moon size={16} aria-hidden />
      )}
    </button>
  );
}

function resolveTheme(t: Theme): "light" | "dark" {
  if (t === "system") {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }
  return t;
}
