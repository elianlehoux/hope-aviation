import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { examSubmitSchema } from "@/lib/validation/exams";
import { revalidatePath } from "next/cache";

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = examSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid attempt payload.", 400);
  }

  const { data, error } = await supabase.rpc("submit_final_exam", {
    p_course_id: courseId,
    p_answers: parsed.data.answers,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("not_enrolled")) return jsonError("unauthorized", "Not enrolled in this course.", 403);
    if (msg.includes("modules_not_passed")) return jsonError("forbidden", "All module exams must be passed first.", 403);
    if (msg.includes("unknown_question")) return jsonError("validation_error", "Unknown question id in answers.", 400);
    if (msg.includes("course_not_found")) return jsonError("not_found", "Course not found.", 404);
    return responseFromPostgrestError(error);
  }

  const result = Array.isArray(data) ? data[0] : data;

  revalidatePath("/campus");
  revalidatePath(`/campus/courses/${courseId}`);

  return jsonOk({ score: result?.score ?? 0, passed: Boolean(result?.passed) });
}
