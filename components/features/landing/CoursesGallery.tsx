"use client";

import Link from "next/link";
import Image from "next/image";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { T, useTranslation } from "@/lib/i18n/context";
import type { TranslatedText } from "@/types/database";

interface CourseData {
  id: string;
  title: TranslatedText;
  description: TranslatedText | null;
  thumbnail_url: string | null;
  status: string;
}

/**
 * Resolves a JSONB translated text field to the current locale string.
 * Falls back to the other language if the preferred one is missing.
 */
function resolveText(
  text: TranslatedText | null | undefined,
  lang: string
): string {
  if (!text) return "";
  const preferred = text[lang];
  if (preferred) return preferred;
  // Fallback to the other language
  const fallbackLang = lang === "es" ? "en" : "es";
  return text[fallbackLang] || "";
}

/**
 * CoursesGallery — Renders a horizontal-scroll gallery of courses on the
 * landing page in a dark premium Apple-style design following DESIGN.md.
 * Shows exactly up to 3 courses at a time on desktop.
 */
export function CoursesGallery({ courses }: { courses: CourseData[] }) {
  const { lang } = useTranslation();

  return (
    <section
      id="courses"
      className="w-full bg-[#1C1E21] py-32 relative overflow-x-clip border-b border-white/5"
    >
      {/* Ambient background effect */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(23,73,255,0.15)_0%,transparent_70%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 relative z-10 grid grid-cols-1 lg:grid-cols-[30%_70%] gap-12 lg:gap-16 items-start">
        {/* Left Column: Text Content & Sticky CTA */}
        <div className="flex flex-col items-start text-left lg:sticky lg:top-28">
          <Title
            level="h2"
            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6"
          >
            <T k="navbar.courses" />
          </Title>
          <p className="text-white/60 text-lg md:text-xl font-medium leading-relaxed mb-10">
            <T k="landing.featuresDescription" />
          </p>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-xl h-12 px-8 text-sm font-bold transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] group shadow-none"
          >
            <Link href="/campus" className="flex items-center gap-2">
              <T k="landing.startLearningNow" />
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Right Column: Carousel or Empty State */}
        <div className="w-full overflow-hidden">
          {courses.length > 0 ? (
            <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide snap-x snap-mandatory">
              {courses.map((course) => {
                const title = resolveText(course.title, lang);
                const description = resolveText(course.description, lang);

                return (
                  <Card
                    key={course.id}
                    className="w-[80vw] sm:w-[300px] lg:w-[280px] shrink-0 border border-white/10 shadow-none hover:bg-white/10 hover:-translate-y-1.5 transition-all duration-500 bg-white/5 group snap-start overflow-hidden rounded-[24px] flex flex-col"
                  >
                    <div className="relative h-56 overflow-hidden bg-black/25">
                      {course.thumbnail_url ? (
                        <Image
                          src={course.thumbnail_url}
                          alt={title}
                          width={800}
                          height={400}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <BookOpen className="size-16 text-white/10" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center gap-4 text-white/40 mb-4 font-bold text-xs uppercase tracking-widest">
                          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full">
                            <Clock className="size-3.5 text-accent" />
                            <T k="common.comingSoon" />
                          </div>
                        </div>
                        <CardTitle className="text-xl font-extrabold text-white leading-tight group-hover:text-accent transition-colors duration-300">
                          {title}
                        </CardTitle>
                        {description && (
                          <CardDescription className="text-white/60 pt-4 text-[14px] font-medium leading-relaxed line-clamp-3">
                            {description}
                          </CardDescription>
                        )}
                      </div>
                      <Button
                        asChild
                        className="w-full mt-6 bg-white text-primary hover:bg-slate-100 border-none font-bold py-5 rounded-full transition-all duration-300 text-sm hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Link href={`/campus/courses/${course.id}`} className="flex items-center justify-center gap-1">
                          <T k="enrollment.enrollNow" />
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </CardHeader>
                  </Card>
                );
              })}
              {/* Spacer at the end of the scroll */}
              <div className="min-w-[20px] shrink-0" />
            </div>
          ) : (
            <div className="text-center px-6 py-16 bg-white/5 border border-white/10 rounded-[24px]">
              <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="size-8 text-accent" />
              </div>
              <Title
                level="h3"
                className="text-2xl font-bold text-white mb-4 tracking-tight"
              >
                <T k="landing.noCoursesTitle" />
              </Title>
              <p className="text-white/60 text-base font-medium leading-relaxed">
                <T k="landing.noCoursesDescription" />
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
