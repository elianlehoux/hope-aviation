import { createClient } from "@/lib/supabase/server";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { redirect, notFound } from "next/navigation";
import ExamEditorPanel from "@/components/features/admin/ExamEditorPanel";
import { parseUuidParam } from "@/lib/api/params";

export const metadata = {
  title: "Editor de Examen — Hope Aviation Admin",
  description: "Exam builder and question settings.",
};

type Props = { params: Promise<{ examId: string }> };

export default async function AdminExamEditorPage({ params }: Props) {
  const { examId: rawExamId } = await params;
  const examId = parseUuidParam(rawExamId);

  if (!examId) notFound();

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) redirect("/");

  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) redirect("/");

  // Fetch the exam details
  const { data: exam, error } = await supabase
    .from("exams")
    .select("*, course:courses(title), subject:subjects(title)")
    .eq("id", examId)
    .single();

  if (error || !exam) notFound();

  return <ExamEditorPanel exam={exam} />;
}
