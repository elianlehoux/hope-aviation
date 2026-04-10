"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { ProfileCompletionBanner } from "@/components/features/campus/ProfileCompletionBanner";

/**
 * Campus hub — client wrapper for translation support.
 * Data fetching must be done via API or parent server component.
 */
export function CampusDashboardContent({ showBanner }: { showBanner: boolean }) {
  const { t } = useTranslation();

  const areas = [
    {
      titleKey: "campus.areaStudents",
      descKey: "campus.areaStudentsDesc",
      href: "/campus/students",
    },
    {
      titleKey: "campus.areaProfessors",
      descKey: "campus.areaProfessorsDesc",
      href: "/campus/professors",
    },
    {
      titleKey: "campus.areaAdmin",
      descKey: "campus.areaAdminDesc",
      href: "/campus/admin",
    },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {showBanner && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
          <ProfileCompletionBanner />
        </div>
      )}

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">{t("campus.dashboardTitle")}</h1>
        <p className="text-xl text-slate-500 font-medium">
          {t("campus.dashboardSubtitle")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-xs transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
          >
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
            
            <h2 className="text-2xl font-bold tracking-tight text-primary group-hover:text-accent transition-colors">
              {t(item.titleKey)}
            </h2>
            <p className="mt-4 text-base text-slate-500 leading-relaxed font-medium">
              {t(item.descKey)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
