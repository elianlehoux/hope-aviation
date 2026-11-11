"use client";

import * as React from "react";
import { ArrowLeft, Check, CircleDashed, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/features/campus/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { PaperQuestion } from "./types";

/** Review before sending: every question with its answered state; confirms when some are blank. */
export function ExamReview({
  questions,
  answers,
  submitting,
  onJump,
  onBack,
  onSubmit,
}: {
  questions: PaperQuestion[];
  answers: Record<string, string>;
  submitting: boolean;
  onJump: (index: number) => void;
  onBack: () => void;
  onSubmit: () => Promise<void>;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const [confirming, setConfirming] = React.useState(false);
  const unanswered = questions.filter((q) => !answers[q.id]).length;

  const send = () => {
    if (unanswered > 0) setConfirming(true);
    else void onSubmit();
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-primary sm:text-3xl">
        {es ? "Revisá antes de enviar" : "Review before sending"}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-primary/65">
        {unanswered === 0
          ? es
            ? "Respondiste todas las preguntas. Cuando envíes, no vas a poder cambiar tus respuestas."
            : "You answered every question. Once you send, you can't change your answers."
          : es
            ? `Te ${unanswered === 1 ? "queda 1 pregunta" : `quedan ${unanswered} preguntas`} sin responder. Tocá una para volver.`
            : `${unanswered} ${unanswered === 1 ? "question is" : "questions are"} still unanswered. Tap one to go back.`}
      </p>

      <ol className="mt-6 divide-y divide-primary/8 overflow-hidden rounded-2xl border border-primary/10 bg-white">
        {questions.map((q, i) => {
          const done = Boolean(answers[q.id]);
          return (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => onJump(i)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-paper focus-visible:bg-paper focus-visible:outline-none"
              >
                <span className="w-6 shrink-0 text-sm font-semibold tabular-nums text-primary/65">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-[15px] text-primary/85">
                  {getLocalizedText(q.content, lang)}
                </span>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold",
                    done ? "text-success" : "text-primary/65",
                  )}
                >
                  {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : <CircleDashed className="size-3.5" aria-hidden />}
                  {done ? (es ? "Respondida" : "Answered") : es ? "Sin responder" : "Unanswered"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={onBack} disabled={submitting} className="justify-start">
          <ArrowLeft className="size-4" aria-hidden />
          {es ? "Volver a las preguntas" : "Back to questions"}
        </Button>
        <Button size="lg" onClick={send} disabled={submitting}>
          {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
          {submitting ? (es ? "Enviando…" : "Sending…") : es ? "Enviar respuestas" : "Send answers"}
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={es ? "¿Enviar con preguntas sin responder?" : "Send with unanswered questions?"}
        description={
          es
            ? `Las ${unanswered} sin responder cuentan como incorrectas.`
            : `The ${unanswered} unanswered ${unanswered === 1 ? "question counts" : "questions count"} as wrong.`
        }
        confirmLabel={es ? "Enviar igual" : "Send anyway"}
        onConfirm={onSubmit}
      />
    </div>
  );
}
