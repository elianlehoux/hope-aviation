import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";

export default async function LearnRedirectPage({
  params
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId: rawId } = await params;
  const courseId = parseUuidParam(rawId);
  if (!courseId) return notFound();

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) redirect("/");

  // Fetch the first class of the first subject
  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      id,
      subjects (
        id,
        order_index,
        classes (
          id,
          order_index
        )
      )
    `)
    .eq("id", courseId)
    .order("order_index", { foreignTable: "subjects" })
    .order("order_index", { foreignTable: "subjects.classes" })
    .maybeSingle();

  if (error || !course || !course.subjects?.[0]?.classes?.[0]) {
    // In a real app, maybe redirect back to course detail with a message
    return notFound();
  }

  // TODO: Future optimization - find the last watched class instead of the first
  const firstClassId = course.subjects[0].classes[0].id;

  redirect(`/campus/courses/${courseId}/learn/${firstClassId}`);
}
