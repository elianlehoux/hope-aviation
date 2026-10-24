"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock, Download, FileText, Lock, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import { getYoutubeId } from "@/lib/utils/youtube";
import { readingMinutes } from "@/lib/campus/lesson-blocks";
import { toggleLessonCompletion } from "@/actions/courses";
import type { TranslatedText } from "@/types/database";
import { YouTubePlayer } from "@/components/features/campus/learning/YouTubePlayer";
import { LessonMarkdown } from "@/components/features/campus/lesson/LessonMarkdown";

type NavTarget = { href: string; title: TranslatedText; locked: boolean; kind: string } | null;

export type LessonViewProps = {
  courseId: string;
  lesson: {
    id: string;
    title: TranslatedText;
    description: TranslatedText | null;
    videoUrl: string | null;
    resourceUrl: string | null;
    durationMinutes: number | null;
    content: TranslatedText | null;
  };
  module: { index: number; title: TranslatedText };
  completed: boolean;
  previous: NavTarget;
  next: NavTarget;
};

function pickText(text: TranslatedText | null, lang: "es" | "en") {
  if (!text) return "";
  return text[lang]?.trim() || text[lang === "es" ? "en" : "es"]?.trim() || "";
}

export function LessonView({ courseId, lesson, module, completed, previous, next }: LessonViewProps) {
  const { lang } = useTranslation();
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [done, setDone] = React.useState(completed);

  React.useEffect(() => setDone(completed), [completed, lesson.id]);

  const es = lang === "es";
  const body = pickText(lesson.content, lang);
  const description = pickText(lesson.description, lang);
  const videoId = lesson.videoUrl ? getYoutubeId(lesson.videoUrl) : null;
  const reading = body ? readingMinutes(body) : 0;

  const complete = (goNext: boolean) =>
    startTransition(async () => {
      const res = await toggleLessonCompletion(courseId, lesson.id, goNext ? true : !done);
      if (!res.success) {
        toast.error(es ? "No pudimos guardar tu progreso." : "We couldn't save your progress.");
        return;
      }
      setDone(goNext ? true : !done);
      if (goNext && next && !next.locked) router.push(next.href);
      else router.refresh();
    });

  return (
    <article className="mx-auto w-full max-w-[46rem] px-5 pb-32 pt-8 sm:px-8 lg:pt-12">
      <header className="mb-8">
        <p className="text-sm font-medium text-primary/55">
          {es ? "Módulo" : "Module"} {module.index + 1} · {getLocalizedText(module.title, lang)}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl">
          {getLocalizedText(lesson.title, lang)}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-primary/60">
          {videoId ? (
            <span className="inline-flex items-center gap-1.5">
              <PlayCircle className="size-4" aria-hidden /> Video
              {lesson.durationMinutes ? ` · ${lesson.durationMinutes} min` : ""}
            </span>
          ) : null}
          {body ? (
            <span className="inline-flex items-center gap-1.5">
              <FileText className="size-4" aria-hidden />
              {es ? `Lectura · ${reading} min` : `Reading · ${reading} min`}
            </span>
          ) : null}
          {!videoId && !body && lesson.durationMinutes ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> {lesson.durationMinutes} min
            </span>
          ) : null}
          {done ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-success">
              <Check className="size-4" aria-hidden /> {es ? "Completada" : "Completed"}
            </span>
          ) : null}
        </div>
      </header>

      {videoId ? (
        <div className="mb-10 overflow-hidden rounded-2xl bg-primary shadow-sm">
          <YouTubePlayer videoId={videoId} />
        </div>
      ) : null}

      {body ? (
        <LessonMarkdown source={body} />
      ) : description ? (
        <p className="text-[17px] leading-[1.75] text-primary/85">{description}</p>
      ) : null}

      {lesson.resourceUrl ? (
        <a
          href={lesson.resourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-10 flex items-center gap-4 rounded-2xl border border-primary/10 bg-white p-4 transition-colors hover:border-primary/25"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-paper-deep text-primary">
            <Download className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-primary">{es ? "Material de la clase" : "Class material"}</span>
            <span className="block truncate text-xs text-primary/55">{lesson.resourceUrl.split("/").pop()}</span>
          </span>
        </a>
      ) : null}

      <footer className="mt-14 border-t border-primary/10 pt-8">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {previous ? (
            <Button asChild variant="ghost" className="justify-start text-primary/70">
              <Link href={previous.href}>
                <ArrowLeft className="size-4" aria-hidden />
                {es ? "Anterior" : "Previous"}
              </Link>
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              onClick={() => complete(false)}
              disabled={pending}
              className={cn(done && "border-success/30 text-success")}
            >
              <Check className="size-4" aria-hidden />
              {done ? (es ? "Completada" : "Completed") : es ? "Marcar como completada" : "Mark as complete"}
            </Button>
            {next ? (
              next.locked ? (
                <Button disabled>
                  <Lock className="size-4" aria-hidden />
                  {es ? "Aprobá la evaluación para seguir" : "Pass the assessment to continue"}
                </Button>
              ) : (
                <Button onClick={() => complete(true)} disabled={pending} size="lg">
                  {es ? "Completar y seguir" : "Complete and continue"}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              )
            ) : null}
          </div>
        </div>
        {next && !next.locked ? (
          <p className="mt-4 text-right text-xs text-primary/50">
            {es ? "Sigue: " : "Up next: "}
            <span className="font-medium text-primary/70">{getLocalizedText(next.title, lang)}</span>
          </p>
        ) : null}
      </footer>
    </article>
  );
}
