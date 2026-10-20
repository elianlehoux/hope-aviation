"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { CampusSurface } from "@/components/features/campus/ui/surface";

interface StudentCourseCardProps {
  course: {
    id: string;
    title: any;
    description?: any;
    thumbnail_url?: string;
    subjects?: any[] | { count: number };
  };
  enrollment?: {
    status: "active" | "completed";
    progress?: number;
    enrolled_at: string;
  };
  variant?: "active" | "completed" | "available";
}

export function StudentCourseCard({
  course,
  enrollment,
  variant = "available",
}: StudentCourseCardProps) {
  const { t, lang } = useTranslation();
  const title =
    typeof course.title === "string"
      ? course.title
      : course.title?.[lang] || t("courseCard.untitledCourse");
  const description =
    typeof course.description === "string"
      ? course.description
      : course.description?.[lang] || "";

  const isCompleted = variant === "completed";
  const isActive = variant === "active";
  const isAvailable = variant === "available";
  const progress = enrollment?.progress ?? (isCompleted ? 100 : 0);

  const getModuleCount = () => {
    if (!course.subjects) return 0;
    if (Array.isArray(course.subjects)) {
      if (course.subjects.length === 1 && typeof (course.subjects[0] as any).count === "number") {
        return (course.subjects[0] as any).count;
      }
      return course.subjects.length;
    }
    if (typeof course.subjects === "object") {
      return (course.subjects as any).count || 0;
    }
    return 0;
  };

  const moduleCount = getModuleCount();
  const href = isActive
    ? `/campus/courses/${course.id}/learn`
    : `/campus/courses/${course.id}`;

  return (
    <CampusSurface className="group flex h-full flex-col overflow-hidden transition-colors hover:border-brand-orange/40">
      <div className="relative aspect-[16/9] overflow-hidden bg-paper-deep">
        <img
          src={course.thumbnail_url || "/images/placeholder-course.jpg"}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,38,62,0.55)_100%)]" />
        {isActive ? (
          <span className="absolute left-3 top-3 rounded-full bg-brand-orange px-2.5 py-1 text-xs font-semibold text-primary">
            {t("courseCard.inProgress")}
          </span>
        ) : null}
        {isCompleted ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-primary">
            <CheckCircle2 className="size-3.5" />
            {t("courseCard.completed")}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-primary/45">
          {moduleCount} {t("courseCard.modules")}
        </p>
        <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-primary">
          {title}
        </h3>
        {description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-primary/60">
            {description}
          </p>
        ) : null}

        {!isAvailable ? (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-primary/50">
              <span>{t("courseCard.yourProgress")}</span>
              <span className="font-semibold text-primary">{progress}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-paper-deep">
              <div
                className={cn("h-full rounded-full bg-brand-orange")}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>
        ) : null}

        <Link
          href={href}
          className="mt-auto flex items-center justify-between pt-5 text-sm font-semibold text-primary"
        >
          <span>
            {isActive
              ? t("courseCard.continueLearning")
              : isCompleted
                ? t("courseCard.reviewContent")
                : t("courseCard.exploreCourse")}
          </span>
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </CampusSurface>
  );
}
