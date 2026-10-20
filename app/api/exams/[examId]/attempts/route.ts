import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { examSubmitSchema } from "@/lib/validation/exams";
import { hasEnrollmentInCourse } from "@/lib/api/guards";

type RouteContext = { params: Promise<{ examId: string }> };

/**
 * List the caller's attempts for this exam (newest first), plus exam attempt limits.
 * RLS restricts rows to the authenticated user (or staff where policies allow).
 */
export async function GET(_request: Request, context: RouteContext) {
  const { examId: rawExamId } = await context.params;
  const examId = parseUuidParam(rawExamId);
  if (!examId) {
    return jsonError("validation_error", "Invalid exam id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const userId = session.user.id;

  const { data: exam, error: examErr } = await supabase
    .from("exams")
    .select("id, max_attempts")
    .eq("id", examId)
    .maybeSingle();

  if (examErr) {
    return responseFromPostgrestError(examErr);
  }

  if (!exam) {
    return jsonError("not_found", "Exam not found.", 404);
  }

  const [countRes, listRes] = await Promise.all([
    supabase
      .from("exam_attempts")
      .select("id", { count: "exact", head: true })
      .eq("exam_id", examId)
      .eq("user_id", userId)
      .not("finished_at", "is", null),
    supabase
      .from("exam_attempts")
      .select("*")
      .eq("exam_id", examId)
      .eq("user_id", userId)
      .order("started_at", { ascending: false }),
  ]);

  const { count: finishedCount, error: countErr } = countRes;
  if (countErr) {
    return responseFromPostgrestError(countErr);
  }

  const { data: attempts, error: listErr } = listRes;
  if (listErr) {
    return responseFromPostgrestError(listErr);
  }

  return jsonOk({
    attempts: attempts ?? [],
    max_attempts: exam.max_attempts,
    finished_attempt_count: finishedCount ?? 0,
  });
}

/**
 * Submit a completed exam attempt: weighted score by question points, compare to passing_score.
 * Insert and max_attempts enforcement run in `public.complete_exam_attempt` (exam row locked).
 */
export async function POST(request: Request, context: RouteContext) {
  const { examId: rawExamId } = await context.params;
  const examId = parseUuidParam(rawExamId);
  if (!examId) {
    return jsonError("validation_error", "Invalid exam id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

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

  const { data: exam, error: examErr } = await supabase
    .from("exams")
    .select("id, course_id, passing_score, max_attempts")
    .eq("id", examId)
    .maybeSingle();

  if (examErr) {
    return responseFromPostgrestError(examErr);
  }

  if (!exam) {
    return jsonError("not_found", "Exam not found.", 404);
  }

  const enrolled = await hasEnrollmentInCourse(supabase, session.user.id, exam.course_id);
  if (!enrolled) {
    return jsonError("unauthorized", "Not enrolled in this course.", 403);
  }

  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("id, points, options(id, is_correct)")
    .eq("exam_id", examId);

  if (qErr) {
    return responseFromPostgrestError(qErr);
  }

  const list = questions ?? [];
  if (list.length === 0) {
    return jsonError("validation_error", "This exam has no questions.", 400);
  }

  const answerKeys = new Set(Object.keys(answers));
  for (const k of answerKeys) {
    if (!list.some((q) => q.id === k)) {
      return jsonError("validation_error", "Unknown question id in answers.", 400);
    }
  }

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
  const passed = score >= exam.passing_score;

  const { data: attempt, error: insErr } = await supabase.rpc(
    "complete_exam_attempt",
    {
      p_exam_id: examId,
      p_score: score,
      p_passed: passed,
    },
  );

  if (insErr) {
    const msg = insErr.message ?? "";
    if (msg.includes("exam_not_found")) {
      return jsonError("not_found", "Exam not found.", 404);
    }
    if (msg.includes("max_attempts_reached")) {
      return jsonError(
        "validation_error",
        "Maximum attempts reached for this exam.",
        400,
      );
    }
    if (msg.includes("not authenticated")) {
      return jsonError("unauthorized", "Authentication required.", 401);
    }
    return responseFromPostgrestError(insErr);
  }

  const attemptRow = Array.isArray(attempt) ? attempt[0] : attempt;
  if (!attemptRow) {
    return jsonError("database_error", "Something went wrong. Please try again.", 500);
  }

  // If the student passed, auto-complete all classes in this module
  if (passed) {
    try {
      const { data: examData } = await supabase
        .from("exams")
        .select("subject_id, subjects(course_id)")
        .eq("id", examId)
        .single();

      if (examData?.subject_id && (examData as any).subjects?.course_id) {
        const { markModuleCompleted } = await import("@/actions/courses");
        await markModuleCompleted(
          (examData as any).subjects.course_id,
          examData.subject_id
        );
      }
    } catch (e) {
      // Non-blocking: log but don't fail the response
      console.error("Auto-complete module after exam pass failed:", e);
    }
  }

  return jsonOk(
    {
      attempt: attemptRow,
      score,
      passed,
    },
    201,
  );
}
