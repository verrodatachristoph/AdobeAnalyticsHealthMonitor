import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

// Renamed from `middleware` in Next.js 16. Same execution model.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - /api/cron/* — cron routes carry their own Authorization: Bearer <CRON_SECRET>
     * - files with extensions (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/cron|.*\\.[^/]*$).*)",
  ],
};
