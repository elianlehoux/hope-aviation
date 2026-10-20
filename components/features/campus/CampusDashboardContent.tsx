"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { ProfileCompletionBanner } from "@/components/features/campus/ProfileCompletionBanner";
import { StudentCourseCard } from "@/components/features/campus/StudentCourseCard";
import { CampusPageHeader } from "@/components/features/campus/ui/page-header";
import { CampusEmpty, CampusSurface } from "@/components/features/campus/ui/surface";
import { BookOpen, GraduationCap, CheckCircle, TrendingUp, Users } from "lucide-react";

interface ProfileProp {
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  country_code: string | null;
}

interface CampusDashboardContentProps {
  showBanner: boolean;
  activeEnrollments: any[];
  completedEnrollments: any[];
  catalogCourses: any[];
  roles: string[];
  stats: {
    activeCoursesCount: number;
    completedCoursesCount: number;
    totalCompletedLessons: number;
    averageProgress: number;
  };
  profile: ProfileProp | null;
}

export function CampusDashboardContent({
  showBanner,
  activeEnrollments,
  completedEnrollments,
  catalogCourses,
  roles,
  stats,
  profile,
}: CampusDashboardContentProps) {
  const { t, lang } = useTranslation();
  const isStaff = roles.includes("admin") || roles.includes("instructor");
  const firstName = profile?.first_name || (lang === "es" ? "ahí" : "there");

  const statItems = [
    { label: lang === "es" ? "Cursos activos" : "Active courses", value: stats.activeCoursesCount, icon: BookOpen },
    { label: lang === "es" ? "Progreso medio" : "Average progress", value: `${stats.averageProgress}%`, icon: TrendingUp },
    { label: lang === "es" ? "Clases hechas" : "Lessons done", value: stats.totalCompletedLessons, icon: CheckCircle },
    { label: lang === "es" ? "Cursos terminados" : "Courses finished", value: stats.completedCoursesCount, icon: GraduationCap },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-16">
      {showBanner ? <ProfileCompletionBanner /> : null}

      <CampusPageHeader
        title={lang === "es" ? `Hola, ${firstName}` : `Hello, ${firstName}`}
        description={t("studentCourses.myAcademyDesc")}
      />

      {isStaff ? (
        <CampusSurface className="grid gap-px overflow-hidden sm:grid-cols-2">
          {roles.includes("admin") ? (
            <Link
              href="/campus/admin/users"
              className="flex items-center gap-4 p-5 transition-colors hover:bg-paper"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-paper text-primary">
                <Users className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-primary">
                  {lang === "es" ? "Administración" : "Administration"}
                </span>
                <span className="mt-0.5 block text-sm text-primary/55">
                  {lang === "es" ? "Usuarios, roles y boletín" : "Users, roles and newsletter"}
                </span>
              </span>
            </Link>
          ) : null}
          <Link
            href="/campus/admin/courses"
            className="flex items-center gap-4 p-5 transition-colors hover:bg-paper"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-orange/15 text-primary">
              <BookOpen className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-primary">
                {lang === "es" ? "Cursos y exámenes" : "Courses and exams"}
              </span>
              <span className="mt-0.5 block text-sm text-primary/55">
                {lang === "es" ? "Armar módulos, clases y evaluaciones" : "Build modules, classes and exams"}
              </span>
            </span>
          </Link>
        </CampusSurface>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <CampusSurface key={item.label} className="flex items-center gap-3 p-4">
              <span className="flex size-9 items-center justify-center rounded-lg bg-paper text-primary">
                <Icon className="size-4" />
              </span>
              <span>
                <span className="block text-xs text-primary/50">{item.label}</span>
                <span className="font-display text-xl font-bold tracking-tight text-primary">
                  {item.value}
                </span>
              </span>
            </CampusSurface>
          );
        })}
      </div>

      {activeEnrollments.length > 0 ? (
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-bold tracking-tight text-primary">
            {t("studentCourses.continueLearning")}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {activeEnrollments.map((e) => (
              <StudentCourseCard
                key={e.id}
                course={e.courses}
                enrollment={e}
                variant="active"
              />
            ))}
          </div>
        </section>
      ) : (
        <CampusEmpty
          title={lang === "es" ? "Todavía no estás en un curso" : "You are not in a course yet"}
          description={
            lang === "es"
              ? "Inscribite en uno del catálogo para empezar."
              : "Enroll in one from the catalog to start."
          }
        />
      )}

      <section className="space-y-5">
        <h2 className="font-display text-2xl font-bold tracking-tight text-primary">
          {t("studentCourses.exploreCatalog")}
        </h2>
        {catalogCourses && catalogCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {catalogCourses.slice(0, 6).map((course) => (
              <StudentCourseCard key={course.id} course={course} variant="available" />
            ))}
          </div>
        ) : (
          <CampusEmpty title={t("studentCourses.emptyCatalog")} />
        )}
      </section>

      {completedEnrollments.length > 0 ? (
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-bold tracking-tight text-primary">
            {t("studentCourses.certificationsTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {completedEnrollments.map((e) => (
              <StudentCourseCard
                key={e.id}
                course={e.courses}
                enrollment={e}
                variant="completed"
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
