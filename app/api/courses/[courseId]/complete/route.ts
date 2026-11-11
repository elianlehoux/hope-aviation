import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";

type RouteContext = { params: Promise<{ courseId: string }> };

const COMPLETE_ERRORS: Record<string, [number, string]> = {
  course_not_found: [404, "Course not found."],
  not_enrolled: [403, "Not enrolled in this course."],
  final_exam_required: [409, "This course is completed by passing its final exam."],
  lessons_incomplete: [409, "Complete every lesson first."],
  modules_not_passed: [403, "All module exams must be passed first."],
};

/**
 * Complete a course that has no final exam (`public.complete_course`). Idempotent: a repeat
 * call returns the already completed enrollment.
 * Response: `{ data: { enrollmentId, status, completedAt, certificateCode } }`.
 */
export async function POST(_request: Request, context: RouteContext) {
  const { courseId: rawCourseId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const { data, error } = await supabase.rpc("complete_course", { p_course_id: courseId });

  if (error) {
    const message = error.message ?? "";
    if (message.includes("not authenticated")) {
      return jsonError("unauthorized", "Authentication required.", 401);
    }
    const key = Object.keys(COMPLETE_ERRORS).find((k) => message.includes(k));
    if (key) {
      const [status, text] = COMPLETE_ERRORS[key];
      return jsonError(key, text, status);
    }
    return responseFromPostgrestError(error);
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    | { id: string; status: string; completed_at: string | null; certificate_code: string | null }
    | null;
  if (!row) {
    return jsonError("database_error", "Something went wrong. Please try again.", 500);
  }

  revalidatePath("/campus");
  revalidatePath(`/campus/courses/${courseId}`);
  revalidatePath("/campus/certificates");

  return jsonOk({
    enrollmentId: row.id,
    status: row.status,
    completedAt: row.completed_at,
    certificateCode: row.certificate_code,
  });
}
