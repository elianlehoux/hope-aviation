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

export async function examBelongsToSubject(
  supabase: SupabaseClient,
  courseId: string,
  subjectId: string,
  examId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("exams")
    .select("id")
    .eq("id", examId)
    .eq("course_id", courseId)
    .eq("subject_id", subjectId)
    .maybeSingle();
  return Boolean(data);
}

export async function questionBelongsToExam(
  supabase: SupabaseClient,
  examId: string,
  questionId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("questions")
    .select("id")
    .eq("id", questionId)
    .eq("exam_id", examId)
    .maybeSingle();
  return Boolean(data);
}

export async function optionBelongsToQuestion(
  supabase: SupabaseClient,
  questionId: string,
  optionId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("options")
    .select("id")
    .eq("id", optionId)
    .eq("question_id", questionId)
    .maybeSingle();
  return Boolean(data);
}
