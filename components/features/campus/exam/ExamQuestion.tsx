"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { PaperQuestion } from "./types";

const LETTERS = "ABCDEFGHIJ";

/** One question with large, tappable options (native radios for keyboard support). */
export function ExamQuestion({
  question,
  number,
  selected,
  onSelect,
  readOnly,
}: {
  question: PaperQuestion;
  number: number;
  selected: string | undefined;
  onSelect: (optionId: string) => void;
  readOnly?: boolean;
}) {
  const { lang } = useTranslation();
  const name = `q-${question.id}`;

  return (
    <fieldset className="min-w-0">
      <legend className="mb-6 font-display text-[1.375rem] font-semibold leading-snug text-primary sm:text-2xl">
        <span className="sr-only">{lang === "es" ? `Pregunta ${number}. ` : `Question ${number}. `}</span>
        {getLocalizedText(question.content, lang)}
      </legend>
      <div className="space-y-3">
        {question.options.map((option, i) => {
          const checked = selected === option.id;
          return (
            <label
              key={option.id}
              className={cn(
                "group flex min-h-14 cursor-pointer items-center gap-4 rounded-2xl border bg-white px-4 py-3.5 text-left transition-all",
                "has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-accent/30",
                checked
                  ? "border-accent bg-accent/[0.04] shadow-[0_0_0_1px_var(--color-accent)]"
                  : "border-primary/12 hover:border-primary/30",
                readOnly && "cursor-default hover:border-primary/12",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={checked}
                disabled={readOnly}
                onChange={() => onSelect(option.id)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  checked ? "bg-accent text-white" : "bg-paper text-primary/65 group-hover:bg-paper-deep",
                )}
                aria-hidden
              >
                {checked ? <Check className="size-4" strokeWidth={3} /> : LETTERS[i] ?? i + 1}
              </span>
              <span className="min-w-0 flex-1 text-[16px] leading-relaxed text-primary">
                {getLocalizedText(option.content, lang)}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
