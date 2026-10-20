import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSession, requireStaff } from "@/lib/api/auth";

export const instant = false;

export default async function CampusAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) redirect("/campus");

  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) redirect("/campus");

  return children;
}
