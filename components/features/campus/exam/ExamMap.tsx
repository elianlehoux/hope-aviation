"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import type { PaperQuestion } from "./types";

/** Question map: one numbered dot per question; filled = answered, ring = current. */
export function ExamMap({
  questions,
  answers,
  current,
  onJump,
}: {
  questions: PaperQuestion[];
  answers: Record<string, string>;
  current: number;
  onJump: (index: number) => void;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const answered = questions.filter((q) => answers[q.id]).length;

  return (
    <nav aria-label={es ? "Mapa de preguntas" : "Question map"}>
      <p className="mb-2 text-xs font-medium text-primary/55">
        {es ? `${answered} de ${questions.length} respondidas` : `${answered} of ${questions.length} answered`}
      </p>
      <ol className="flex flex-wrap gap-1.5">
        {questions.map((q, i) => {
          const done = Boolean(answers[q.id]);
          const active = i === current;
          return (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-current={active ? "step" : undefined}
                aria-label={
                  es
                    ? `Pregunta ${i + 1}, ${done ? "respondida" : "sin responder"}`
                    : `Question ${i + 1}, ${done ? "answered" : "unanswered"}`
                }
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/40",
                  done ? "bg-primary text-white" : "bg-white text-primary/60",
                  active
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-paper"
                    : !done && "ring-1 ring-inset ring-primary/15 hover:ring-primary/35",
                )}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
