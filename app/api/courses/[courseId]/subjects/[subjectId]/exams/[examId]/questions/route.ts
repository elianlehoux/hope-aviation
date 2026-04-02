import { createClient } from "@/lib/supabase/server";
import {
  requireSession,
  requireStaff,
  userIsStaff,
} from "@/lib/api/auth";
import { sortOptionsById, sortQuestionsByOrderThenId } from "@/lib/api/exam-order";
import { stripOptionsForStudent, type QuestionWithOptions } from "@/lib/api/exam-mappers";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { fetchCourseSubjectExamChain } from "@/lib/api/guards";
import { questionCreateSchema } from "@/lib/validation/exams";

type RouteContext = {
  params: Promise<{ courseId: string; subjectId: string; examId: string }>;
};

/** GET uses `userIsStaff` to branch; POST uses `requireStaff` — see `lib/api/auth.ts`. */
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

  const chain = await fetchCourseSubjectExamChain(
    supabase,
    courseId,
    subjectId,
    examId,
  );
  if (!chain.ok) {
    return responseFromPostgrestError(chain.postgrestError);
  }
  if (!chain.subjectOk) {
    return jsonError("not_found", "Subject not found.", 404);
  }
  if (!chain.examOk) {
    return jsonError("not_found", "Exam not found.", 404);
  }

  const { data, error } = await supabase
    .from("questions")
    .select("*, options(*)")
    .eq("exam_id", examId);

  if (error) {
    return responseFromPostgrestError(error);
  }

  const raw = (data ?? []) as QuestionWithOptions[];
  const sorted = sortQuestionsByOrderThenId(raw).map((q) => ({
    ...q,
    options: sortOptionsById(q.options ?? []),
  }));

  const staff = await userIsStaff(supabase, session.user.id);
  if (staff) {
    return jsonOk({ questions: sorted });
  }

  return jsonOk({ questions: stripOptionsForStudent(sorted) });
}

export async function POST(request: Request, context: RouteContext) {
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

  const chain = await fetchCourseSubjectExamChain(
    supabase,
    courseId,
    subjectId,
    examId,
  );
  if (!chain.ok) {
    return responseFromPostgrestError(chain.postgrestError);
  }
  if (!chain.subjectOk) {
    return jsonError("not_found", "Subject not found.", 404);
  }
  if (!chain.examOk) {
    return jsonError("not_found", "Exam not found.", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = questionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid question payload.", 400);
  }

  const p = parsed.data;

  const { data, error } = await supabase
    .from("questions")
    .insert({
      exam_id: examId,
      content: p.content,
      points: p.points,
      order_index: p.order_index ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ question: data }, 201);
}
