import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSession } from "@/lib/api/auth";
import { jsonError } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";

type RouteContext = {
  params: Promise<{ courseId: string; instructorUserId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { courseId: rawCourseId, instructorUserId: rawUserId } =
    await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const instructorUserId = parseUuidParam(rawUserId);
  if (!courseId || !instructorUserId) {
    return jsonError("validation_error", "Invalid id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const admin = await requireAdmin(supabase, session.user.id);
  if (!admin.ok) return admin.response;

  const { data, error } = await supabase
    .from("course_instructors")
    .delete()
    .eq("course_id", courseId)
    .eq("user_id", instructorUserId)
    .select("id");

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data?.length) {
    return jsonError("not_found", "Instructor assignment not found.", 404);
  }

  return new Response(null, { status: 204 });
}
