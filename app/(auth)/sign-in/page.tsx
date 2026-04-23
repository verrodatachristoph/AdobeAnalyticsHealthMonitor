import { SignInForm } from "./sign-in-form";

// Only public route in the product. No signup, no marketing content.
// Magic-link only in v1 — email+password is an optional future addition.

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-light tracking-tight">Welcome back</h1>
        <p className="mt-3 text-sm text-secondary">
          Enter your email and we&rsquo;ll send you a secure sign-in link.
        </p>
      </header>

      <SignInForm />

      <footer className="mt-10 text-xs text-secondary">
        Accounts are provisioned by your verrodata team. If you can&rsquo;t sign in,
        reply to any email from us.
      </footer>
    </main>
  );
}
