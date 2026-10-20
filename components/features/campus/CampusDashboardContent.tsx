"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { ProfileCompletionBanner } from "@/components/features/campus/ProfileCompletionBanner";
import { StudentCourseCard } from "@/components/features/campus/StudentCourseCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Title } from "@/components/ui/title";
import { 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  CheckCircle, 
  TrendingUp, 
  ShieldAlert, 
  Users 
} from "lucide-react";

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

const statsLabels: Record<string, { en: string; es: string }> = {
  activeCourses: { en: "Active Courses", es: "Cursos Activos" },
  completedCourses: { en: "Completed Courses", es: "Cursos Completados" },
  lessonsCompleted: { en: "Lessons Completed", es: "Lecciones Completadas" },
  averageProgress: { en: "Average Progress", es: "Progreso Promedio" },
  staffPortal: { en: "Staff Portal", es: "Portal del Personal" },
  staffPortalDesc: { en: "Quick links to access management hubs and admin tools.", es: "Enlaces rápidos para acceder a los paneles de gestión y herramientas de administración." },
  adminConsole: { en: "Admin Console", es: "Consola de Administración" },
  instructorConsole: { en: "Instructor Console", es: "Consola de Instructor" }
};

export function CampusDashboardContent({ 
  showBanner, 
  activeEnrollments, 
  completedEnrollments, 
  catalogCourses, 
  roles, 
  stats,
  profile
}: CampusDashboardContentProps) {
  const { t, lang } = useTranslation();
  
  const isStaff = roles.includes("admin") || roles.includes("instructor");

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20">
      {/* 1. Profile Completion Banner */}
      {showBanner && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
          <ProfileCompletionBanner />
        </div>
      )}

      {/* 2. Header & Welcome Greeting */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-highlight">
          <Sparkles className="size-6 animate-pulse" />
          <h4 className="text-sm font-bold uppercase tracking-widest opacity-70">
            {t("studentCourses.learningDashboard")}
          </h4>
        </div>
        <Title level="h1" className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          {lang === "es" 
            ? `¡Hola, ${profile?.first_name || "Estudiante"}!` 
            : `Hello, ${profile?.first_name || "Student"}!`}
        </Title>
        <p className="text-lg text-slate-500 font-medium max-w-3xl leading-relaxed">
          {t("studentCourses.myAcademyDesc")}
        </p>
      </div>

      {/* 3. Staff Portal Dashboard Quick Links (rendered if user is admin/instructor) */}
      {isStaff && (
        <section className="space-y-4 p-6 md:p-8 bg-slate-50/50 border border-slate-100/80 rounded-3xl animate-in fade-in duration-500 shadow-2xs">
          <div className="flex items-center gap-2 text-primary font-bold">
            <ShieldAlert className="size-5 text-accent shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-85">
              {statsLabels.staffPortal[lang]}
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {statsLabels.staffPortalDesc[lang]}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-3">
            {roles.includes("admin") && (
              <Link
                href="/campus/admin"
                className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:scale-[1.01] transition-all"
              >
                <div className="size-11 rounded-xl bg-info flex items-center justify-center text-accent shrink-0">
                  <Users className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary">{statsLabels.adminConsole[lang]}</h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">Manage users, roles, courses & newsletter</p>
                </div>
              </Link>
            )}
            {(roles.includes("instructor") || roles.includes("admin")) && (
              <Link
                href="/campus/admin/courses"
                className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:scale-[1.01] transition-all"
              >
                <div className="size-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary">{statsLabels.instructorConsole[lang]}</h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">Review syllabus, classes, exams & grades</p>
                </div>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* 4. Statistics Dashboard Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Active Courses */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-2xs flex items-center gap-4 hover:shadow-md transition-all group duration-300">
          <div className="size-12 rounded-2xl bg-accent/5 text-accent flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
            <BookOpen className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{statsLabels.activeCourses[lang]}</p>
            <h3 className="text-2xl font-black text-primary tracking-tight mt-0.5">{stats.activeCoursesCount}</h3>
          </div>
        </div>

        {/* Avg Progress */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-2xs flex items-center gap-4 hover:shadow-md transition-all group duration-300">
          <div className="size-12 rounded-2xl bg-highlight/5 text-highlight flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
            <TrendingUp className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{statsLabels.averageProgress[lang]}</p>
            <h3 className="text-2xl font-black text-primary tracking-tight mt-0.5">{stats.averageProgress}%</h3>
          </div>
        </div>

        {/* Completed Lessons */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-2xs flex items-center gap-4 hover:shadow-md transition-all group duration-300">
          <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
            <CheckCircle className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{statsLabels.lessonsCompleted[lang]}</p>
            <h3 className="text-2xl font-black text-primary tracking-tight mt-0.5">{stats.totalCompletedLessons}</h3>
          </div>
        </div>

        {/* Completed Courses */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-2xs flex items-center gap-4 hover:shadow-md transition-all group duration-300">
          <div className="size-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{statsLabels.completedCourses[lang]}</p>
            <h3 className="text-2xl font-black text-primary tracking-tight mt-0.5">{stats.completedCoursesCount}</h3>
          </div>
        </div>
      </div>

      {/* 5. Active Courses (Continue Learning) */}
      {activeEnrollments.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-center gap-3 pl-1">
            <BookOpen className="size-6 text-highlight" />
            <h2 className="text-2xl font-bold tracking-tight text-primary">
              {t("studentCourses.continueLearning")}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <section className="p-10 text-center rounded-3xl border border-slate-100 bg-slate-50/50 shadow-2xs max-w-3xl mx-auto">
          <h3 className="text-lg font-bold text-primary mb-2">
            {lang === "es" ? "Comienza tu viaje en aviación" : "Start Your Aviation Journey"}
          </h3>
          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto mb-6 leading-relaxed">
            {lang === "es" 
              ? "Inscríbete en uno de nuestros cursos disponibles en el catálogo de abajo para empezar a aprender." 
              : "Enroll in one of our available courses in the catalog below to begin your training."}
          </p>
        </section>
      )}

      {/* 6. Explore Catalog Section */}
      <section className="space-y-8 py-10 border-t border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-primary">
              {t("studentCourses.exploreCatalog")}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {t("studentCourses.catalogDesc")}
            </p>
          </div>
          
          <Tabs defaultValue="all" className="w-full md:w-auto">
            <TabsList className="bg-slate-50 border border-slate-100 p-1 h-11 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                {t("studentCourses.allLevels")}
              </TabsTrigger>
              <TabsTrigger value="new" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                {t("studentCourses.newReleases")}
              </TabsTrigger>
              <TabsTrigger value="popular" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                {t("studentCourses.popular")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {catalogCourses && catalogCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {catalogCourses.slice(0, 6).map((course) => (
              <StudentCourseCard key={course.id} course={course} variant="available" />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50">
            <p className="text-slate-400 font-medium">{t("studentCourses.emptyCatalog")}</p>
          </div>
        )}

        {catalogCourses && catalogCourses.length > 6 && (
          <div className="flex justify-center pt-6">
            <button className="px-8 py-3 rounded-2xl bg-white border border-slate-200 text-primary font-bold shadow-xs hover:border-primary hover:text-primary transition-all active:scale-95">
              {t("studentCourses.loadMoreCourses")}
            </button>
          </div>
        )}
      </section>

      {/* 7. Certifications & Completed Courses Section */}
      {completedEnrollments.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-slate-100">
          <div className="flex items-center gap-3 px-1">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <GraduationCap className="size-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-primary">
              {t("studentCourses.certificationsTitle")}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      )}
    </div>
  );
}
