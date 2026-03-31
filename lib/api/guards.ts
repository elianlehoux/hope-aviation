import type { SupabaseClient } from "@supabase/supabase-js";

export async function subjectBelongsToCourse(
  supabase: SupabaseClient,
  courseId: string,
  subjectId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("subjects")
    .select("id")
    .eq("id", subjectId)
    .eq("course_id", courseId)
    .maybeSingle();
  return Boolean(data);
}
