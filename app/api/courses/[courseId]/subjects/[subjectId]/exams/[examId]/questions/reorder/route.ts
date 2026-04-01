import { createClient } from "@/lib/supabase/server";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import {
  examBelongsToSubject,
  subjectBelongsToCourse,
} from "@/lib/api/guards";
import { reorderQuestionsSchema } from "@/lib/validation/exams";

type RouteContext = {
  params: Promise<{ courseId: string; subjectId: string; examId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const {
    courseId: rawCourseId,
    subjectId: rawSubjectId,
    examId: rawExamId,
  } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  const examId = parseUuidParam(rawExamId);
  if (!courseId || !subjectId || !examId) {
    return jsonError("validation_error", "Invalid id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) return staff.response;

  const ok = await subjectBelongsToCourse(supabase, courseId, subjectId);
  if (!ok) {
    return jsonError("not_found", "Subject not found.", 404);
  }

  const examOk = await examBelongsToSubject(supabase, courseId, subjectId, examId);
  if (!examOk) {
    return jsonError("not_found", "Exam not found.", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = reorderQuestionsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid reorder payload.", 400);
  }

  const { orderedQuestionIds } = parsed.data;

  const { data: existing, error: listError } = await supabase
    .from("questions")
    .select("id")
    .eq("exam_id", examId);

  if (listError) {
    return responseFromPostgrestError(listError);
  }

  const idsInDb = new Set((existing ?? []).map((r) => r.id));
  if (idsInDb.size !== orderedQuestionIds.length) {
    return jsonError(
      "validation_error",
      "orderedQuestionIds must include every question in this exam exactly once.",
      400,
    );
  }

  for (const id of orderedQuestionIds) {
    if (!idsInDb.has(id)) {
      return jsonError(
        "validation_error",
        "orderedQuestionIds must include every question in this exam exactly once.",
        400,
      );
    }
  }

  for (let i = 0; i < orderedQuestionIds.length; i++) {
    const { error } = await supabase
      .from("questions")
      .update({ order_index: i })
      .eq("id", orderedQuestionIds[i])
      .eq("exam_id", examId);

    if (error) {
      return responseFromPostgrestError(error);
    }
  }

  return jsonOk({ ok: true });
}
