import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { examSubmitSchema } from "@/lib/validation/exams";

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
  const questionIds = Object.keys(answers);

  if (questionIds.length === 0) {
    return jsonError("validation_error", "No answers provided.", 400);
  }

  // 1. Fetch course to get passing score
  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("final_exam_passing_score")
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

  // 3. Score the exam
  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("id, points, options(id, is_correct)")
    .in("id", questionIds);

  if (qErr) return responseFromPostgrestError(qErr);
  
  const list = questions ?? [];
  let totalPoints = 0;
  let earnedPoints = 0;

  for (const q of list) {
    const pts = Number(q.points);
    totalPoints += pts;

    const selectedId = answers[q.id];
    const opts = q.options as { id: string; is_correct: boolean }[] | null;
    const selected = opts?.find((o) => o.id === selectedId);
    
    if (selected?.is_correct) {
      earnedPoints += pts;
    }
  }

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  const passed = score >= course.final_exam_passing_score;

  // 4. Mark completed if passed
  if (passed && enrollment.status !== "completed") {
    const { error: completeErr } = await supabase.rpc("complete_course_enrollment", { p_course_id: courseId });
    if (completeErr) {
       console.error("Failed to mark course completed:", completeErr);
       // We still return true passed, but we might want to flag the error.
    }
  }

  return jsonOk({ score, passed });
}
