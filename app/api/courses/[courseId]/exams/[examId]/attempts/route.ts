import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSession } from "@/lib/api/auth";
import {
  examBelongsToCourse,
  isCourseInstructor,
} from "@/lib/api/guards";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";

type RouteContext = { params: Promise<{ courseId: string; examId: string }> };

/**
 * Staff (admin or assigned course instructor): list all attempts for this exam.
 * Includes student profile fields when RLS allows (see profiles policies for instructors).
 */
export async function GET(_request: Request, context: RouteContext) {
  const { courseId: rawCourseId, examId: rawExamId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const examId = parseUuidParam(rawExamId);
  if (!courseId || !examId) {
    return jsonError("validation_error", "Invalid id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const belongs = await examBelongsToCourse(supabase, courseId, examId);
  if (!belongs) {
    return jsonError("not_found", "Exam not found.", 404);
  }

  const instructorHere = await isCourseInstructor(
    supabase,
    session.user.id,
    courseId,
  );
  if (!instructorHere) {
    const admin = await requireAdmin(supabase, session.user.id);
    if (!admin.ok) return admin.response;
  }

  const { data: attempts, error } = await supabase
    .from("exam_attempts")
    .select(
      "*, profiles!exam_attempts_user_id_fkey (id, first_name, last_name, email)",
    )
    .eq("exam_id", examId)
    .order("started_at", { ascending: false });

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ attempts: attempts ?? [] });
}
