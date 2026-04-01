import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { examSubmitSchema } from "@/lib/validation/exams";

type RouteContext = { params: Promise<{ examId: string }> };

/**
 * Submit a completed exam attempt: weighted score by question points, compare to passing_score.
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

  const { data: exam, error: examErr } = await supabase
    .from("exams")
    .select("id, passing_score, max_attempts")
    .eq("id", examId)
    .maybeSingle();

  if (examErr) {
    return responseFromPostgrestError(examErr);
  }

  if (!exam) {
    return jsonError("not_found", "Exam not found.", 404);
  }

  const { data: priorAttempts, error: countErr } = await supabase
    .from("exam_attempts")
    .select("finished_at")
    .eq("exam_id", examId)
    .eq("user_id", userId);

  if (countErr) {
    return responseFromPostgrestError(countErr);
  }

  const finishedCount = (priorAttempts ?? []).filter(
    (r) => r.finished_at != null,
  ).length;

  if (finishedCount >= exam.max_attempts) {
    return jsonError(
      "validation_error",
      "Maximum attempts reached for this exam.",
      400,
    );
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
  for (const q of list) {
    if (!answerKeys.has(q.id)) {
      return jsonError(
        "validation_error",
        "Answer required for every question.",
        400,
      );
    }
  }

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
    if (!selected) {
      return jsonError(
        "validation_error",
        "Each answer must match an option for that question.",
        400,
      );
    }
    if (selected.is_correct) {
      earnedPoints += pts;
    }
  }

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  const passed = score >= exam.passing_score;

  const finishedAt = new Date().toISOString();

  const { data: attempt, error: insErr } = await supabase
    .from("exam_attempts")
    .insert({
      user_id: userId,
      exam_id: examId,
      score,
      passed,
      finished_at: finishedAt,
    })
    .select("*")
    .single();

  if (insErr) {
    return responseFromPostgrestError(insErr);
  }

  return jsonOk(
    {
      attempt,
      score,
      passed,
    },
    201,
  );
}
