import { createClient } from "@/lib/supabase/server";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { updateSubjectCourseId } from "@/lib/api/move-subject";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { subjectUpdateSchema } from "@/lib/validation/academic";

type RouteContext = {
  params: Promise<{ courseId: string; subjectId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { courseId: rawCourseId, subjectId: rawSubjectId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  if (!courseId || !subjectId) {
    return jsonError("validation_error", "Invalid id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "Subject not found.", 404);
  }

  return jsonOk({ subject: data });
}

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = subjectUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid subject payload.", 400);
  }

  const payload = parsed.data;
  const { courseId: payloadCourseId, ...restPayload } = payload;

  const { data: current, error: fetchErr } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (fetchErr) {
    return responseFromPostgrestError(fetchErr);
  }

  if (!current) {
    return jsonError("not_found", "Subject not found.", 404);
  }

  const shouldMove =
    payloadCourseId !== undefined &&
    payloadCourseId !== current.course_id;

  if (shouldMove && payloadCourseId) {
    const { error: moveErr } = await updateSubjectCourseId(
      supabase,
      subjectId,
      payloadCourseId,
    );
    if (moveErr) {
      return responseFromPostgrestError(moveErr);
    }
  }

  const updates: Record<string, unknown> = {};
  if (restPayload.title !== undefined) updates.title = restPayload.title;
  if (restPayload.description !== undefined) {
    updates.description = restPayload.description;
  }
  if (restPayload.order_index !== undefined) {
    updates.order_index = restPayload.order_index;
  }

  if (Object.keys(updates).length > 0) {
    const { data: updated, error: updErr } = await supabase
      .from("subjects")
      .update(updates)
      .eq("id", subjectId)
      .select("*")
      .maybeSingle();

    if (updErr) {
      return responseFromPostgrestError(updErr);
    }

    return jsonOk({ subject: updated });
  }

  const { data: finalRow, error: reloadErr } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .maybeSingle();

  if (reloadErr) {
    return responseFromPostgrestError(reloadErr);
  }

  return jsonOk({ subject: finalRow });
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  const { data, error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", subjectId)
    .eq("course_id", courseId)
    .select("id");

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data?.length) {
    return jsonError("not_found", "Subject not found.", 404);
  }

  return new Response(null, { status: 204 });
}
