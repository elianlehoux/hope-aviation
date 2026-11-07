"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { ExamEditorData } from "@/lib/campus/manage";
import { manageHref } from "../course/api";
import { ExamSettingsForm } from "./ExamSettingsForm";
import { QuestionList } from "./QuestionList";

/** Full-page exam editor: settings on top, inline question list below. */
export function ExamEditor({ data }: { data: ExamEditorData }) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const { exam, courseId } = data;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <header className="space-y-4">
        <Link
          href={manageHref.course(courseId, `exam:${exam.id}`)}
          className="inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-primary/65 hover:text-primary"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{getLocalizedText(data.courseTitle, lang)}</span>
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/65">
            {es ? "Examen" : "Exam"} · {getLocalizedText(data.subjectTitle, lang)}
          </p>
          <h1 className="mt-1 break-words font-display text-3xl font-semibold tracking-tight text-primary md:text-[2.25rem] md:leading-tight">
            {getLocalizedText(exam.title, lang)}
          </h1>
        </div>
      </header>

      <ExamSettingsForm key={JSON.stringify([exam.title, exam.description, exam.passing_score, exam.time_limit_minutes, exam.max_attempts])} courseId={courseId} exam={exam} />

      <QuestionList
        courseId={courseId}
        subjectId={exam.subject_id}
        examId={exam.id}
        questions={data.questions}
        invalidCount={exam.invalidQuestionCount}
      />
    </div>
  );
}
