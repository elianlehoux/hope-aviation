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

type RouteContext = { params: Promise<{ courseId: string }> };

/**
 * Start (or resume) the caller's final exam session and return its paper. The question
 * sample is drawn in `public.start_final_exam` and kept for the whole session.
 * Staff may pass `?preview=1` to get a random sample without opening a session.
 */
export async function POST(request: Request, context: RouteContext) {
  const { courseId: rawCourseId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const preview = new URL(request.url).searchParams.get("preview") === "1";

  try {
    const { data: course, error: courseErr } = await supabase
      .from("courses")
      .select("final_exam_question_count, final_exam_time_limit_minutes")
      .eq("id", courseId)
      .maybeSingle();
    if (courseErr) return responseFromPostgrestError(courseErr);
    if (!course) return jsonError("course_not_found", "Course not found.", 404);

    if (preview) {
      if (!(await userIsStaff(supabase, session.user.id))) {
        return jsonError("forbidden", "Preview is only available to staff.", 403);
      }
      const count = course.final_exam_question_count ?? 0;
      if (count <= 0) {
        return jsonError("final_exam_not_configured", "This course has no final exam.", 404);
      }
      const { data: pool, error: poolErr } = await supabase
        .from("questions")
        .select("id, exams!inner(course_id)")
        .eq("exams.course_id", courseId);
      if (poolErr) return responseFromPostgrestError(poolErr);
      const ids = (pool ?? []).map((q) => q.id as string);
      // Fisher-Yates shuffle, then take the configured count.
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      const paper: ExamPaper = {
        attemptId: "preview",
        startedAt: new Date().toISOString(),
        deadline: null,
        questions: await loadPaper(supabase, ids.slice(0, count)),
      };
      return jsonOk(paper);
    }

    const { data: started, error } = await supabase.rpc("start_final_exam", { p_course_id: courseId });
    if (error) return examRpcErrorResponse(error);

    const row = (Array.isArray(started) ? started[0] : started) as
      | { id: string; started_at: string; question_ids: string[] }
      | null;
    if (!row) {
      return jsonError("database_error", "Something went wrong. Please try again.", 500);
    }

    const paper: ExamPaper = {
      attemptId: row.id,
      startedAt: row.started_at,
      deadline: paperDeadline(row.started_at, course.final_exam_time_limit_minutes),
      questions: await loadPaper(supabase, row.question_ids ?? []),
    };
    return jsonOk(paper);
  } catch (err) {
    if (err instanceof PaperLoadError) return responseFromPostgrestError(err.postgrest);
    throw err;
  }
}
