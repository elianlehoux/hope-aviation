import { createClient } from "@/lib/supabase/server";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { subjectBelongsToCourse } from "@/lib/api/guards";
import { classUpdateSchema } from "@/lib/validation/academic";

type RouteContext = {
  params: Promise<{ courseId: string; subjectId: string; classId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const {
    courseId: rawCourseId,
    subjectId: rawSubjectId,
    classId: rawClassId,
  } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  const classId = parseUuidParam(rawClassId);
  if (!courseId || !subjectId || !classId) {
    return jsonError("validation_error", "Invalid id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const ok = await subjectBelongsToCourse(supabase, courseId, subjectId);
  if (!ok) {
    return jsonError("not_found", "Subject not found.", 404);
  }

  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .eq("subject_id", subjectId)
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "Class not found.", 404);
  }

  return jsonOk({ class: data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const {
    courseId: rawCourseId,
    subjectId: rawSubjectId,
    classId: rawClassId,
  } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  const classId = parseUuidParam(rawClassId);
  if (!courseId || !subjectId || !classId) {
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

  const parsed = classUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid class payload.", 400);
  }

  const payload = parsed.data;

  const ok = await subjectBelongsToCourse(supabase, courseId, subjectId);
  if (!ok) {
    return jsonError("not_found", "Subject not found.", 404);
  }

  const { data: current, error: fetchErr } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .eq("subject_id", subjectId)
    .maybeSingle();

  if (fetchErr) {
    return responseFromPostgrestError(fetchErr);
  }

  if (!current) {
    return jsonError("not_found", "Class not found.", 404);
  }

  const { subjectId: payloadSubjectId, ...restPayload } = payload;

  let targetSubjectId = subjectId;
  if (payloadSubjectId !== undefined && payloadSubjectId !== subjectId) {
    const { data: targetSubject, error: tsErr } = await supabase
      .from("subjects")
      .select("id, course_id")
      .eq("id", payloadSubjectId)
      .maybeSingle();

    if (tsErr) {
      return responseFromPostgrestError(tsErr);
    }

    if (!targetSubject || targetSubject.course_id !== courseId) {
      return jsonError(
        "validation_error",
        "Target subject must belong to the same course.",
        400,
      );
    }

    targetSubjectId = payloadSubjectId;
  }

  const updates: Record<string, unknown> = {};
  if (restPayload.title !== undefined) updates.title = restPayload.title;
  if (restPayload.description !== undefined) {
    updates.description = restPayload.description;
  }
  if (restPayload.video_url !== undefined) {
    updates.video_url = restPayload.video_url;
  }
  if (restPayload.resource_url !== undefined) {
    updates.resource_url = restPayload.resource_url;
  }
  if (restPayload.duration_minutes !== undefined) {
    updates.duration_minutes = restPayload.duration_minutes;
  }
  if (restPayload.order_index !== undefined) {
    updates.order_index = restPayload.order_index;
  }
  if (payloadSubjectId !== undefined && payloadSubjectId !== subjectId) {
    updates.subject_id = targetSubjectId;
  }

  if (Object.keys(updates).length === 0) {
    return jsonOk({ class: current });
  }

  const { data: updated, error: updErr } = await supabase
    .from("classes")
    .update(updates)
    .eq("id", classId)
    .select("*")
    .maybeSingle();

  if (updErr) {
    return responseFromPostgrestError(updErr);
  }

  return jsonOk({ class: updated });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const {
    courseId: rawCourseId,
    subjectId: rawSubjectId,
    classId: rawClassId,
  } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  const classId = parseUuidParam(rawClassId);
  if (!courseId || !subjectId || !classId) {
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

  const { data, error } = await supabase
    .from("classes")
    .delete()
    .eq("id", classId)
    .eq("subject_id", subjectId)
    .select("id");

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data?.length) {
    return jsonError("not_found", "Class not found.", 404);
  }

  return new Response(null, { status: 204 });
}
