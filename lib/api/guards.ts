import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

/** Result of `course_subject_exam_chain_status` RPC (one round-trip, RLS applies). */
export type CourseSubjectExamChainResult =
  | { ok: true; subjectOk: boolean; examOk: boolean }
  | { ok: false; postgrestError: PostgrestError };

export async function fetchCourseSubjectExamChain(
  supabase: SupabaseClient,
  courseId: string,
  subjectId: string,
  examId: string,
): Promise<CourseSubjectExamChainResult> {
  const { data, error } = await supabase.rpc(
    "course_subject_exam_chain_status",
    {
      p_course_id: courseId,
      p_subject_id: subjectId,
      p_exam_id: examId,
    },
  );
  if (error) {
    return { ok: false, postgrestError: error };
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return {
      ok: false,
      postgrestError: {
        name: "PostgrestError",
        message: "empty result from course_subject_exam_chain_status",
        code: "PGRST116",
        details: "",
        hint: "",
      } as PostgrestError,
    };
  }
  return {
    ok: true,
    subjectOk: row.subject_ok,
    examOk: row.exam_ok,
  };
}

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

/** True if the class exists and belongs to the given subject and course. */
export async function classBelongsToCourseSubject(
  supabase: SupabaseClient,
  courseId: string,
  subjectId: string,
  classId: string,
): Promise<boolean> {
  const subjectOk = await subjectBelongsToCourse(supabase, courseId, subjectId);
  if (!subjectOk) return false;
  const { data } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("subject_id", subjectId)
    .maybeSingle();
  return Boolean(data);
}

export async function hasActiveEnrollment(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("status", "active")
    .maybeSingle();
  return Boolean(data);
}

/** Any enrollment row (any status) for this user and course. */
export async function hasEnrollmentInCourse(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  return Boolean(data);
}

export async function examBelongsToCourse(
  supabase: SupabaseClient,
  courseId: string,
  examId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("exams")
    .select("id")
    .eq("id", examId)
    .eq("course_id", courseId)
    .maybeSingle();
  return Boolean(data);
}

export async function isCourseInstructor(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("course_instructors")
    .select("id")
    .eq("course_id", courseId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}
