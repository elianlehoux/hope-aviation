"use client";

import Link from "next/link";
import { ArrowRight, Library, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { LearnerHome } from "@/lib/campus/home";
import { CourseCard } from "@/components/features/campus/courses/CourseCard";
import { CourseCover } from "@/components/features/campus/courses/CourseCover";

export function CampusDashboardContent({ home }: { home: LearnerHome }) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const active = home.myCourses.filter((c) => c.status === "active");
  const current = active[0];
  const others = home.myCourses.filter((c) => c !== current);
  const staff = home.roles.includes("admin") || home.roles.includes("instructor");

  return (
    <div className="mx-auto max-w-6xl space-y-12 pb-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
            {es ? "Hola" : "Hi"}, {home.firstName}
          </h1>
          <p className="mt-2 text-primary/65">
            {current
              ? es
                ? "Retomá donde lo dejaste."
                : "Pick up where you left off."
              : es
                ? "Formación para servir donde los caminos no llegan."
                : "Training to serve where roads can't reach."}
          </p>
        </div>
        {staff ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/campus/admin/courses">
              <Library className="size-4" aria-hidden />
              {es ? "Gestionar cursos" : "Manage courses"}
            </Link>
          </Button>
        ) : null}
      </header>

      {!home.profileComplete ? (
        <Link
          href="/campus/profile"
          className="flex items-center gap-4 rounded-2xl border border-highlight/40 bg-highlight/10 px-5 py-4 transition-colors hover:bg-highlight/15"
        >
          <UserRound className="size-5 shrink-0 text-primary" aria-hidden />
          <p className="flex-1 text-sm text-primary/80">
            <span className="font-semibold text-primary">{es ? "Completá tu perfil." : "Complete your profile."}</span>{" "}
            {es
              ? "Sumá tus datos: el nombre de tu perfil es el que aparece en tus certificados."
              : "Add your details: the name on your profile is the one printed on your certificates."}
          </p>
          <ArrowRight className="size-4 shrink-0 text-primary/65" aria-hidden />
        </Link>
      ) : null}

      {current ? (
        <section aria-labelledby="continue-heading">
          <h2 id="continue-heading" className="sr-only">
            {es ? "Seguir aprendiendo" : "Continue learning"}
          </h2>
          <Link
            href={`/campus/courses/${current.id}/learn`}
            className="group grid overflow-hidden rounded-3xl bg-primary text-white md:grid-cols-[1fr_1.1fr]"
          >
            <div className="relative aspect-[16/9] md:aspect-auto">
              <CourseCover src={current.thumbnailUrl} alt={getLocalizedText(current.title, lang)} seed={current.id} />
            </div>
            <div className="flex flex-col justify-center gap-5 p-6 sm:p-8 md:p-10">
              <p className="text-sm font-medium text-highlight">{es ? "Seguir aprendiendo" : "Continue learning"}</p>
              <h3 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
                {getLocalizedText(current.title, lang)}
              </h3>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-highlight" style={{ width: `${current.progress}%` }} />
                </div>
                <span className="text-sm font-semibold tabular-nums text-white/80">{current.progress}%</span>
              </div>
              <p className="text-sm text-white/65">
                {current.completedLessons}/{current.lessonCount} {es ? "clases completadas" : "lessons completed"}
              </p>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-highlight px-5 py-2.5 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                {es ? "Continuar" : "Continue"}
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </div>
          </Link>
        </section>
      ) : null}

      {others.length > 0 ? (
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-primary">{es ? "Mis cursos" : "My courses"}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-primary">
            {home.myCourses.length ? (es ? "Explorar cursos" : "Explore courses") : es ? "Empezá un curso" : "Start a course"}
          </h2>
          {home.catalog.length > 3 ? (
            <Link href="/campus/courses" className="text-sm font-semibold text-primary/70 hover:text-primary">
              {es ? "Ver todos" : "See all"}
            </Link>
          ) : null}
        </div>
        {home.catalog.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {home.catalog.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-primary/15 px-6 py-10 text-center text-sm text-primary/65">
            {home.myCourses.length
              ? es
                ? "Ya estás inscripto en todos los cursos disponibles. Pronto sumamos más."
                : "You're enrolled in every available course. More are on the way."
              : es
                ? "Todavía no hay cursos publicados. Pronto sumamos los primeros."
                : "No courses are published yet. The first ones are on the way."}
          </p>
        )}
      </section>
    </div>
  );
}
