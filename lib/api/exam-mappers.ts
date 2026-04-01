import type { Option, Question } from "@/types/database";

export type OptionPublic = Omit<Option, "is_correct">;

export type QuestionWithOptions = Question & { options: Option[] };

export type QuestionWithOptionsPublic = Question & { options: OptionPublic[] };

export function stripOptionsForStudent(
  questions: QuestionWithOptions[],
): QuestionWithOptionsPublic[] {
  return questions.map((q) => ({
    ...q,
    options: q.options.map((o) => ({
      id: o.id,
      question_id: o.question_id,
      content: o.content,
    })),
  }));
}
