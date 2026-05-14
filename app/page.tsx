import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/shared/navbar";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackToTop } from "@/components/shared/back-to-top";
import { CopyrightYear } from "@/components/shared/copyright-year";
import { LazyGlobe } from "@/components/ui/globe-lazy";
import { ArrowRight, Star, Clock } from "lucide-react";
import { T } from "@/lib/i18n/context";

const COURSES = [
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
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=800&auto=format&fit=crop"
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
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?q=80&w=800&auto=format&fit=crop"
  }
];

/**
 * Landing Page — Public-facing homepage for Hope Aviation.
 */
export default function LandingPage() {

  return (
    <main className="relative min-h-screen flex flex-col bg-white text-slate-900 overflow-hidden font-sans">
      <Navbar />

      {/* ── Hero Section ── */}
      <div style={{ transformStyle: "preserve-3d" }}>
        <section className="section-container relative flex h-screen min-h-fit w-full flex-col items-center justify-between overflow-hidden bg-[#0B0F15] px-0!">
          {/* Background Image */}
          <picture className="pointer-events-none absolute inset-0 z-0">
            <Image
              src="/Fondo HERO.svg"
              alt="Hope Aviation Hero"
              fill
              priority
              className="object-cover object-[center_25%]"
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
      <section id="about" className="w-full py-32 px-6 bg-[#00263E] relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(23,73,255,0.1),transparent_70%)]" />
        </div>
        <div className="mx-auto max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-[40%_60%] gap-12 lg:gap-8 items-center">

          {/* Left Column: Text Content */}
          <div className="flex flex-col items-start text-left">
            <Title level="h2" className="text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight">
              <T k="landing.aboutTitle" />
            </Title>
            <p className="text-xl text-slate-300 leading-relaxed font-medium mb-12">
              <T k="landing.aboutDescription" />
            </p>

            <div className="mt-8">
              <Button asChild variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-xl h-12 px-8 text-sm font-bold transition-all duration-200 group">
                <Link href="/about" className="flex items-center gap-2">
                  <T k="landing.aboutMoreInfo" />
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Globe */}
          <div className="relative flex items-center justify-center min-h-[400px] lg:min-h-[600px] w-full">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl opacity-30" />
            <LazyGlobe className="w-full max-w-[600px] z-10" />
          </div>

        </div>
      </section>

      {/* ── Courses Gallery Section ── */}
      <section id="courses" className="w-full bg-slate-50/50 py-32 relative overflow-hidden">
        <div className="px-6 mb-16">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-4 border-accent/20 text-accent"><T k="studentCourses.exploreCatalog" /></Badge>
              <Title level="h2" className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                <T k="navbar.courses" />
              </Title>
              <p className="mt-6 text-slate-500 text-xl font-medium">
                <T k="landing.featuresDescription" />
              </p>
            </div>
            <Button asChild variant="ghost" className="group text-accent font-bold">
              <Link href="/courses" className="flex items-center gap-2">
                <T k="studentCourses.exploreCatalog" />
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Horizontal Scroll Gallery */}
        <div className="relative">
          <div className="flex overflow-x-auto gap-8 px-[max(1.5rem,calc((100vw-80rem)/2))] pb-12 scrollbar-hide snap-x">
            {COURSES.map((course) => (
              <Card
                key={course.id}
                className="min-w-[320px] md:min-w-[400px] border-none shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white group snap-start overflow-hidden rounded-[24px]"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={800}
                    height={400}
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
                    <Link href={`/courses/${course.id}`}><T k="enrollment.enrollNow" /></Link>
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
              <Image
                src="/logos/Hope Black.svg"
                alt="Hope Aviation"
                width={120}
                height={40}
                className="h-10 scale-[2.1] origin-left"
                style={{ width: "auto" }}
              />
              <p className="text-slate-400 font-medium text-sm">
                <T k="landing.footerTagline" />
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-primary text-sm uppercase tracking-widest"><T k="landing.footerFeatures" /></h4>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-3 font-bold text-slate-500 text-sm">
                <Link href="/courses" className="hover:text-accent transition-colors"><T k="navbar.courses" /></Link>
                <a href="#about" className="hover:text-accent transition-colors"><T k="navbar.about" /></a>
                <Link href="/campus" className="hover:text-accent transition-colors"><T k="landing.enterCampus" /></Link>
                <Link href="/donate" className="hover:text-accent transition-colors"><T k="navbar.donate" /></Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-primary text-sm uppercase tracking-widest">Legal</h4>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-3 font-bold text-slate-500 text-sm">
                <Link href="/privacy" className="hover:text-accent transition-colors"><T k="landing.footerPrivacy" /></Link>
                <Link href="/terms" className="hover:text-accent transition-colors"><T k="landing.footerTerms" /></Link>
                <Link href="/contact" className="hover:text-accent transition-colors"><T k="landing.footerContact" /></Link>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            <CopyrightYear /> <T k="landing.footerRightsReserved" />
            <p><T k="landing.footerDesigned" /></p>
          </div>
        </div>
      </footer>

      <BackToTop />
    </main>
  );
}
