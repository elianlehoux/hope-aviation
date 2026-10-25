"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ClipboardList, Eye, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/features/campus/ui/empty-state";
import { useTranslation } from "@/lib/i18n/context";
import { startExam, submitExam, type ExamErrorCode } from "./api";
import { ExamIntro } from "./ExamIntro";
import { ExamMap } from "./ExamMap";
import { ExamQuestion } from "./ExamQuestion";
import { ExamResult } from "./ExamResult";
import { ExamReview } from "./ExamReview";
import { ExamTimer } from "./ExamTimer";
import { readExamAnswers, useExamSession } from "./use-exam-session";
import type { ExamOutcome, ExamPaper, ExamRunnerProps } from "./types";

type Phase =
  | { name: "intro" }
  | { name: "resuming" }
  | { name: "running" }
  | { name: "review" }
  | { name: "result"; outcome: ExamOutcome; attemptsLeft: number | null }
  | { name: "closed" }
  | { name: "unavailable" };

/** Grace the server allows after the deadline (start_exam_attempt / submit). */
const GRACE_MS = 2 * 60_000;

/**
 * Learner exam runner: intro → running → review → result. The attempt starts on the server
 * (deadline included); answers live in sessionStorage per attempt, so a reload resumes the
 * same attempt with its answers and the clock keeps running from the server start time.
 */
