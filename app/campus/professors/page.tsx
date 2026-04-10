"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";

/**
 * Professor (instructor) area — content and roster management.
 */
export default function ProfessorsHomePage() {
  const { t } = useTranslation();

  const links = [
    { href: "/campus/professors/courses", labelKey: "professors.courses", note: "courses, subjects, classes" },
    { href: "/campus/professors/exams", labelKey: "professors.exams", note: "exams, questions, options" },
    { href: "/campus/professors/roster", labelKey: "professors.roster", note: "enrollments → profiles" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("professors.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("professors.description")}
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
