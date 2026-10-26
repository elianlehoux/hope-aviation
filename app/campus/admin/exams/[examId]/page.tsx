import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { requireStaff } from "@/lib/campus/manage";

/** Legacy URL: looks up the exam's course and redirects to the editor inside the course. */
export default function LegacyExamEditorRedirect({ params }: { params: Promise<{ examId: string }> }) {
  return (
    <Suspense fallback={null}>
      <Lookup params={params} />
    </Suspense>
  );
}

async function Lookup({ params }: { params: Promise<{ examId: string }> }): Promise<null> {
  const examId = parseUuidParam((await params).examId);
  if (!examId) notFound();
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("exams").select("course_id").eq("id", examId).maybeSingle();
  if (!data) notFound();
  redirect(`/campus/admin/courses/${data.course_id}/exams/${examId}`);
}
