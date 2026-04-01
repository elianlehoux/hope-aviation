import { createClient } from "@/lib/supabase/server";
import {
  requireSession,
  requireStaff,
  userIsStaff,
} from "@/lib/api/auth";
import { sortOptionsById } from "@/lib/api/exam-order";
import { stripOptionsForStudent, type QuestionWithOptions } from "@/lib/api/exam-mappers";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import {
  examBelongsToSubject,
  questionBelongsToExam,
  subjectBelongsToCourse,
} from "@/lib/api/guards";
import { questionUpdateSchema } from "@/lib/validation/exams";
import type { Question } from "@/types/database";

type RouteContext = {
  params: Promise<{
    courseId: string;
    subjectId: string;
    examId: string;
    questionId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const {
    courseId: rawCourseId,
    subjectId: rawSubjectId,
    examId: rawExamId,
    questionId: rawQuestionId,
  } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  const examId = parseUuidParam(rawExamId);
  const questionId = parseUuidParam(rawQuestionId);
  if (!courseId || !subjectId || !examId || !questionId) {
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

  const qOk = await questionBelongsToExam(supabase, examId, questionId);
  if (!qOk) {
    return jsonError("not_found", "Question not found.", 404);
  }

  const { data, error } = await supabase
    .from("questions")
    .select("*, options(*)")
    .eq("id", questionId)
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "Question not found.", 404);
  }

  const row: QuestionWithOptions = {
    ...(data as Question),
    options: sortOptionsById((data as QuestionWithOptions).options ?? []),
  };

  const staff = await userIsStaff(supabase, session.user.id);
  if (staff) {
    return jsonOk({ question: row });
  }

  return jsonOk({ question: stripOptionsForStudent([row])[0] });
}

export async function PATCH(request: Request, context: RouteContext) {
  const {
    courseId: rawCourseId,
    subjectId: rawSubjectId,
    examId: rawExamId,
    questionId: rawQuestionId,
  } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  const examId = parseUuidParam(rawExamId);
  const questionId = parseUuidParam(rawQuestionId);
  if (!courseId || !subjectId || !examId || !questionId) {
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

  const qOk = await questionBelongsToExam(supabase, examId, questionId);
  if (!qOk) {
    return jsonError("not_found", "Question not found.", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = questionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid question payload.", 400);
  }

  const payload = parsed.data;
  const updates: Record<string, unknown> = {};
  if (payload.content !== undefined) updates.content = payload.content;
  if (payload.points !== undefined) updates.points = payload.points;
  if (payload.order_index !== undefined) {
    updates.order_index = payload.order_index;
  }

  if (Object.keys(updates).length === 0) {
    const { data: current } = await supabase
      .from("questions")
      .select("*")
      .eq("id", questionId)
      .maybeSingle();
    return jsonOk({ question: current });
  }

  const { data, error } = await supabase
    .from("questions")
    .update(updates)
    .eq("id", questionId)
    .select("*")
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ question: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const {
    courseId: rawCourseId,
    subjectId: rawSubjectId,
    examId: rawExamId,
    questionId: rawQuestionId,
  } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  const examId = parseUuidParam(rawExamId);
  const questionId = parseUuidParam(rawQuestionId);
  if (!courseId || !subjectId || !examId || !questionId) {
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

  const qOk = await questionBelongsToExam(supabase, examId, questionId);
  if (!qOk) {
    return jsonError("not_found", "Question not found.", 404);
  }

  const { data, error } = await supabase
    .from("questions")
    .delete()
    .eq("id", questionId)
    .select("id");

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data?.length) {
    return jsonError("not_found", "Question not found.", 404);
  }

  return new Response(null, { status: 204 });
}
