import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getLearnerUser } from "@/lib/campus/learning";
import { LessonEditor } from "@/components/features/admin/lesson-editor/LessonEditor";
import type { TranslatedText } from "@/types/database";

export const metadata: Metadata = { title: "Editor de clase" };

/** Full-screen editor for a class's written content (staff only; guarded by admin layout). */
export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ courseId: string; classId: string }>;
}) {
  const { courseId: rawCourse, classId: rawClass } = await params;
  const courseId = parseUuidParam(rawCourse);
  const classId = parseUuidParam(rawClass);
  if (!courseId || !classId) notFound();

  const { supabase } = await getLearnerUser();
  const { data: lesson } = await supabase
    .from("classes")
    .select("id, subject_id, title, content, subjects!inner ( course_id )")
    .eq("id", classId)
    .eq("subjects.course_id", courseId)
    .maybeSingle();
  if (!lesson) notFound();

  return (
    <LessonEditor
      courseId={courseId}
      subjectId={lesson.subject_id}
      classId={lesson.id}
      title={lesson.title as TranslatedText}
      initialContent={(lesson.content as TranslatedText | null) ?? {}}
    />
  );
}
