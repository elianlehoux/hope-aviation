import { createClient } from "@/lib/supabase/server";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { examBelongsToSubject, subjectBelongsToCourse } from "@/lib/api/guards";
import { examUpdateSchema } from "@/lib/validation/exams";

type RouteContext = {
  params: Promise<{ courseId: string; subjectId: string; examId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const {
    courseId: rawCourseId,
    subjectId: rawSubjectId,
    examId: rawExamId,
  } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  const examId = parseUuidParam(rawExamId);
  if (!courseId || !subjectId || !examId) {
    return jsonError("validation_error", "Invalid id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const ok = await subjectBelongsToCourse(supabase, courseId, subjectId);
  if (!ok) {
    return jsonError("not_found", "Subject not found.", 404);
  }

  const examOk = await examBelongsToSubject(supabase, courseId, subjectId, examId);
  if (!examOk) {
    return jsonError("not_found", "Exam not found.", 404);
  }

  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("id", examId)
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "Exam not found.", 404);
  }

  return jsonOk({ exam: data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const {
    courseId: rawCourseId,
    subjectId: rawSubjectId,
    examId: rawExamId,
  } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  const examId = parseUuidParam(rawExamId);
  if (!courseId || !subjectId || !examId) {
    return jsonError("validation_error", "Invalid id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) return staff.response;

  const ok = await subjectBelongsToCourse(supabase, courseId, subjectId);
  if (!ok) {
    return jsonError("not_found", "Subject not found.", 404);
  }

  const examOk = await examBelongsToSubject(supabase, courseId, subjectId, examId);
  if (!examOk) {
    return jsonError("not_found", "Exam not found.", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = examUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid exam payload.", 400);
  }

  const payload = parsed.data;
  const updates: Record<string, unknown> = {};
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.description !== undefined) {
    updates.description = payload.description;
  }
  if (payload.passing_score !== undefined) {
    updates.passing_score = payload.passing_score;
  }
  if (payload.time_limit_minutes !== undefined) {
    updates.time_limit_minutes = payload.time_limit_minutes;
  }
  if (payload.max_attempts !== undefined) {
    updates.max_attempts = payload.max_attempts;
  }
  if (payload.order_index !== undefined) {
    updates.order_index = payload.order_index;
  }

  if (Object.keys(updates).length === 0) {
    const { data: current } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .maybeSingle();
    return jsonOk({ exam: current });
  }

  const { data, error } = await supabase
    .from("exams")
    .update(updates)
    .eq("id", examId)
    .select("*")
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ exam: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const {
    courseId: rawCourseId,
    subjectId: rawSubjectId,
    examId: rawExamId,
  } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  const examId = parseUuidParam(rawExamId);
  if (!courseId || !subjectId || !examId) {
    return jsonError("validation_error", "Invalid id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) return staff.response;

  const ok = await subjectBelongsToCourse(supabase, courseId, subjectId);
  if (!ok) {
    return jsonError("not_found", "Subject not found.", 404);
  }

  const examOk = await examBelongsToSubject(supabase, courseId, subjectId, examId);
  if (!examOk) {
    return jsonError("not_found", "Exam not found.", 404);
  }

  const { data, error } = await supabase
    .from("exams")
    .delete()
    .eq("id", examId)
    .select("id");

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data?.length) {
    return jsonError("not_found", "Exam not found.", 404);
  }

  return new Response(null, { status: 204 });
}
