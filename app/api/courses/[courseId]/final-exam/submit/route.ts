import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { examSubmitSchema } from "@/lib/validation/exams";
import { revalidatePath } from "next/cache";
import { examRpcErrorResponse } from "@/lib/campus/exam-paper";

type RouteContext = { params: Promise<{ courseId: string }> };

/**
 * Grade the caller's open final exam session (`public.submit_final_exam`); on pass the
 * enrollment is completed. Response: `{ data: { score, passed, correct, total } }`.
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

  // The session's question count is the denominator; read it before the RPC closes it.
  const { data: open, error: openErr } = await supabase
    .from("final_exam_sessions")
    .select("question_ids")
    .eq("user_id", session.user.id)
    .eq("course_id", courseId)
    .is("finished_at", null)
    .maybeSingle();
  if (openErr) return responseFromPostgrestError(openErr);

  const { data, error } = await supabase.rpc("submit_final_exam", {
    p_course_id: courseId,
    p_answers: parsed.data.answers,
  });

  if (error) return examRpcErrorResponse(error);

  const result = (Array.isArray(data) ? data[0] : data) as
    | { score: number | null; passed: boolean | null }
    | null;

  revalidatePath("/campus");
  revalidatePath(`/campus/courses/${courseId}`);

  const score = result?.score ?? 0;
  const total = ((open?.question_ids as string[] | null) ?? []).length;
  return jsonOk({
    score,
    passed: result?.passed === true,
    correct: Math.round((score * total) / 100),
    total,
  });
}
