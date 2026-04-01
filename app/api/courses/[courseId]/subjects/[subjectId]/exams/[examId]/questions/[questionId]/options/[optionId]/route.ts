import { createClient } from "@/lib/supabase/server";
import {
  requireSession,
  requireStaff,
  userIsStaff,
} from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import {
  examBelongsToSubject,
  optionBelongsToQuestion,
  questionBelongsToExam,
  subjectBelongsToCourse,
} from "@/lib/api/guards";
import { optionUpdateSchema } from "@/lib/validation/exams";

type RouteContext = {
  params: Promise<{
    courseId: string;
    subjectId: string;
    examId: string;
    questionId: string;
    optionId: string;
  }>;
};

function stripOption(o: { id: string; question_id: string; content: unknown }) {
  return {
    id: o.id,
    question_id: o.question_id,
    content: o.content,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const {
    courseId: rawCourseId,
    subjectId: rawSubjectId,
    examId: rawExamId,
    questionId: rawQuestionId,
    optionId: rawOptionId,
  } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  const examId = parseUuidParam(rawExamId);
  const questionId = parseUuidParam(rawQuestionId);
  const optionId = parseUuidParam(rawOptionId);
  if (!courseId || !subjectId || !examId || !questionId || !optionId) {
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

  const optOk = await optionBelongsToQuestion(supabase, questionId, optionId);
  if (!optOk) {
    return jsonError("not_found", "Option not found.", 404);
  }

  const { data, error } = await supabase
    .from("options")
    .select("*")
    .eq("id", optionId)
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "Option not found.", 404);
  }

  const staff = await userIsStaff(supabase, session.user.id);
  if (staff) {
    return jsonOk({ option: data });
  }

  return jsonOk({ option: stripOption(data) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const {
    courseId: rawCourseId,
    subjectId: rawSubjectId,
    examId: rawExamId,
    questionId: rawQuestionId,
    optionId: rawOptionId,
  } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  const examId = parseUuidParam(rawExamId);
  const questionId = parseUuidParam(rawQuestionId);
  const optionId = parseUuidParam(rawOptionId);
  if (!courseId || !subjectId || !examId || !questionId || !optionId) {
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

  const optOk = await optionBelongsToQuestion(supabase, questionId, optionId);
  if (!optOk) {
    return jsonError("not_found", "Option not found.", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = optionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid option payload.", 400);
  }

  const payload = parsed.data;
  const updates: Record<string, unknown> = {};
  if (payload.content !== undefined) updates.content = payload.content;
  if (payload.is_correct !== undefined) {
    updates.is_correct = payload.is_correct;
  }

  if (Object.keys(updates).length === 0) {
    const { data: current } = await supabase
      .from("options")
      .select("*")
      .eq("id", optionId)
      .maybeSingle();
    return jsonOk({ option: current });
  }

  const { data, error } = await supabase
    .from("options")
    .update(updates)
    .eq("id", optionId)
    .select("*")
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ option: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const {
    courseId: rawCourseId,
    subjectId: rawSubjectId,
    examId: rawExamId,
    questionId: rawQuestionId,
    optionId: rawOptionId,
  } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  const examId = parseUuidParam(rawExamId);
  const questionId = parseUuidParam(rawQuestionId);
  const optionId = parseUuidParam(rawOptionId);
  if (!courseId || !subjectId || !examId || !questionId || !optionId) {
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

  const optOk = await optionBelongsToQuestion(supabase, questionId, optionId);
  if (!optOk) {
    return jsonError("not_found", "Option not found.", 404);
  }

  const { data, error } = await supabase
    .from("options")
    .delete()
    .eq("id", optionId)
    .select("id");

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data?.length) {
    return jsonError("not_found", "Option not found.", 404);
  }

  return new Response(null, { status: 204 });
}
