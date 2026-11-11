"use client";

import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import { CampusSurface } from "@/components/features/campus/ui/surface";
import { StatusBadge } from "@/components/features/campus/ui/status-badge";
import type { PersonEnrollment } from "@/lib/campus/people";
import { formatDate } from "./PeopleDirectory";

export function PersonCourses({ enrollments }: { enrollments: PersonEnrollment[] }) {
  const { lang } = useTranslation();
  const es = lang === "es";

  return (
    <CampusSurface className="p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-primary">{es ? "Cursos" : "Courses"}</h2>
      {enrollments.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-primary/65">
          <BookOpen className="size-4" aria-hidden />
          {es ? "Todavía no se inscribió en ningún curso." : "Not enrolled in any course yet."}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-primary/5">
          {enrollments.map((e) => {
            const done = e.status === "completed";
            return (
              <li key={e.courseId} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
                  <p className="min-w-0 font-medium text-primary">{getLocalizedText(e.title, lang)}</p>
                  <StatusBadge status={e.status} />
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <div
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary/10"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={e.progress}
                    aria-label={es ? "Avance" : "Progress"}
                  >
                    <div
                      className={cn("h-full rounded-full", e.progress >= 100 ? "bg-success" : "bg-accent")}
                      style={{ width: `${e.progress}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold tabular-nums text-primary/70">{e.progress}%</span>
                </div>
                {done && e.completedAt ? (
                  <p className="mt-1.5 text-xs text-primary/65">
                    {es ? "Completado el" : "Completed on"} {formatDate(e.completedAt, lang)}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </CampusSurface>
  );
}
