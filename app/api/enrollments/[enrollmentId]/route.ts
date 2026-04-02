import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSession } from "@/lib/api/auth";
import { isCourseInstructor } from "@/lib/api/guards";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { enrollmentPatchSchema } from "@/lib/validation/enrollments";

type RouteContext = { params: Promise<{ enrollmentId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { enrollmentId: rawId } = await context.params;
  const enrollmentId = parseUuidParam(rawId);
  if (!enrollmentId) {
    return jsonError("validation_error", "Invalid enrollment id.", 400);
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

  const parsed = enrollmentPatchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid enrollment payload.", 400);
  }

  const { data: current, error: fetchErr } = await supabase
    .from("enrollments")
    .select("id, user_id, course_id")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (fetchErr) {
    return responseFromPostgrestError(fetchErr);
  }

  if (!current) {
    return jsonError("not_found", "Enrollment not found.", 404);
  }

  const isOwner = current.user_id === session.user.id;
  if (!isOwner) {
    const instructorOk = await isCourseInstructor(
      supabase,
      session.user.id,
      current.course_id,
    );
    if (!instructorOk) {
      const admin = await requireAdmin(supabase, session.user.id);
      if (!admin.ok) {
        return jsonError(
          "forbidden",
          "You do not have permission to update this enrollment.",
          403,
        );
      }
    }
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) {
    updates.status = parsed.data.status;
  }

  if (Object.keys(updates).length === 0) {
    const { data: full, error: fullErr } = await supabase
      .from("enrollments")
      .select(
        "*, courses (*), profiles!enrollments_user_id_fkey (id, first_name, last_name, email)",
      )
      .eq("id", enrollmentId)
      .maybeSingle();

    if (fullErr) {
      return responseFromPostgrestError(fullErr);
    }

    return jsonOk({ enrollment: full });
  }

  const { data: updated, error: updErr } = await supabase
    .from("enrollments")
    .update(updates)
    .eq("id", enrollmentId)
    .select(
      "*, courses (*), profiles!enrollments_user_id_fkey (id, first_name, last_name, email)",
    )
    .maybeSingle();

  if (updErr) {
    if (updErr.message?.includes("immutable_fields")) {
      return jsonError(
        "validation_error",
        "Only enrollment status can be updated.",
        400,
      );
    }
    return responseFromPostgrestError(updErr);
  }

  if (!updated) {
    return jsonError("not_found", "Enrollment not found.", 404);
  }

  return jsonOk({ enrollment: updated });
}
