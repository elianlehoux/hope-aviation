"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";

/**
 * Admin area — platform-wide configuration and catalog.
 */
export default function AdminHomePage() {
  const { t } = useTranslation();

  const links = [
    { href: "/campus/admin/user-management", labelKey: "admin.userManagement", noteKey: "admin.userManagementNote" },
    { href: "/campus/admin/users", labelKey: "admin.users", noteKey: "admin.usersNote" },
    { href: "/campus/admin/roles", labelKey: "admin.roles", noteKey: "admin.rolesNote" },
    { href: "/campus/admin/courses", labelKey: "admin.courses", noteKey: "admin.coursesNote" },
    { href: "/campus/admin/exams", labelKey: "admin.exams", noteKey: "admin.examsNote" },
    { href: "/campus/admin/enrollments", labelKey: "admin.enrollments", noteKey: "admin.enrollmentsNote" },
    { href: "/campus/admin/exam-attempts", labelKey: "admin.examAttempts", noteKey: "admin.examAttemptsNote" },
    { href: "/campus/admin/newsletter", labelKey: "admin.newsletter", noteKey: "admin.newsletterNote" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("admin.description")}
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
              <span className="text-xs text-muted-foreground">{t(l.noteKey)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
