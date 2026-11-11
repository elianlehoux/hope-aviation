"use client";

import Link from "next/link";
import {
  Languages,
  HeartPulse,
  Radio,
  LifeBuoy,
  HandCoins,
  HeartHandshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCover } from "@/components/features/campus/courses/CourseCover";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslatedText } from "@/types/database";

export interface CourseData {
  id: string;
  title: TranslatedText;
  description: TranslatedText | null;
  thumbnail_url: string | null;
  status: string;
  moduleCount?: number;
  lessonCount?: number;
}

/**
 * Resolves a JSONB translated text field to the current locale string.
 * Falls back to the other language if the preferred one is missing.
 */
function resolveText(text: TranslatedText | null | undefined, lang: string): string {
  if (!text) return "";
  const preferred = text[lang];
  if (preferred) return preferred;
  const fallbackLang = lang === "es" ? "en" : "es";
  return text[fallbackLang] || "";
}

/**
 * CoursesGallery — the landing's courses band. Shows up to three published
 * courses from Supabase (when the visitor can read them) and, always, the six
 * training areas Hope Aviation covers, so anonymous visitors still see what
 * the campus teaches.
 */
export function CoursesGallery({ courses, loading = false }: { courses: CourseData[]; loading?: boolean }) {
  const { lang } = useTranslation();
  const es = lang === "es";

  const areas = [
    {
      icon: Languages,
      title: es ? "Trabajo transcultural" : "Cross-cultural work",
      text: es ? "Servir entre culturas con respeto, escucha y cercanía real." : "Serving across cultures with respect, listening and real closeness.",
    },
    {
      icon: HeartPulse,
      title: es ? "Primeros auxilios y rescate" : "First aid and rescue",
      text: es ? "Atención sanitaria para cuando cada minuto cuenta." : "Care for when every minute counts.",
    },
    {
      icon: Radio,
      title: es ? "Operaciones en zonas remotas" : "Remote-field operations",
      text: es ? "Logística, comunicaciones y clima en aeródromos aislados." : "Logistics, communications and weather at isolated airstrips.",
    },
    {
      icon: LifeBuoy,
      title: es ? "Apoyo emocional" : "Emotional support",
      text: es ? "Sostener al equipo, a la familia y a la comunidad." : "Supporting the team, the family and the community.",
    },
    {
      icon: HandCoins,
      title: es ? "Sostén económico" : "Fundraising",
      text: es ? "Financiar la misión, incluso siendo un ministerio pequeño." : "Funding the mission, even as a small ministry.",
    },
    {
      icon: HeartHandshake,
      title: es ? "Fundamento espiritual" : "Spiritual grounding",
      text: es ? "Oración, vocación y trabajo con iglesias locales." : "Prayer, calling and working with local churches.",
    },
  ];

  return (
    <section id="cursos" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 className="reveal font-display text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.03em] text-primary lg:col-span-7">
            {es ? "Todo lo que el avión no enseña." : "Everything the airplane doesn't teach."}
          </h2>
          <p className="max-w-md self-end text-lg leading-relaxed text-primary/75 lg:col-span-4 lg:col-start-9">
            {es
              ? "Formación técnica, humanitaria y espiritual para situaciones reales de misión, que la instrucción aeronáutica tradicional no cubre."
              : "Technical, humanitarian and spiritual training for real mission situations that traditional flight training doesn't cover."}
          </p>
        </div>

        {loading ? (
          <div className="mt-14 grid gap-6 md:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-[24px] bg-muted motion-reduce:animate-none" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const title = resolveText(course.title, lang);
              const description = resolveText(course.description, lang);
              return (
                <li key={course.id}>
                  <Link
                    href={`/campus/courses/${course.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-primary/10 bg-paper transition-shadow hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-paper-deep">
                      {/* Same artwork as the campus cards: the thumbnail, or the branded navy cover. */}
                      <CourseCover
                        src={course.thumbnail_url}
                        alt=""
                        seed={course.id}
                        className="transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-xl font-medium leading-snug tracking-tight text-primary">{title}</h3>
                      {description && (
                        <p className="mt-2 line-clamp-3 leading-relaxed text-primary/70">{description}</p>
                      )}
                      {(course.moduleCount ?? 0) > 0 && (
                        <p className="mt-auto pt-5 text-sm text-primary/65">
                          {es
                            ? `${course.moduleCount} ${course.moduleCount === 1 ? "módulo" : "módulos"}, ${course.lessonCount} ${course.lessonCount === 1 ? "clase" : "clases"}`
                            : `${course.moduleCount} ${course.moduleCount === 1 ? "module" : "modules"}, ${course.lessonCount} ${course.lessonCount === 1 ? "lesson" : "lessons"}`}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="mt-16">
          <h3 className="font-display text-2xl font-normal tracking-tight text-primary">
            {es ? "Seis áreas de formación" : "Six training areas"}
          </h3>
          <ul className="mt-8 grid gap-x-10 gap-y-8 border-t border-primary/10 pt-8 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => {
              const Icon = area.icon;
              return (
                <li key={area.title} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-highlight/15 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-primary">{area.title}</p>
                    <p className="mt-1 leading-relaxed text-primary/70">{area.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <Button asChild size="lg" variant="outline" className="mt-14 h-12 border-primary/25 px-7 hover:bg-paper">
          <Link href="/campus/courses">{es ? "Ver el catálogo en el campus" : "Browse the campus catalog"}</Link>
        </Button>
      </div>
    </section>
  );
}
