"use client";

import { cn } from "@/lib/utils";
import { useActionState, useState } from "react";
import { signInWithMagicLink, signInWithPassword } from "./actions";

type Mode = "magic" | "password";

export function SignInForm() {
  const [mode, setMode] = useState<Mode>("password");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-full border border-hairline bg-card-soft p-1">
        <ModeButton active={mode === "password"} onClick={() => setMode("password")}>
          Email + password
        </ModeButton>
        <ModeButton active={mode === "magic"} onClick={() => setMode("magic")}>
          Magic link
        </ModeButton>
      </div>

      {mode === "password" ? <PasswordForm /> : <MagicLinkForm />}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex-1 rounded-full px-4 py-1.5 text-sm transition-colors",
        active
          ? "bg-card-contrast text-on-contrast"
          : "text-primary hover:bg-card-paper",
      )}
    >
      {children}
    </button>
  );
}

function PasswordForm() {
  const [state, formAction, pending] = useActionState(signInWithPassword, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email-pw" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email-pw"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className="w-full rounded-md border border-hairline bg-card-paper px-4 py-2.5 text-base"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-hairline bg-card-paper px-4 py-2.5 text-base"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-amber px-4 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-amber-hover disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {state && !state.ok && (
        <p className="text-sm text-status-degraded" role="status" aria-live="polite">
          {state.message}
        </p>
      )}
    </form>
  );
}

function MagicLinkForm() {
  const [state, formAction, pending] = useActionState(signInWithMagicLink, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email-magic" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email-magic"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className="w-full rounded-md border border-hairline bg-card-paper px-4 py-2.5 text-base"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-amber px-4 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-amber-hover disabled:opacity-60"
      >
        {pending ? "Sending link…" : "Send sign-in link"}
      </button>
      {state && (
        <p
          className={cn(
            "text-sm",
            state.ok ? "text-primary" : "text-status-degraded",
          )}
          role="status"
          aria-live="polite"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
