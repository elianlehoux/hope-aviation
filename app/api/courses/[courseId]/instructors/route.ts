import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { userIdBodySchema } from "@/lib/validation/user-actions";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { courseId: rawCourseId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .maybeSingle();

  if (courseErr) {
    return responseFromPostgrestError(courseErr);
  }

  if (!course) {
    return jsonError("not_found", "Course not found.", 404);
  }

  const { data, error } = await supabase
    .from("course_instructors")
    .select(
      "id, course_id, user_id, assigned_at, profiles!course_instructors_user_id_fkey (id, first_name, last_name, email)",
    )
    .eq("course_id", courseId)
    .order("assigned_at", { ascending: true });

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ instructors: data ?? [] });
}

export async function POST(request: Request, context: RouteContext) {
  const { courseId: rawCourseId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const admin = await requireAdmin(supabase, session.user.id);
  if (!admin.ok) return admin.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = userIdBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Expected body: { user_id: uuid }.", 400);
  }

  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .maybeSingle();

  if (courseErr) {
    return responseFromPostgrestError(courseErr);
  }

  if (!course) {
    return jsonError("not_found", "Course not found.", 404);
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", parsed.data.user_id)
    .maybeSingle();

  if (profileErr) {
    return responseFromPostgrestError(profileErr);
  }

  if (!profile) {
    return jsonError("not_found", "User profile not found.", 404);
  }

  const { data: row, error: insErr } = await supabase
    .from("course_instructors")
    .insert({
      course_id: courseId,
      user_id: parsed.data.user_id,
    })
    .select(
      "id, course_id, user_id, assigned_at, profiles!course_instructors_user_id_fkey (id, first_name, last_name, email)",
    )
    .single();

  if (insErr) {
    return responseFromPostgrestError(insErr);
  }

  return jsonOk({ instructor: row }, 201);
}
