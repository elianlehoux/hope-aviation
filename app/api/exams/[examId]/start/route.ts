import { createClient } from "@/lib/supabase/server";
import { requireSession, userIsStaff } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import {
  examRpcErrorResponse,
  loadPaper,
  PaperLoadError,
  paperDeadline,
  type ExamPaper,
} from "@/lib/campus/exam-paper";

type RouteContext = { params: Promise<{ examId: string }> };

/**
 * Start (or resume) the caller's attempt for a module exam and return the paper.
 * Timing, attempt limits and module gating run in `public.start_exam_attempt`.
 * Staff may pass `?preview=1` to get the paper without opening an attempt.
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

  const preview = new URL(request.url).searchParams.get("preview") === "1";

  try {
    if (preview) {
      if (!(await userIsStaff(supabase, session.user.id))) {
        return jsonError("forbidden", "Preview is only available to staff.", 403);
      }
      const questions = await loadPaper(supabase, { examId });
      const paper: ExamPaper = {
        attemptId: "preview",
        startedAt: new Date().toISOString(),
        deadline: null,
        questions,
      };
      return jsonOk(paper);
    }

    const { data: attempt, error } = await supabase.rpc("start_exam_attempt", { p_exam_id: examId });
    if (error) return examRpcErrorResponse(error);

    const row = (Array.isArray(attempt) ? attempt[0] : attempt) as
      | { id: string; started_at: string }
      | null;
    if (!row) {
      return jsonError("database_error", "Something went wrong. Please try again.", 500);
    }

    const [examRes, questions] = await Promise.all([
      supabase.from("exams").select("time_limit_minutes").eq("id", examId).maybeSingle(),
      loadPaper(supabase, { examId }),
    ]);
    if (examRes.error) return responseFromPostgrestError(examRes.error);

    const paper: ExamPaper = {
      attemptId: row.id,
      startedAt: row.started_at,
      deadline: paperDeadline(row.started_at, examRes.data?.time_limit_minutes),
      questions,
    };
    return jsonOk(paper);
  } catch (err) {
    if (err instanceof PaperLoadError) return responseFromPostgrestError(err.postgrest);
    throw err;
  }
}
