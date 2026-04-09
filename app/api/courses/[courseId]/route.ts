import { createClient } from "@/lib/supabase/server";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { courseUpdateSchema } from "@/lib/validation/academic";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { courseId: rawId } = await context.params;
  const courseId = parseUuidParam(rawId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "Course not found.", 404);
  }

  return jsonOk({ course: data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { courseId: rawId } = await context.params;
  const courseId = parseUuidParam(rawId);
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

  const parsed = courseUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid course payload.", 400);
  }

  const payload = parsed.data;

  const { data, error } = await supabase
    .from("courses")
    .update({
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.description !== undefined
        ? { description: payload.description }
        : {}),
      ...(payload.thumbnail_url !== undefined
        ? { thumbnail_url: payload.thumbnail_url }
        : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
      ...(payload.final_exam_question_count !== undefined ? { final_exam_question_count: payload.final_exam_question_count } : {}),
      ...(payload.final_exam_time_limit_minutes !== undefined ? { final_exam_time_limit_minutes: payload.final_exam_time_limit_minutes } : {}),
      ...(payload.final_exam_passing_score !== undefined ? { final_exam_passing_score: payload.final_exam_passing_score } : {}),
    })
    .eq("id", courseId)
    .select("*")
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "Course not found.", 404);
  }

  return jsonOk({ course: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { courseId: rawId } = await context.params;
  const courseId = parseUuidParam(rawId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) return staff.response;

  const { data, error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId)
    .select("id");

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data?.length) {
    return jsonError("not_found", "Course not found.", 404);
  }

  return new Response(null, { status: 204 });
}
