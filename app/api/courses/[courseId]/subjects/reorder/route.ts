import { createClient } from "@/lib/supabase/server";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { reorderSubjectsSchema } from "@/lib/validation/academic";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { courseId: rawCourseId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) return staff.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = reorderSubjectsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid reorder payload.", 400);
  }

  const { orderedSubjectIds } = parsed.data;

  const { data: existing, error: listError } = await supabase
    .from("subjects")
    .select("id")
    .eq("course_id", courseId);

  if (listError) {
    return responseFromPostgrestError(listError);
  }

  const idsInDb = new Set((existing ?? []).map((r) => r.id));
  if (idsInDb.size !== orderedSubjectIds.length) {
    return jsonError(
      "validation_error",
      "orderedSubjectIds must include every subject in this course exactly once.",
      400,
    );
  }

  for (const id of orderedSubjectIds) {
    if (!idsInDb.has(id)) {
      return jsonError(
        "validation_error",
        "orderedSubjectIds must include every subject in this course exactly once.",
        400,
      );
    }
  }

  for (let i = 0; i < orderedSubjectIds.length; i++) {
    const { error } = await supabase
      .from("subjects")
      .update({ order_index: i })
      .eq("id", orderedSubjectIds[i])
      .eq("course_id", courseId);

    if (error) {
      return responseFromPostgrestError(error);
    }
  }

  return jsonOk({ ok: true });
}
