import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

/**
 * Moves a subject to another course and updates `exams.course_id` for all exams
 * tied to that subject so `course_id` stays aligned with `subjects.course_id`.
 */
export async function updateSubjectCourseId(
  supabase: SupabaseClient,
  subjectId: string,
  newCourseId: string,
): Promise<{ error: PostgrestError | null }> {
  const { error: examError } = await supabase
    .from("exams")
    .update({ course_id: newCourseId })
    .eq("subject_id", subjectId);

  if (examError) {
    return { error: examError };
  }

  const { error: subjectError } = await supabase
    .from("subjects")
    .update({ course_id: newCourseId })
    .eq("id", subjectId);

  return { error: subjectError };
}
