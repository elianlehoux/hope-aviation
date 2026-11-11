"use client";

import Link from "next/link";
import { ArrowRight, Award, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { ExamOutcome, ExamRunnerProps } from "./types";

/** Result: big score, pass state, "X de Y correctas" and one clear next step. Never the key. */
export function ExamResult({
  kind,
  courseId,
  outcome,
  passingScore,
  next,
  attemptsLeft,
  courseCompleted,
  onRetry,
}: {
  kind: ExamRunnerProps["kind"];
  courseId: string;
  outcome: ExamOutcome;
  passingScore: number;
  next: ExamRunnerProps["next"];
  /** null = unlimited. */
  attemptsLeft: number | null;
  /** The pass also completed the course (course without a final exam). */
  courseCompleted: boolean;
  onRetry: () => void;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const score = Math.round(outcome.score);
  const canRetry = attemptsLeft === null || attemptsLeft > 0;
  const finalPassed = (kind === "final" && outcome.passed) || courseCompleted;

  return (
    <div className="text-center">
      {finalPassed ? (
        <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-highlight text-primary">
          <Award className="size-7" aria-hidden />
        </span>
      ) : null}
      <p className="text-sm font-semibold text-primary/65">
        {finalPassed ? (es ? "¡Curso completado!" : "Course completed!") : es ? "Tu nota" : "Your score"}
      </p>
      <p className="mt-2 font-display text-[5.5rem] font-semibold leading-none tracking-tight text-primary tabular-nums sm:text-[7rem]">
        {score}
        <span className="text-[0.45em] text-primary/65">%</span>
      </p>
      <p
        className={cn(
          "mt-5 inline-flex items-center rounded-full px-3.5 py-1 text-sm font-semibold",
          outcome.passed ? "bg-success/10 text-success" : "bg-primary/[0.06] text-primary/75",
        )}
      >
        {outcome.passed ? (es ? "Aprobado" : "Passed") : es ? "No aprobado" : "Not passed"}
      </p>
      <p className="mt-4 text-[15px] text-primary/70">
        {es
          ? `${outcome.correct} de ${outcome.total} correctas · nota mínima ${passingScore}%`
          : `${outcome.correct} of ${outcome.total} correct · passing score ${passingScore}%`}
      </p>

      <div className="mx-auto mt-10 flex max-w-sm flex-col gap-3">
        {finalPassed ? (
          <Button asChild size="lg">
            <Link href={`/campus/certificates?new=${courseId}`}>
              <Award className="size-4" aria-hidden />
              {es ? "Ver certificado" : "View certificate"}
            </Link>
          </Button>
        ) : outcome.passed ? (
          next ? (
            <Button asChild size="lg" className="max-w-full">
              <Link href={next.href}>
                {es ? "Seguir: " : "Continue: "}
                <span className="min-w-0 truncate">{getLocalizedText(next.title, lang)}</span>
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href={`/campus/courses/${courseId}`}>
                {es ? "Volver al curso" : "Back to the course"}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          )
        ) : canRetry ? (
          <>
            <Button size="lg" onClick={onRetry}>
              <RotateCcw className="size-4" aria-hidden />
              {attemptsLeft === null
                ? es
                  ? "Reintentar"
                  : "Try again"
                : es
                  ? `Reintentar (te ${attemptsLeft === 1 ? "queda 1" : `quedan ${attemptsLeft}`})`
                  : `Try again (${attemptsLeft} left)`}
            </Button>
            <p className="text-xs text-primary/65">
              {es
                ? "Antes de volver a rendir, podés repasar las clases del módulo."
                : "Before trying again, you can review the module's lessons."}
            </p>
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-primary/10 bg-white p-4 text-left">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Mail className="size-4" aria-hidden />
                {es ? "Escribile a tu instructor" : "Write to your instructor"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-primary/65">
                {es
                  ? "Usaste todos tus intentos. Tu instructor puede ayudarte a ver cómo seguir."
                  : "You've used all your attempts. Your instructor can help you figure out next steps."}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/campus/courses/${courseId}`}>{es ? "Volver al curso" : "Back to the course"}</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
