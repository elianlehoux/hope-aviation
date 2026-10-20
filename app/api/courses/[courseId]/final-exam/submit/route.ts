import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { examSubmitSchema } from "@/lib/validation/exams";
import { revalidatePath } from "next/cache";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { courseId: rawCourseId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = examSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid attempt payload.", 400);
  }

  const { answers } = parsed.data;

  // 1. Fetch course to get passing score
  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("final_exam_passing_score, final_exam_question_count")
    .eq("id", courseId)
    .maybeSingle();

  if (courseErr) return responseFromPostgrestError(courseErr);
  if (!course) return jsonError("not_found", "Course not found.", 404);

  // 2. Fetch enrollment to make sure they are active
  const { data: enrollment, error: enrollmentErr } = await supabase
    .from("enrollments")
    .select("status")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (enrollmentErr) return responseFromPostgrestError(enrollmentErr);
  if (!enrollment || (enrollment.status !== "active" && enrollment.status !== "completed")) {
    return jsonError("unauthorized", "Not enrolled in this course.", 403);
  }

  const { data: courseExams, error: examsErr } = await supabase
    .from("exams")
    .select("id")
    .eq("course_id", courseId);
  if (examsErr) return responseFromPostgrestError(examsErr);

  const examIds = (courseExams ?? []).map((e) => e.id);
  if (examIds.length === 0) {
    return jsonError("validation_error", "This course has no module exams.", 400);
  }

  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("id, points, options(id, is_correct)")
    .in("exam_id", examIds);
  if (qErr) return responseFromPostgrestError(qErr);

  const courseQuestionIds = new Set((questions ?? []).map((q) => q.id));
  for (const questionId of Object.keys(answers)) {
    if (!courseQuestionIds.has(questionId)) {
      return jsonError("validation_error", "Unknown question id in answers.", 400);
    }
  }

  const targetCount = Math.max(1, course.final_exam_question_count || Object.keys(answers).length);
  let correct = 0;
  for (const [questionId, optionId] of Object.entries(answers)) {
    const question = (questions ?? []).find((q) => q.id === questionId);
    const opts = question?.options as { id: string; is_correct: boolean }[] | null;
    if (opts?.find((o) => o.id === optionId && o.is_correct)) {
      correct += 1;
    }
  }

  const score = (correct / targetCount) * 100;
  const passed = score >= course.final_exam_passing_score;

  // 4. Mark completed if passed
  if (passed && enrollment.status !== "completed") {
    const { error: completeErr } = await supabase.rpc("complete_course_enrollment", { p_course_id: courseId });
    if (completeErr) {
       console.error("Failed to mark course completed:", completeErr);
       // We still return true passed, but we might want to flag the error.
    }
  }

  revalidatePath("/campus");
  revalidatePath(`/campus/courses/${courseId}`);

  return jsonOk({ score, passed });
}
