"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackToTop } from "@/components/shared/back-to-top";
import {
  ArrowRight,
  Heart,
  BookOpen,
  Award,
  Users,
  Star,
  Clock
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

/**
 * Landing Page — Public-facing homepage for Hope Aviation.
 */
export default function LandingPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    setMounted(true);
    setYear(new Date().getFullYear());
  }, []);

  const courses = [
    {
      id: 1,
      title: "Introducción a la Aviación",
      description: "Conceptos básicos para futuros pilotos y entusiastas del aire.",
      duration: "4 semanas",
      level: "Principiante",
      image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Sistemas de Aeronaves",
      description: "Explora la ingeniería detrás de los aviones modernos.",
      duration: "6 semanas",
      level: "Intermedio",
      image: "https://images.unsplash.com/photo-1534433010376-79354005e8e8?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Meteorología Aeronáutica",
      description: "Entiende el clima y su impacto en la seguridad del vuelo.",
      duration: "5 semanas",
      level: "Avanzado",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "Navegación VFR",
      description: "Técnicas de navegación por referencia visual para vuelo diurno.",
      duration: "4 semanas",
      level: "Intermedio",
      image: "https://images.unsplash.com/photo-1496661415325-ef852f9e8e7c?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Comunicaciones ATC",
      description: "Domina el lenguaje de la radio y la interacción con controladores.",
      duration: "3 semanas",
      level: "Principiante",
      image: "https://images.unsplash.com/photo-1444464666168-49d633b867ad?q=80&w=800&auto=format&fit=crop"
    }
  ];

  return (
    <main className="relative min-h-screen flex flex-col bg-white text-slate-900 overflow-hidden font-sans">
      <Navbar />

      {/* ── Hero Section ── */}
      <div style={{ transformStyle: "preserve-3d" }}>
        <section className="section-container relative flex h-screen min-h-fit w-full flex-col items-center justify-between overflow-hidden bg-[#0B0F15] px-0!">
          {/* Background Image */}
          <picture className="pointer-events-none absolute inset-0 z-0">
            <img
              src="/Fondo HERO.svg"
              alt="Hope Aviation Hero"
              className="h-full w-full object-cover object-[center_25%]"
            />
          </picture>

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 z-[5] bg-gradient-to-b from-black via-black via-[35%] to-transparent" />

          {/* Content with Gradient Overlay */}
          <div className="relative z-10 flex w-full flex-col items-center px-6 py-[18vh]">
            <Title level="h1" className="max-w-[950px] text-center leading-[1.05] text-white font-bold tracking-tight">
              <span className="text-6xl sm:text-8xl md:text-9xl block mb-2">Learning</span>
              <span className="text-accent italic font-semibold text-3xl sm:text-5xl md:text-6xl block">to reach</span>
            </Title>

            <p className="mt-6 max-w-[80%] text-center text-lg md:text-xl text-white/80 font-medium leading-relaxed">
              Building skills. Bridging gaps. Changing lives.
            </p>

            <div className="mt-10 flex md:hidden items-center justify-center">
              <Button asChild variant="outline" className="rounded-full border-white text-white hover:bg-white/10 backdrop-blur-xl h-14 px-12 w-52 text-lg font-bold transition-all duration-200 ease-out active:scale-95 group">
                <Link href="/campus" className="flex items-center gap-2">
                  Learn
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-2" />
                </Link>
              </Button>
            </div>
          </div>

        </section>
      </div>

      {/* ── About Section ── */}
      <section id="about" className="w-full py-32 px-6 bg-white relative overflow-hidden border-b border-slate-100">
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <Badge variant="outline" className="mb-6 border-accent/20 text-accent bg-accent/5">
            {t("landing.aboutTitle")}
          </Badge>
          <Title level="h2" className="text-4xl md:text-5xl font-extrabold text-primary mb-12 tracking-tight">
            Elevando el estándar de la formación aeronáutica.
          </Title>
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium">
              Hope Aviation es un campus virtual diseñado para romper las barreras del conocimiento. Nuestra misión es proporcionar una plataforma educativa moderna, interactiva y accesible que prepare a los profesionales de la aviación para los desafíos del mañana, integrando tecnología de vanguardia con un enfoque humanitario y de excelencia.
            </p>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-3 group cursor-default">
                <div className="size-14 rounded-2xl bg-accent/5 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <BookOpen className="size-7" />
                </div>
                <span className="font-bold text-sm text-primary uppercase tracking-wider">{t("landing.aboutInnovation")}</span>
              </div>
              <div className="flex flex-col items-center gap-3 group cursor-default">
                <div className="size-14 rounded-2xl bg-accent/5 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <Award className="size-7" />
                </div>
                <span className="font-bold text-sm text-primary uppercase tracking-wider">{t("landing.aboutExcellence")}</span>
              </div>
              <div className="flex flex-col items-center gap-3 group cursor-default">
                <div className="size-14 rounded-2xl bg-accent/5 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <Users className="size-7" />
                </div>
                <span className="font-bold text-sm text-primary uppercase tracking-wider">{t("landing.aboutCommitment")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Courses Gallery Section ── */}
      <section id="courses" className="w-full bg-slate-50/50 py-32 relative overflow-hidden">
        <div className="px-6 mb-16">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-4 border-accent/20 text-accent">{t("studentCourses.exploreCatalog")}</Badge>
              <Title level="h2" className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                {t("navbar.courses")}
              </Title>
              <p className="mt-6 text-slate-500 text-xl font-medium">
                {t("landing.featuresDescription")}
              </p>
            </div>
            <Button asChild variant="ghost" className="group text-accent font-bold">
              <Link href="/courses" className="flex items-center gap-2">
                {t("studentCourses.exploreCatalog")}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Horizontal Scroll Gallery */}
        <div className="relative">
          <div className="flex overflow-x-auto gap-8 px-[max(1.5rem,calc((100vw-80rem)/2))] pb-12 scrollbar-hide snap-x">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="min-w-[320px] md:min-w-[400px] border-none shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white group snap-start overflow-hidden rounded-[24px]"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-primary backdrop-blur-sm border-none shadow-sm">
                      {course.level}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-8">
                  <div className="flex items-center gap-4 text-slate-400 mb-4 font-bold text-xs uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="size-3.5 fill-aviation-orange text-aviation-orange border-none" />
                      4.9
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-extrabold text-primary leading-tight group-hover:text-accent transition-colors duration-300">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-slate-500 pt-4 text-[16px] font-medium leading-relaxed line-clamp-2">
                    {course.description}
                  </CardDescription>
                  <Button asChild className="w-full mt-8 bg-slate-50 text-primary hover:bg-accent hover:text-white border-none font-bold py-6 rounded-xl transition-all duration-300">
                    <Link href={`/courses/${course.id}`}>Inscribirme ahora</Link>
                  </Button>
                </CardHeader>
              </Card>
            ))}
            {/* End of list spacer */}
            <div className="min-w-[20px] md:min-w-[40px]" />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-slate-100 py-16 px-6 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center md:items-start text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-6">
              <img
                src="/logos/Hope Black.svg"
                alt="Hope Aviation"
                className="h-10 w-auto scale-[2.1] origin-left"
              />
              <p className="text-slate-400 font-medium text-sm">
                Transformando la educación aeronáutica a través de la tecnología y la pasión por el vuelo.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-primary text-sm uppercase tracking-widest">{t("landing.footerFeatures")}</h4>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-3 font-bold text-slate-500 text-sm">
                <Link href="/courses" className="hover:text-accent transition-colors">{t("navbar.courses")}</Link>
                <a href="#about" className="hover:text-accent transition-colors">{t("navbar.about")}</a>
                <Link href="/campus" className="hover:text-accent transition-colors">{t("landing.enterCampus")}</Link>
                <Link href="/donate" className="hover:text-accent transition-colors">{t("navbar.donate")}</Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-primary text-sm uppercase tracking-widest">Legal</h4>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-3 font-bold text-slate-500 text-sm">
                <Link href="/privacy" className="hover:text-accent transition-colors">Privacidad</Link>
                <Link href="/terms" className="hover:text-accent transition-colors">Términos</Link>
                <Link href="/contact" className="hover:text-accent transition-colors">Contacto</Link>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            <p suppressHydrationWarning>© {year} Hope Aviation. {t("landing.footerCopyright").split(".")[1]?.trim() || "All rights reserved."}</p>
            <p>Designed for excellence</p>
          </div>
        </div>
      </footer>

      <BackToTop />
    </main>
  );
}
