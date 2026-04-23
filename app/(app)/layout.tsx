import { TopNav } from "@/components/top-nav";
import { getSessionWithRole } from "@/lib/auth/require-role";
import { redirect } from "next/navigation";

// Auth-gated shell. Middleware handles the unauthenticated redirect;
// here we guarantee the user has a membership row and expose role to children.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionWithRole();

  // If a user is authenticated but has no membership, the agency hasn't
  // provisioned them yet. Treat as unauthorized — send to sign-in.
  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
      <TopNav />
      <main className="py-8 md:py-12">{children}</main>
    </div>
  );
}
