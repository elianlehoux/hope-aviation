import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { enrollOtherUserSchema } from "@/lib/validation/enrollments";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { courseId: rawCourseId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text.trim()) {
      body = JSON.parse(text) as unknown;
    }
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const obj =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};

  const enrollOther =
    obj.user_id !== undefined
      ? enrollOtherUserSchema.safeParse(obj)
      : { success: false as const };

  let targetUserId = session.user.id;
  let requirePublished = true;

  if (enrollOther.success) {
    const admin = await requireAdmin(supabase, session.user.id);
    if (!admin.ok) return admin.response;
    targetUserId = enrollOther.data.user_id;
    requirePublished = false;
  } else if (Object.keys(obj).length > 0) {
    return jsonError(
      "validation_error",
      "Invalid body. Use {} for self-enroll or { user_id } (admin only).",
      400,
    );
  }

  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id, status")
    .eq("id", courseId)
    .maybeSingle();

  if (courseErr) {
    return responseFromPostgrestError(courseErr);
  }

  if (!course) {
    return jsonError("not_found", "Course not found.", 404);
  }

  if (requirePublished && course.status !== "published") {
    return jsonError(
      "validation_error",
      "This course is not open for enrollment.",
      400,
    );
  }

  const { data: existing, error: exErr } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("course_id", courseId)
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (exErr) {
    return responseFromPostgrestError(exErr);
  }

  if (existing) {
    if (existing.status === "active") {
      return jsonError(
        "conflict",
        "You are already enrolled in this course.",
        409,
      );
    }
    if (existing.status === "completed") {
      return jsonError(
        "conflict",
        "Enrollment exists as completed. Use PATCH to change status.",
        409,
      );
    }
    if (existing.status === "cancelled") {
      const { data: updated, error: updErr } = await supabase
        .from("enrollments")
        .update({ status: "active" })
        .eq("id", existing.id)
        .select(
          "*, courses (*), profiles!enrollments_user_id_fkey (id, first_name, last_name, email)",
        )
        .single();

      if (updErr) {
        return responseFromPostgrestError(updErr);
      }

      return jsonOk({ enrollment: updated, reactivated: true });
    }
  }

  const { data: inserted, error: insErr } = await supabase
    .from("enrollments")
    .insert({
      course_id: courseId,
      user_id: targetUserId,
      status: "active",
    })
    .select(
      "*, courses (*), profiles!enrollments_user_id_fkey (id, first_name, last_name, email)",
    )
    .single();

  if (insErr) {
    return responseFromPostgrestError(insErr);
  }

  return jsonOk({ enrollment: inserted }, 201);
}
