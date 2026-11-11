import type { ManageCourseTree } from "./manage";

/**
 * Publish checklist for a course. Pure (types only) so it runs in unit tests and on
 * both server and client. Every issue links to the place where it gets fixed.
 */

export type ChecklistIssue = {
  code:
    | "no_modules"
    | "module_without_classes"
    | "class_without_content"
    | "exam_without_questions"
    | "question_invalid"
    | "final_exceeds_pool";
  href: string;
  label: { es: string; en: string };
};

type Text = { es?: string; en?: string } | null | undefined;

/** A question is answerable when it has at least two options and exactly one correct. */
export function isQuestionValid(options: readonly { is_correct: boolean }[]): boolean {
  return options.length >= 2 && options.filter((o) => o.is_correct).length === 1;
}

/** Question counts stored on each exam of the manage tree. */
export function summarizeQuestions(
  questions: readonly { options: readonly { is_correct: boolean }[] | null }[],
): { questionCount: number; invalidQuestionCount: number } {
  return {
    questionCount: questions.length,
    invalidQuestionCount: questions.filter((q) => !isQuestionValid(q.options ?? [])).length,
  };
}

function name(text: Text, lang: "es" | "en", fallback: string): string {
  const other = lang === "es" ? "en" : "es";
  return text?.[lang]?.trim() || text?.[other]?.trim() || fallback;
}

export function publishChecklist(
  tree: ManageCourseTree,
  finalQuestionCount: number | null,
): ChecklistIssue[] {
  const base = `/campus/admin/courses/${tree.course.id}`;

  if (tree.subjects.length === 0) {
    return [
      {
        code: "no_modules",
        href: base,
        label: { es: "Agregá al menos un módulo", en: "Add at least one module" },
      },
    ];
  }

  const issues: ChecklistIssue[] = [];
  let pool = 0;

  tree.subjects.forEach((subject, i) => {
    const m = {
      es: name(subject.title, "es", `Módulo ${i + 1}`),
      en: name(subject.title, "en", `Module ${i + 1}`),
    };

    if (subject.classes.length === 0) {
      issues.push({
        code: "module_without_classes",
        href: `${base}?item=module:${subject.id}`,
        label: { es: `«${m.es}» no tiene clases`, en: `“${m.en}” has no classes` },
      });
    }

    subject.classes.forEach((c, j) => {
      if (c.video_url?.trim() || c.has_content) return;
      issues.push({
        code: "class_without_content",
        href: `${base}?item=class:${c.id}`,
        label: {
          es: `«${name(c.title, "es", `Clase ${j + 1}`)}» no tiene video ni texto`,
          en: `“${name(c.title, "en", `Class ${j + 1}`)}” has no video or text`,
        },
      });
    });

    subject.exams.forEach((e) => {
      pool += e.questionCount;
      const exam = { es: name(e.title, "es", m.es), en: name(e.title, "en", m.en) };
      const href = `${base}/exams/${e.id}`;
      if (e.questionCount === 0) {
        issues.push({
          code: "exam_without_questions",
          href,
          label: { es: `«${exam.es}» no tiene preguntas`, en: `“${exam.en}” has no questions` },
        });
      } else if (e.invalidQuestionCount > 0) {
        const n = e.invalidQuestionCount;
        issues.push({
          code: "question_invalid",
          href,
          label: {
            es: `«${exam.es}»: ${n} ${n === 1 ? "pregunta necesita" : "preguntas necesitan"} 2 opciones y una sola correcta`,
            en: `“${exam.en}”: ${n} ${n === 1 ? "question needs" : "questions need"} 2 options and exactly one correct`,
          },
        });
      }
    });
  });

  if (finalQuestionCount && finalQuestionCount > pool) {
    issues.push({
      code: "final_exceeds_pool",
      href: `${base}/settings`,
      label: {
        es: `El examen final pide ${finalQuestionCount} preguntas y el curso tiene ${pool}`,
        en: `The final exam asks for ${finalQuestionCount} questions but the course has ${pool}`,
      },
    });
  }

  return issues;
}