export function ExamRunner({
  kind,
  courseId,
  startUrl,
  submitUrl,
  intro,
  next,
  openAttemptStartedAt,
  preview,
}: ExamRunnerProps) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();

  const unavailable = intro.questionCount === 0;
  const [phase, setPhase] = React.useState<Phase>(() =>
    unavailable
      ? { name: "unavailable" }
      : openAttemptStartedAt && !preview
        ? { name: "resuming" }
        : { name: "intro" },
  );
  const [paper, setPaper] = React.useState<ExamPaper | null>(null);
  const [index, setIndex] = React.useState(0);
  const [offsetMs, setOffsetMs] = React.useState(0);
  const [starting, setStarting] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [outOfAttempts, setOutOfAttempts] = React.useState(false);

  const { answers, setAnswer, clear } = useExamSession(preview ? null : (paper?.attemptId ?? null));
  const answersRef = React.useRef(answers);
  const submittingRef = React.useRef(false);
  React.useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const noAttemptsLeft =
    outOfAttempts || (intro.maxAttempts !== null && intro.attemptsUsed >= intro.maxAttempts);

  const goTo = React.useCallback((i: number, nextPhase: Phase["name"] = "running") => {
    setIndex(i);
    setPhase(nextPhase === "review" ? { name: "review" } : { name: "running" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const startErrorNotice = React.useCallback(
    (code: ExamErrorCode): string | null => {
      switch (code) {
        case "module_locked":
          return es ? "Primero aprobá el módulo anterior." : "Pass the previous module first.";
        case "modules_not_passed":
          return es
            ? "El examen final se habilita cuando aprobás todos los módulos."
            : "The final exam opens once you pass every module.";
        case "not_enrolled":
          return es ? "Necesitás estar inscripto en el curso." : "You need to be enrolled in the course.";
        case "network":
          return es ? "Sin conexión. Revisá tu internet y probá de nuevo." : "You're offline. Check your connection and try again.";
        default:
          return es ? "No pudimos empezar el examen. Probá de nuevo." : "We couldn't start the exam. Please try again.";
      }
    },
    [es],
  );

  const begin = React.useCallback(async () => {
    setNotice(null);
    setStarting(true);
    // Staff preview: the start routes return the paper without opening an attempt.
    const res = await startExam(preview ? `${startUrl}?preview=1` : startUrl);
    setStarting(false);
    if (!res.ok) {
      if (res.code === "max_attempts_reached") {
        setOutOfAttempts(true);
        setPhase({ name: "intro" });
      } else if (
        res.code === "no_questions" ||
        res.code === "not_enough_questions" ||
        res.code === "final_exam_not_configured"
      ) {
        setPhase({ name: "unavailable" });
      } else {
        setNotice(startErrorNotice(res.code));
        setPhase({ name: "intro" });
        if (res.code === "module_locked" || res.code === "modules_not_passed") router.refresh();
      }
      return;
    }
    const started = res.data;
    if (!started?.questions?.length) {
      setPhase({ name: "unavailable" });
      return;
    }
    setOffsetMs(res.serverNow ? res.serverNow - Date.now() : 0);
    setPaper(started);
    if (preview) {
      goTo(0);
      return;
    }
    // Resume on the first unanswered question.
    const stored = readExamAnswers(started.attemptId);
    const firstOpen = started.questions.findIndex((q) => !stored[q.id]);
    goTo(firstOpen === -1 ? started.questions.length - 1 : firstOpen);
  }, [goTo, preview, router, startErrorNotice, startUrl]);

  // An attempt left open (reload, closed tab) resumes on its own unless it is already expired.
  const resumeChecked = React.useRef(false);
  React.useEffect(() => {
    if (resumeChecked.current || phase.name !== "resuming" || !openAttemptStartedAt) return;
    resumeChecked.current = true;
    const limit = intro.timeLimitMinutes;
    const expired = limit !== null && Date.now() > Date.parse(openAttemptStartedAt) + limit * 60_000 + GRACE_MS;
    if (expired) {
      queueMicrotask(() => setPhase({ name: "intro" }));
      return;
    }
    void begin();
  }, [begin, intro.timeLimitMinutes, openAttemptStartedAt, phase.name]);

  const submit = React.useCallback(async () => {
    if (!paper || preview || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    const ids = new Set(paper.questions.map((q) => q.id));
    const payload = Object.fromEntries(Object.entries(answersRef.current).filter(([qid]) => ids.has(qid)));
    const res = await submitExam(submitUrl, payload, paper.questions.length);
    submittingRef.current = false;
    setSubmitting(false);

    if (!res.ok) {
      if (res.code === "no_open_attempt") {
        clear();
        setPaper(null);
        setPhase({ name: "closed" });
        router.refresh();
        return;
      }
      toast.error(
        res.code === "network"
          ? es
            ? "Sin conexión. Tus respuestas siguen guardadas; probá enviar de nuevo."
            : "You're offline. Your answers are still saved; try sending again."
          : es
            ? "No pudimos enviar tus respuestas. Probá de nuevo."
            : "We couldn't send your answers. Please try again.",
      );
      return;
    }

    const attemptsLeft = intro.maxAttempts === null ? null : Math.max(0, intro.maxAttempts - (intro.attemptsUsed + 1));
    clear();
    setPaper(null);
    setPhase({ name: "result", outcome: res.data, attemptsLeft });
    window.scrollTo({ top: 0 });
    router.refresh();
  }, [clear, es, intro.attemptsUsed, intro.maxAttempts, paper, preview, router, submitUrl]);

  const onExpire = React.useCallback(() => {
    toast.info(es ? "Se terminó el tiempo. Enviamos tus respuestas." : "Time's up. We sent your answers.");
    void submit();
  }, [es, submit]);

  const retry = () => {
    setNotice(null);
    setPhase({ name: "intro" });
    window.scrollTo({ top: 0 });
  };

  const shell = (children: React.ReactNode) => (
    <div className="mx-auto w-full max-w-[44rem] px-5 pb-28 pt-8 sm:px-8 lg:pt-12">{children}</div>
  );

  if (phase.name === "unavailable") {
    return shell(
      <EmptyState
        icon={ClipboardList}
        title={es ? "Este examen todavía no está disponible" : "This exam isn't available yet"}
        description={
          es
            ? "Tu instructor todavía está preparando las preguntas. Volvé a mirar más adelante."
            : "Your instructor is still preparing the questions. Check back later."
        }
        action={
          <Button asChild variant="outline">
            <Link href={`/campus/courses/${courseId}`}>{es ? "Volver al curso" : "Back to the course"}</Link>
          </Button>
        }
      />,
    );
  }

  if (phase.name === "resuming") {
    return shell(
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-primary/65" role="status">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <p className="text-sm font-medium">{es ? "Retomando tu examen…" : "Resuming your exam…"}</p>
      </div>,
    );
  }

  if (phase.name === "closed") {
    return shell(
      <EmptyState
        icon={MailCheck}
        title={es ? "Este intento ya se envió" : "This attempt was already sent"}
        description={
          es
            ? "Puede que lo hayas enviado desde otra pestaña. Tu nota ya quedó registrada."
            : "You may have sent it from another tab. Your score is already saved."
        }
        action={
          <Button onClick={retry} variant="outline">
            {es ? "Ver el examen" : "See the exam"}
          </Button>
        }
      />,
    );
  }

  if (phase.name === "result") {
    return shell(
      <ExamResult
        kind={kind}
        courseId={courseId}
        outcome={phase.outcome}
        passingScore={intro.passingScore}
        next={next}
        attemptsLeft={phase.attemptsLeft}
        onRetry={retry}
      />,
    );
  }

  if (phase.name === "intro" || !paper) {
    return shell(
      <ExamIntro
        kind={kind}
        courseId={courseId}
        intro={intro}
        next={next}
        noAttemptsLeft={noAttemptsLeft}
        starting={starting}
        notice={notice}
        preview={preview}
        onStart={() => void begin()}
      />,
    );
  }

  const questions = paper.questions;
  const total = questions.length;
  const question = questions[Math.min(index, total - 1)];
  const last = index >= total - 1;
  const timer =
    paper.deadline && !preview ? <ExamTimer deadline={paper.deadline} offsetMs={offsetMs} onExpire={onExpire} /> : null;

  if (phase.name === "review") {
    return shell(
      <>
        {timer ? <div className="mb-6 flex justify-end">{timer}</div> : null}
        <ExamReview
          questions={questions}
          answers={answers}
          submitting={submitting}
          onJump={(i) => goTo(i)}
          onBack={() => goTo(index)}
          onSubmit={submit}
        />
      </>,
    );
  }

  return shell(
    <>
      {preview ? (
        <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-highlight/20 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-highlight">
          <Eye className="size-3.5" aria-hidden />
          {es ? "Vista previa: solo lectura" : "Preview: read only"}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-primary/70" aria-live="polite">
          {es ? `Pregunta ${index + 1} de ${total}` : `Question ${index + 1} of ${total}`}
        </p>
        {timer}
      </div>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/10"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-label={es ? "Progreso del examen" : "Exam progress"}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <div className="mt-8" key={question.id}>
        <ExamQuestion
          question={question}
          number={index + 1}
          selected={preview ? undefined : answers[question.id]}
          onSelect={(optionId) => setAnswer(question.id, optionId)}
          readOnly={preview}
        />
      </div>

      <div className="mt-10 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => goTo(index - 1)} disabled={index === 0}>
          <ArrowLeft className="size-4" aria-hidden />
          {es ? "Anterior" : "Previous"}
        </Button>
        {last ? (
          preview ? (
            <Button variant="outline" onClick={retry}>
              {es ? "Terminar vista previa" : "End preview"}
            </Button>
          ) : (
            <Button size="lg" onClick={() => goTo(index, "review")}>
              {es ? "Revisar y enviar" : "Review and send"}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          )
        ) : (
          <Button variant={answers[question.id] ? "default" : "outline"} size="lg" onClick={() => goTo(index + 1)}>
            {es ? "Siguiente" : "Next"}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        )}
      </div>

      <div className="mt-12 border-t border-primary/10 pt-6">
        <ExamMap questions={questions} answers={preview ? {} : answers} current={index} onJump={(i) => goTo(i)} />
        {!preview ? (
          <button
            type="button"
            onClick={() => goTo(index, "review")}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {es ? "Ir a la revisión" : "Go to review"}
            <ArrowRight className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>
    </>,
  );
}
