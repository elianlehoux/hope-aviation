"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";

/**
 * Student area home — maps to learner-facing data: enrollments, progress, attempts.
 */
export default function StudentsHomePage() {
  const { t } = useTranslation();

  const links = [
    { href: "/campus/students/courses", labelKey: "students.myCourses", note: "enrollments → courses" },
    { href: "/campus/students/progress", labelKey: "students.progress", note: "lesson_progress" },
    { href: "/campus/students/exams", labelKey: "students.exams", note: "exams, exam_attempts" },
    { href: "/campus/students/profile", labelKey: "students.profile", note: "profiles" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("students.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("students.description")}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex flex-col rounded-lg border border-border bg-card px-4 py-3 hover:bg-accent/50 transition-colors"
            >
              <span className="font-medium">{t(l.labelKey)}</span>
              <span className="text-xs text-muted-foreground">{l.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
