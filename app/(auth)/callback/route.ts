import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

// Magic-link callback. Supabase redirects here with a `code` query param
// after the user clicks the email link. We exchange it for a session and
// then redirect to either the requested `next` path or the Overview.

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(
      new URL("/sign-in?error=missing_code", origin),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/sign-in?error=exchange_failed", origin),
    );
  }

  // Validate `next` is a same-origin path so we can't be used as an open redirector.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return NextResponse.redirect(new URL(safeNext, origin));
}
