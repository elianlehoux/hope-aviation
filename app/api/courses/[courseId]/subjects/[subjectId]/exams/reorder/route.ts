import { createClient } from "@/lib/supabase/server";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { subjectBelongsToCourse } from "@/lib/api/guards";
import { reorderExamsSchema } from "@/lib/validation/exams";

type RouteContext = {
  params: Promise<{ courseId: string; subjectId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { courseId: rawCourseId, subjectId: rawSubjectId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  if (!courseId || !subjectId) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = reorderExamsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid reorder payload.", 400);
  }

  const { orderedExamIds } = parsed.data;

  const { data: existing, error: listError } = await supabase
    .from("exams")
    .select("id")
    .eq("subject_id", subjectId);

  if (listError) {
    return responseFromPostgrestError(listError);
  }

  const idsInDb = new Set((existing ?? []).map((r) => r.id));
  if (idsInDb.size !== orderedExamIds.length) {
    return jsonError(
      "validation_error",
      "orderedExamIds must include every exam in this subject exactly once.",
      400,
    );
  }

  for (const id of orderedExamIds) {
    if (!idsInDb.has(id)) {
      return jsonError(
        "validation_error",
        "orderedExamIds must include every exam in this subject exactly once.",
        400,
      );
    }
  }

  for (let i = 0; i < orderedExamIds.length; i++) {
    const { error } = await supabase
      .from("exams")
      .update({ order_index: i })
      .eq("id", orderedExamIds[i])
      .eq("subject_id", subjectId);

    if (error) {
      return responseFromPostgrestError(error);
    }
  }

  return jsonOk({ ok: true });
}
