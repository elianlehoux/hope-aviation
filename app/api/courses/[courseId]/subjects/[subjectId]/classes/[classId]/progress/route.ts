import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import {
  classBelongsToCourseSubject,
  hasActiveEnrollment,
} from "@/lib/api/guards";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { lessonProgressPutSchema } from "@/lib/validation/enrollments";

type RouteContext = {
  params: Promise<{
    courseId: string;
    subjectId: string;
    classId: string;
  }>;
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

  const chainOk = await classBelongsToCourseSubject(
    supabase,
    courseId,
    subjectId,
    classId,
  );
  if (!chainOk) {
    return jsonError("not_found", "Class not found.", 404);
  }

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("class_id", classId)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ progress: data });
}

export async function PUT(request: Request, context: RouteContext) {
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

  const userId = session.user.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = lessonProgressPutSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid progress payload.", 400);
  }

  const chainOk = await classBelongsToCourseSubject(
    supabase,
    courseId,
    subjectId,
    classId,
  );
  if (!chainOk) {
    return jsonError("not_found", "Class not found.", 404);
  }

  const enrolled = await hasActiveEnrollment(supabase, userId, courseId);
  if (!enrolled) {
    return jsonError(
      "forbidden",
      "Active enrollment in this course is required to update lesson progress.",
      403,
    );
  }

  let completedAt: string | null;
  if (parsed.data.is_completed) {
    completedAt =
      parsed.data.completed_at?.trim() || new Date().toISOString();
  } else {
    completedAt = null;
  }

  const { data, error } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: userId,
        class_id: classId,
        is_completed: parsed.data.is_completed,
        completed_at: completedAt,
      },
      { onConflict: "user_id,class_id" },
    )
    .select("*")
    .single();

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ progress: data });
}
