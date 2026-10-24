import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { sortOptionsById, sortQuestionsByOrderThenId } from "@/lib/api/exam-order";
import { jsonError } from "@/lib/api/json";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import type { TranslatedText } from "@/types/database";

/**
 * What a learner receives when an exam starts (or resumes). Options never carry
 * `is_correct`: they are read through the `options_public` view.
 */
export type ExamPaper = {
  attemptId: string;
  startedAt: string;
  deadline: string | null;
  questions: {
    id: string;
    content: TranslatedText;
    options: { id: string; content: TranslatedText }[];
  }[];
};

type QuestionRow = {
  id: string;
  order_index: number | null;
  content: TranslatedText;
  options: { id: string; content: TranslatedText }[] | null;
};

/** Thrown by `loadPaper` so route handlers can map it with `responseFromPostgrestError`. */
export class PaperLoadError extends Error {
  constructor(readonly postgrest: PostgrestError) {
    super(postgrest.message);
  }
}

/**
 * Load the questions of a paper. With `{ examId }` they follow `order_index`; with an id
 * list (final exam session) they keep the list order. Options are sorted by id so a
 * reload shows the same layout.
 */
export async function loadPaper(
  supabase: SupabaseClient,
  questionIds: string[] | { examId: string },
): Promise<ExamPaper["questions"]> {
  const base = supabase
    .from("questions")
    .select("id, order_index, content, options:options_public(id, content)");

  const byExam = !Array.isArray(questionIds);
  if (!byExam && questionIds.length === 0) return [];

  const { data, error } = byExam
    ? await base.eq("exam_id", questionIds.examId)
    : await base.in("id", questionIds);

  if (error) throw new PaperLoadError(error);

  const rows = (data ?? []) as QuestionRow[];
  let ordered: QuestionRow[];
  if (byExam) {
    ordered = sortQuestionsByOrderThenId(rows);
  } else {
    const byId = new Map(rows.map((row) => [row.id, row]));
    ordered = questionIds.map((id) => byId.get(id)).filter((row): row is QuestionRow => Boolean(row));
  }

  return ordered.map((row) => ({
    id: row.id,
    content: row.content,
    options: sortOptionsById(row.options ?? []).map((o) => ({ id: o.id, content: o.content })),
  }));
}

/** Deadline shown to the learner: start + limit (the server adds a 2-minute grace). */
export function paperDeadline(startedAt: string, limitMinutes: number | null | undefined): string | null {
  if (!limitMinutes || limitMinutes <= 0) return null;
  return new Date(new Date(startedAt).getTime() + limitMinutes * 60_000).toISOString();
}

/**
 * Domain errors raised by start_exam_attempt / submit_exam_attempt / start_final_exam /
 * submit_final_exam. The response `error.code` is the domain key itself.
 */
const EXAM_ERRORS: Record<string, [number, string]> = {
  exam_not_found: [404, "Exam not found."],
  course_not_found: [404, "Course not found."],
  final_exam_not_configured: [404, "This course has no final exam."],
  not_enrolled: [403, "Not enrolled in this course."],
  module_locked: [403, "Pass the previous module first."],
  modules_not_passed: [403, "All module exams must be passed first."],
  max_attempts_reached: [409, "Maximum attempts reached for this exam."],
  not_enough_questions: [409, "Not enough questions for the final exam."],
  no_questions: [409, "This exam has no questions."],
  no_open_attempt: [409, "This attempt was already submitted."],
  unknown_question: [400, "Unknown question id in answers."],
  invalid_answers: [400, "Invalid attempt payload."],
};

export function examRpcErrorResponse(error: PostgrestError) {
  const message = error.message ?? "";
  if (message.includes("not authenticated")) {
    return jsonError("unauthorized", "Authentication required.", 401);
  }
  const key = Object.keys(EXAM_ERRORS).find((k) => message.includes(k));
  if (key) {
    const [status, text] = EXAM_ERRORS[key];
    return jsonError(key, text, status);
  }
  return responseFromPostgrestError(error);
}
