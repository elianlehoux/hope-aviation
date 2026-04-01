import { createClient } from "@/lib/supabase/server";
import { sortExamsByOrderThenCreated } from "@/lib/api/exam-order";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { subjectBelongsToCourse } from "@/lib/api/guards";
import { examCreateSchema } from "@/lib/validation/exams";

type RouteContext = {
  params: Promise<{ courseId: string; subjectId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { courseId: rawCourseId, subjectId: rawSubjectId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  if (!courseId || !subjectId) {
    return jsonError("validation_error", "Invalid id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const ok = await subjectBelongsToCourse(supabase, courseId, subjectId);
  if (!ok) {
    return jsonError("not_found", "Subject not found.", 404);
  }

  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("subject_id", subjectId);

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ exams: sortExamsByOrderThenCreated(data ?? []) });
}

export async function POST(request: Request, context: RouteContext) {
  const { courseId: rawCourseId, subjectId: rawSubjectId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  if (!courseId || !subjectId) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = examCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid exam payload.", 400);
  }

  const p = parsed.data;

  const { data, error } = await supabase
    .from("exams")
    .insert({
      course_id: courseId,
      subject_id: subjectId,
      title: p.title,
      description: p.description ?? null,
      passing_score: p.passing_score,
      time_limit_minutes: p.time_limit_minutes ?? null,
      max_attempts: p.max_attempts,
      order_index: p.order_index ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ exam: data }, 201);
}
