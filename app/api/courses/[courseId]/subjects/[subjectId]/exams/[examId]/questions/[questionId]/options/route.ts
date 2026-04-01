import { createClient } from "@/lib/supabase/server";
import {
  requireSession,
  requireStaff,
  userIsStaff,
} from "@/lib/api/auth";
import { sortOptionsById } from "@/lib/api/exam-order";
import type { Option } from "@/types/database";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import {
  examBelongsToSubject,
  questionBelongsToExam,
  subjectBelongsToCourse,
} from "@/lib/api/guards";
import { optionCreateSchema } from "@/lib/validation/exams";

type RouteContext = {
  params: Promise<{
    courseId: string;
    subjectId: string;
    examId: string;
    questionId: string;
  }>;
};

function stripOptionList(options: Option[]) {
  return options.map((o) => ({
    id: o.id,
    question_id: o.question_id,
    content: o.content,
  }));
}

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
    .from("options")
    .select("*")
    .eq("question_id", questionId);

  if (error) {
    return responseFromPostgrestError(error);
  }

  const sorted = sortOptionsById(data ?? []);
  const staff = await userIsStaff(supabase, session.user.id);
  if (staff) {
    return jsonOk({ options: sorted });
  }

  return jsonOk({ options: stripOptionList(sorted) });
}

export async function POST(request: Request, context: RouteContext) {
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

  const parsed = optionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid option payload.", 400);
  }

  const p = parsed.data;

  const { data, error } = await supabase
    .from("options")
    .insert({
      question_id: questionId,
      content: p.content,
      is_correct: p.is_correct,
    })
    .select("*")
    .single();

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ option: data }, 201);
}
