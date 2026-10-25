"use client";

import Link from "next/link";
import { ArrowRight, Award, Eye, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { ExamIntroData, ExamRunnerProps } from "./types";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white px-4 py-3.5">
      <dt className="text-xs font-medium text-primary/55">{label}</dt>
      <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-primary">{value}</dd>
    </div>
  );
}

/** Preparation screen: what the exam is, the rules, and a single "Empezar". */
export function ExamIntro({
  kind,
  courseId,
  intro,
  next,
  noAttemptsLeft,
  starting,
  notice,
  preview,
  onStart,
}: {
  kind: ExamRunnerProps["kind"];
  courseId: string;
  intro: ExamIntroData;
  next: ExamRunnerProps["next"];
  noAttemptsLeft: boolean;
  starting: boolean;
  notice: string | null;
  preview: boolean;
  onStart: () => void;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const instructions = intro.instructions ? getLocalizedText(intro.instructions, lang) : "";
  const completedCourse = kind === "final" && intro.passed;

  const attempts =
    intro.maxAttempts === null
      ? es
        ? "Sin límite"
        : "Unlimited"
      : `${intro.attemptsUsed} / ${intro.maxAttempts}`;

  return (
    <div>
      {preview ? (
        <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-highlight/20 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-highlight">
          <Eye className="size-3.5" aria-hidden />
          {es ? "Vista previa: no se registran intentos" : "Preview: no attempts are recorded"}
        </p>
      ) : null}

      {intro.eyebrow ? (
        <p className="text-sm font-medium text-primary/55">{getLocalizedText(intro.eyebrow, lang)}</p>
      ) : null}
      <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl">
        {getLocalizedText(intro.title, lang)}
      </h1>
      {instructions && instructions !== "—" ? (
        <p className="mt-4 whitespace-pre-line text-[16px] leading-relaxed text-primary/75">{instructions}</p>
      ) : null}

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact label={es ? "Preguntas" : "Questions"} value={String(intro.questionCount)} />
        <Fact
          label={es ? "Tiempo" : "Time"}
          value={intro.timeLimitMinutes ? `${intro.timeLimitMinutes} min` : es ? "Libre" : "No limit"}
        />
        <Fact label={es ? "Nota mínima" : "Passing score"} value={`${intro.passingScore}%`} />
        <Fact label={es ? "Intentos" : "Attempts"} value={attempts} />
      </dl>

      {intro.bestScore !== null ? (
        <p className="mt-4 text-sm text-primary/65">
          {es ? "Tu mejor nota: " : "Your best score: "}
          <span className="font-semibold tabular-nums text-primary">{Math.round(intro.bestScore)}%</span>
          {intro.passed && kind === "module" ? (
            <span className="ml-2 font-semibold text-success">· {es ? "Aprobada" : "Passed"}</span>
          ) : null}
        </p>
      ) : null}

      {notice ? (
        <p role="alert" className="mt-6 rounded-2xl bg-info px-4 py-3 text-sm leading-relaxed text-primary">
          {notice}
        </p>
      ) : null}

      <div className="mt-10 border-t border-primary/10 pt-8">
        {completedCourse && !preview ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] font-medium text-primary">
              {es ? "Ya completaste este curso." : "You've completed this course."}
            </p>
            <Button asChild size="lg">
              <Link href="/campus/certificates">
                <Award className="size-4" aria-hidden />
                {es ? "Ver certificado" : "View certificate"}
              </Link>
            </Button>
          </div>
        ) : noAttemptsLeft && !preview ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-primary/10 bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Mail className="size-4" aria-hidden />
                {es ? "Sin intentos" : "No attempts left"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-primary/65">
                {es
                  ? "Usaste todos tus intentos. Escribile a tu instructor para ver cómo seguir."
                  : "You've used all your attempts. Write to your instructor to see how to continue."}
              </p>
            </div>
            {intro.passed && next ? (
              <Button asChild size="lg" className="max-w-full">
                <Link href={next.href}>
                  {es ? "Seguir: " : "Continue: "}
                  <span className="min-w-0 truncate">{getLocalizedText(next.title, lang)}</span>
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href={`/campus/courses/${courseId}`}>{es ? "Volver al curso" : "Back to the course"}</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
            <Button size="lg" onClick={onStart} disabled={starting} className="sm:min-w-44">
              {starting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {preview
                ? es
                  ? "Ver preguntas"
                  : "See questions"
                : intro.attemptsUsed > 0
                  ? es
                    ? "Volver a rendir"
                    : "Take it again"
                  : es
                    ? "Empezar"
                    : "Start"}
            </Button>
            <p className="text-sm leading-relaxed text-primary/60">
              {preview
                ? es
                  ? "Ves el examen como el alumno, sin enviar respuestas."
                  : "You see the exam as a learner, without sending answers."
                : intro.timeLimitMinutes
                  ? es
                    ? "El tiempo empieza a correr cuando tocás Empezar. Si se termina, enviamos lo que tengas."
                    : "The clock starts when you tap Start. If time runs out, we send what you have."
                  : es
                    ? "Tus respuestas se guardan mientras avanzás. Enviás todo al final."
                    : "Your answers are kept as you go. You send everything at the end."}
            </p>
          </div>
        )}
        {intro.passed && kind === "module" && next && !noAttemptsLeft && !preview ? (
          <Link
            href={next.href}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            {es ? "Ya la aprobaste. Seguir con el curso" : "Already passed. Continue the course"}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
