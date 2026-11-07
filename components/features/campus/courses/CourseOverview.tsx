"use client";

import Link from "next/link";
import { ArrowLeft, Award, ClipboardCheck, Clock, FileText, Layers, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { TranslatedText } from "@/types/database";
import { EnrollmentAction } from "@/components/features/campus/EnrollmentAction";
import { CourseCover } from "./CourseCover";

export type CourseOverviewData = {
  id: string;
  title: TranslatedText;
  description: TranslatedText | null;
  thumbnail_url: string | null;
  final_exam_question_count: number | null;
  subjects: {
    id: string;
    title: TranslatedText;
    description: TranslatedText | null;
    classes: { id: string; title: TranslatedText; duration_minutes: number | null; video_url: string | null; has_content: boolean | null }[];
    exams: { id: string; title: TranslatedText }[];
  }[];
};

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function CourseOverview({
  course,
  enrollmentStatus,
}: {
  course: CourseOverviewData;
  enrollmentStatus: "active" | "completed" | "cancelled" | null;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const title = getLocalizedText(course.title, lang);
  const description = course.description ? getLocalizedText(course.description, lang) : "";
  const subjects = course.subjects ?? [];
  const lessons = subjects.flatMap((s) => s.classes ?? []);
  const minutes = lessons.reduce((n, c) => n + (c.duration_minutes ?? 0), 0);
  const enrolled = enrollmentStatus === "active" || enrollmentStatus === "completed";

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-16">
      <Link href="/campus/courses" className="relative inline-flex items-center gap-1.5 text-sm font-medium text-primary/65 after:absolute after:-inset-x-2 after:-inset-y-3 hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden />
        {es ? "Cursos" : "Courses"}
      </Link>

      <section className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="space-y-5">
          {enrollmentStatus === "completed" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-highlight px-3 py-1 text-xs font-semibold text-primary">
              <Award className="size-3.5" aria-hidden /> {es ? "Curso completado" : "Course completed"}
            </span>
          ) : null}
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-primary sm:text-5xl">{title}</h1>
          {description && description !== "—" ? <p className="max-w-[55ch] text-lg text-primary/65">{description}</p> : null}
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-primary/65">
            <li className="inline-flex items-center gap-1.5">
              <Layers className="size-4" aria-hidden /> {subjects.length} {es ? "módulos" : "modules"}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <FileText className="size-4" aria-hidden /> {lessons.length} {es ? "clases" : "lessons"}
            </li>
            {minutes > 0 ? (
              <li className="inline-flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden /> {formatDuration(minutes)}
              </li>
            ) : null}
            {(course.final_exam_question_count ?? 0) > 0 ? (
              <li className="inline-flex items-center gap-1.5">
                <Award className="size-4" aria-hidden /> {es ? "Certificado" : "Certificate"}
              </li>
            ) : null}
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <EnrollmentAction courseId={course.id} isEnrolled={enrolled} />
            {enrollmentStatus === "completed" ? (
              <Button asChild variant="outline" size="lg">
                <Link href="/campus/certificates">{es ? "Ver certificado" : "View certificate"}</Link>
              </Button>
            ) : null}
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl">
          <div className="aspect-[4/3]">
            <CourseCover src={course.thumbnail_url} alt={title} seed={course.id} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-primary">{es ? "Contenido" : "Curriculum"}</h2>
        <ol className="space-y-3">
          {subjects.map((subject, i) => (
            <li key={subject.id} className="rounded-2xl border border-primary/10 bg-white p-5 sm:p-6">
              <p className="text-xs font-semibold text-primary/65">
                {es ? "Módulo" : "Module"} {i + 1}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold text-primary">{getLocalizedText(subject.title, lang)}</h3>
              {subject.description ? (
                <p className="mt-1 text-sm text-primary/65">{getLocalizedText(subject.description, lang)}</p>
              ) : null}
              <ul className="mt-4 divide-y divide-primary/5">
                {(subject.classes ?? []).map((c) => (
                  <li key={c.id} className="flex items-center gap-3 py-2.5 text-sm text-primary/80">
                    {c.video_url ? (
                      <PlayCircle className="size-4 shrink-0 text-primary/65" aria-label="Video" />
                    ) : (
                      <FileText className="size-4 shrink-0 text-primary/65" aria-label={es ? "Lectura" : "Reading"} />
                    )}
                    <span className="flex-1">{getLocalizedText(c.title, lang)}</span>
                    {c.duration_minutes ? <span className="text-xs tabular-nums text-primary/65">{c.duration_minutes} min</span> : null}
                  </li>
                ))}
                {(subject.exams ?? []).map((e) => (
                  <li key={e.id} className="flex items-center gap-3 py-2.5 text-sm text-primary/80">
                    <ClipboardCheck className="size-4 shrink-0 text-primary/65" aria-hidden />
                    <span className="flex-1">{getLocalizedText(e.title, lang)}</span>
                    <span className="text-xs text-primary/65">{es ? "Evaluación" : "Assessment"}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
