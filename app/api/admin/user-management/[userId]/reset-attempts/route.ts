import { createClient } from "@/lib/supabase/server";
import { requireStaff, requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";

type RouteContext = { params: Promise<{ userId: string }> };

/**
 * NEW: API to reset exam attempts for a specific student and exam.
 * Deletes all matching rows in exam_attempts.
 */
export async function POST(request: Request, context: RouteContext) {
  const { userId: rawId } = await context.params;
  const userId = parseUuidParam(rawId);
  if (!userId) {
    return jsonError("validation_error", "Invalid user id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  // Restricted to staff
  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) return staff.response;

  let body: { examId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const examId = parseUuidParam(body.examId);
  if (!examId) {
    return jsonError("validation_error", "Invalid exam id.", 400);
  }

  // Delete all attempts for this user and exam
  const { error, count } = await supabase
    .from("exam_attempts")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("exam_id", examId);

  if (error) {
    return responseFromPostgrestError(error);
  }

  // RLS silently filters deletes; if attempts are still there, the caller lacked permission.
  if (!count) {
    const { count: remaining } = await supabase
      .from("exam_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("exam_id", examId);
    if (remaining) {
      return jsonError("forbidden", "You do not have permission to reset these attempts.", 403);
    }
  }

  return jsonOk({
    message: "Exam attempts reset successfully.",
    userId,
    examId,
    deleted: count ?? 0,
  });
}
