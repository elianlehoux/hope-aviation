"use client";

import { useTranslation } from "@/lib/i18n/context";
import type { CourseSummary, MyCourse } from "@/lib/campus/home";
import { CourseCard } from "./CourseCard";

export function CoursesIndex({ myCourses, catalog }: { myCourses: MyCourse[]; catalog: CourseSummary[] }) {
  const { lang } = useTranslation();
  const es = lang === "es";

  return (
    <div className="mx-auto max-w-6xl space-y-12 pb-16">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">{es ? "Cursos" : "Courses"}</h1>
        <p className="mt-2 max-w-[60ch] text-primary/65">
          {es
            ? "Formación complementaria —técnica, humanitaria y espiritual— para servir en la aviación misionera. Gratis y a tu ritmo."
            : "Complementary training — technical, humanitarian and spiritual — for mission aviation. Free and at your own pace."}
        </p>
      </header>

      {myCourses.length > 0 ? (
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-primary">{es ? "Mis cursos" : "My courses"}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {myCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-5">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-primary">{es ? "Disponibles" : "Available"}</h2>
        {catalog.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-primary/15 px-6 py-10 text-center text-sm text-primary/65">
            {es ? "No hay más cursos disponibles por ahora." : "No more courses available right now."}
          </p>
        )}
      </section>
    </div>
  );
}
