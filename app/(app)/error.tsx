"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-light tracking-tight">
        Something went sideways.
      </h1>
      <p className="mt-3 text-sm text-secondary">
        We hit an unexpected error rendering this page. The details are in your
        console; the agency&rsquo;s on it.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 w-fit rounded-full border border-hairline bg-card-paper px-4 py-2 text-sm hover:bg-card-soft"
      >
        Try again
      </button>
    </main>
  );
}
