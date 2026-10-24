import { createClient } from "@/lib/supabase/server";
import { sortOptionsById, sortQuestionsByOrderThenId } from "@/lib/api/exam-order";
import { requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import type { Option, Question } from "@/types/database";

type OptionPaper = Pick<Option, "id" | "question_id" | "content">;

type QuestionPaper = Question & { options: OptionPaper[] };

type RouteContext = { params: Promise<{ examId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { examId: rawExamId } = await context.params;
  const examId = parseUuidParam(rawExamId);
  if (!examId) {
    return jsonError("validation_error", "Invalid exam id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const { data: exam, error: examErr } = await supabase
    .from("exams")
    .select("*")
    .eq("id", examId)
    .maybeSingle();

  if (examErr) {
    return responseFromPostgrestError(examErr);
  }

  if (!exam) {
    return jsonError("not_found", "Exam not found.", 404);
  }

  const { data: questionsRaw, error: qErr } = await supabase
    .from("questions")
    .select("id, exam_id, content, points, order_index, options:options_public(id, question_id, content)")
    .eq("exam_id", examId);

  if (qErr) {
    return responseFromPostgrestError(qErr);
  }

  const questions: QuestionPaper[] = sortQuestionsByOrderThenId(
    (questionsRaw ?? []) as QuestionPaper[],
  ).map((q) => ({
    ...q,
    options: sortOptionsById(q.options ?? []),
  }));

  return jsonOk({
    exam,
    questions,
  });
}
