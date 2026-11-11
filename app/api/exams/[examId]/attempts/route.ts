import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { examSubmitSchema } from "@/lib/validation/exams";
import { examRpcErrorResponse } from "@/lib/campus/exam-paper";

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
 * Submit the caller's open attempt. Grading, timing (a late submit scores zero) and module
 * credit all run in `public.submit_exam_attempt`, so the answer key never reaches the client.
 * Response: `{ data: { score, passed, correct, total } }`; a second submit gets 409 `no_open_attempt`.
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
    return jsonError("invalid_answers", "Invalid attempt payload.", 400);
  }

  const { data: attempt, error } = await supabase.rpc("submit_exam_attempt", {
    p_exam_id: examId,
    p_answers: parsed.data.answers,
  });

  if (error) return examRpcErrorResponse(error);

  const attemptRow = (Array.isArray(attempt) ? attempt[0] : attempt) as
    | { score: number | null; passed: boolean | null }
    | null;
  if (!attemptRow) {
    return jsonError("database_error", "Something went wrong. Please try again.", 500);
  }

  const { count, error: countErr } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", examId);
  if (countErr) return responseFromPostgrestError(countErr);

  const score = attemptRow.score ?? 0;
  const total = count ?? 0;
  return jsonOk({
    score,
    passed: attemptRow.passed === true,
    correct: Math.round((score * total) / 100),
    total,
  });
}
