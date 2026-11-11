import { createClient } from "@/lib/supabase/server";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { courseUpdateSchema } from "@/lib/validation/academic";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { courseId: rawId } = await context.params;
  const courseId = parseUuidParam(rawId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "Course not found.", 404);
  }

  return jsonOk({ course: data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { courseId: rawId } = await context.params;
  const courseId = parseUuidParam(rawId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) return staff.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = courseUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid course payload.", 400);
  }

  const payload = parsed.data;

  if (payload.status === "published") {
    const { data: tree, error: treeErr } = await supabase
      .from("subjects")
      .select("id, classes(id), exams(id)")
      .eq("course_id", courseId);

    if (treeErr) return responseFromPostgrestError(treeErr);

    const subjects = tree ?? [];
    if (subjects.length === 0) {
      return jsonError(
        "validation_error",
        "Publish requires at least one module.",
        400,
      );
    }

    const missingClasses = subjects.filter((s) => !s.classes?.length).length;
    if (missingClasses > 0) {
      return jsonError(
        "validation_error",
        "Every module needs at least one class before publish.",
        400,
      );
    }

    // Modules without an exam are allowed: they unlock the next one once their classes are done.
    const examIds = subjects.flatMap((s) => (s.exams ?? []).map((e: { id: string }) => e.id));
    let questionCount = 0;
    if (examIds.length > 0) {
      const { count, error: qErr } = await supabase
        .from("questions")
        .select("id", { count: "exact", head: true })
        .in("exam_id", examIds);
      if (qErr) return responseFromPostgrestError(qErr);
      questionCount = count ?? 0;
    }

    const { data: courseRow } = await supabase
      .from("courses")
      .select("final_exam_question_count")
      .eq("id", courseId)
      .maybeSingle();

    const configured =
      payload.final_exam_question_count ??
      courseRow?.final_exam_question_count ??
      0;
    if (configured > 0 && questionCount < configured) {
      return jsonError(
        "validation_error",
        `The final exam needs ${configured} questions, but the course only has ${questionCount}.`,
        400,
      );
    }
  }

  const { data, error } = await supabase
    .from("courses")
    .update({
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.description !== undefined
        ? { description: payload.description }
        : {}),
      ...(payload.thumbnail_url !== undefined
        ? { thumbnail_url: payload.thumbnail_url }
        : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
      ...(payload.final_exam_question_count !== undefined ? { final_exam_question_count: payload.final_exam_question_count } : {}),
      ...(payload.final_exam_time_limit_minutes !== undefined ? { final_exam_time_limit_minutes: payload.final_exam_time_limit_minutes } : {}),
      ...(payload.final_exam_passing_score !== undefined ? { final_exam_passing_score: payload.final_exam_passing_score } : {}),
    })
    .eq("id", courseId)
    .select("*")
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "Course not found.", 404);
  }

  return jsonOk({ course: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { courseId: rawId } = await context.params;
  const courseId = parseUuidParam(rawId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) return staff.response;

  const { data, error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId)
    .select("id");

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data?.length) {
    return jsonError("not_found", "Course not found.", 404);
  }

  return new Response(null, { status: 204 });
}
