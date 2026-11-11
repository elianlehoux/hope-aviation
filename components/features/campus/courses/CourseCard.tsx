"use client";

import Link from "next/link";
import { ArrowRight, Award, BookOpen } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { CourseSummary, MyCourse } from "@/lib/campus/home";
import { CourseCover } from "./CourseCover";

export function CourseCard({ course }: { course: CourseSummary | MyCourse }) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const mine = "status" in course;
  const title = getLocalizedText(course.title, lang);
  const description = course.description ? getLocalizedText(course.description, lang) : "";
  const href = mine && course.status === "active" ? `/campus/courses/${course.id}/learn` : `/campus/courses/${course.id}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white transition-shadow hover:shadow-[0_12px_28px_rgba(0,38,62,0.08)]"
    >
      <div className="relative aspect-[16/9]">
        <CourseCover src={course.thumbnailUrl} alt={title} seed={course.id} />
        {mine && course.status === "completed" ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-highlight px-2.5 py-1 text-xs font-semibold text-primary">
            <Award className="size-3.5" aria-hidden /> {es ? "Completado" : "Completed"}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-xs font-medium text-primary/65">
          <BookOpen className="size-3.5" aria-hidden />
          {course.moduleCount} {es ? "módulos" : "modules"} · {course.lessonCount} {es ? "clases" : "lessons"}
        </p>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-primary">{title}</h3>
        {description && description !== "—" ? (
          <p className="mt-1.5 line-clamp-2 text-sm text-primary/65">{description}</p>
        ) : null}
        <div className="mt-auto pt-5">
          {mine && course.status === "active" ? (
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary/10">
                <div className="h-full rounded-full bg-accent" style={{ width: `${course.progress}%` }} />
              </div>
              <span className="text-xs font-semibold tabular-nums text-primary/70">{course.progress}%</span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              {mine ? (es ? "Ver curso" : "View course") : es ? "Ver detalles" : "View details"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
