"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { CampusPageHeader } from "@/components/features/campus/ui/page-header";
import { CampusSurface } from "@/components/features/campus/ui/surface";

export default function AdminHomePage() {
  const { t } = useTranslation();

  const links = [
    { href: "/campus/admin/courses", labelKey: "admin.courses", noteKey: "admin.coursesNote" },
    { href: "/campus/admin/exams", labelKey: "admin.exams", noteKey: "admin.examsNote" },
    { href: "/campus/admin/user-management", labelKey: "admin.userManagement", noteKey: "admin.userManagementNote" },
    { href: "/campus/admin/users", labelKey: "admin.users", noteKey: "admin.usersNote" },
    { href: "/campus/admin/roles", labelKey: "admin.roles", noteKey: "admin.rolesNote" },
    { href: "/campus/admin/newsletter", labelKey: "admin.newsletter", noteKey: "admin.newsletterNote" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <CampusPageHeader
        title={t("admin.title")}
        description={t("admin.description")}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <CampusSurface className="h-full p-5 transition-colors hover:border-brand-orange/40">
              <h2 className="font-display text-lg font-bold text-primary">{t(l.labelKey)}</h2>
              <p className="mt-1 text-sm leading-relaxed text-primary/60">{t(l.noteKey)}</p>
            </CampusSurface>
          </Link>
        ))}
      </div>
    </div>
  );
}
