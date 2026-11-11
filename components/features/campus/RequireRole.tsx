import { redirect } from "next/navigation";
import { getCampusSession } from "@/lib/campus/session";

/**
 * Server-side route guard for campus areas. Redirects to login when signed out
 * and to the campus home when the user lacks every allowed role.
 * Must be rendered inside a <Suspense> boundary (it reads the session).
 * Data access is still enforced by API guards and RLS; this only protects the UI.
 */
export async function RequireRole({
  roles,
  children,
}: {
  roles: string[];
  children: React.ReactNode;
}) {
  const { user, roles: userRoles } = await getCampusSession();

  if (!user) {
    redirect("/auth/login?clear=1");
  }

  if (!roles.some((r) => userRoles.has(r))) {
    redirect("/campus");
  }

  return <>{children}</>;
}
