import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-4xl font-light tracking-tight">Not found</h1>
      <p className="mt-3 text-sm text-secondary">
        That page doesn&rsquo;t exist, or you don&rsquo;t have access to it.
      </p>
      <Link
        href="/"
        className="mt-8 text-sm text-primary underline underline-offset-4 decoration-amber"
      >
        Back to Overview
      </Link>
    </main>
  );
}
