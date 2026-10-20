import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSession } from "@/lib/api/auth";

export default async function AdminOnlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) redirect("/campus");
  const admin = await requireAdmin(supabase, session.user.id);
  if (!admin.ok) redirect("/campus");
  return children;
}
