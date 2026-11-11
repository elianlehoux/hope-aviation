"use client";

import * as React from "react";
import { Check, X, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import type { CheckData } from "@/lib/campus/lesson-blocks";

/** Ungraded self-check inside a lesson. Nothing is stored. */
export function KnowledgeCheck({ data }: { data: CheckData }) {
  const { lang } = useTranslation();
  const [picked, setPicked] = React.useState<number | null>(null);
  const answered = picked !== null;
  const correct = answered && data.options[picked].correct;

  return (
    <section className="my-8 rounded-2xl border border-primary/10 bg-white p-5 sm:p-6" aria-label={lang === "es" ? "Repaso" : "Quick check"}>
      <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-primary/65">
        <Lightbulb className="size-3.5 text-highlight" aria-hidden />
        {lang === "es" ? "Repaso rápido" : "Quick check"}
      </p>
      <p className="mb-4 font-display text-lg font-semibold text-primary">{data.question}</p>
      <div className="grid gap-2" role="radiogroup">
        {data.options.map((option, i) => {
          const isPicked = picked === i;
          return (
            <button
              key={option.text}
              type="button"
              role="radio"
              aria-checked={isPicked}
              disabled={answered}
              onClick={() => setPicked(i)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                !answered && "border-primary/15 hover:border-primary/40 hover:bg-paper",
                answered && option.correct && "border-success/40 bg-success/5 text-primary",
                answered && isPicked && !option.correct && "border-destructive/40 bg-destructive/5",
                answered && !isPicked && !option.correct && "border-primary/10 text-primary/45",
              )}
            >
              <span>{option.text}</span>
              {answered && option.correct ? <Check className="size-4 shrink-0 text-success" aria-hidden /> : null}
              {answered && isPicked && !option.correct ? <X className="size-4 shrink-0 text-destructive" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
      {answered ? (
        <div className="mt-4 flex items-start justify-between gap-4" aria-live="polite">
          <p className="text-sm text-primary/75">
            <span className={cn("font-semibold", correct ? "text-success" : "text-destructive")}>
              {correct ? (lang === "es" ? "¡Correcto! " : "Correct! ") : lang === "es" ? "No exactamente. " : "Not quite. "}
            </span>
            {data.explanation}
          </p>
          <button type="button" onClick={() => setPicked(null)} className="shrink-0 text-xs font-medium text-primary/65 underline-offset-2 hover:underline">
            {lang === "es" ? "Reintentar" : "Try again"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
