import { createClient } from "@/lib/supabase/server";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { redirect } from "next/navigation";
import ExamsListPanel from "@/components/features/admin/ExamsListPanel";

export const metadata = {
  title: "Exámenes — Hope Aviation Admin",
  description: "Global exam management for Hope Aviation.",
};

export default async function AdminExamsPage() {
  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) redirect("/");

  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) redirect("/");

  const { data: coursesData } = await supabase
    .from("courses")
    .select("id, title, status, subjects(id, title)")
    .order("created_at", { ascending: false });

  return <ExamsListPanel coursesData={coursesData ?? []} />;
}
