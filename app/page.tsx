import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/shared/navbar";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { BackToTop } from "@/components/shared/back-to-top";
import { Footer } from "@/components/shared/footer";
import { LazyGlobe } from "@/components/ui/globe-lazy";
import { CoursesGallery } from "@/components/features/landing/CoursesGallery";
import { ArrowRight } from "lucide-react";
import { T } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/server";

/**
 * Async server component that fetches published courses from Supabase
 * and renders the gallery. Wrapped in <Suspense> to avoid blocking the page.
 */
async function CoursesLoader() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, description, thumbnail_url, status")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);

  return <CoursesGallery courses={courses || []} />;
}

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

      {/* ── Courses Gallery Section (async, streamed via Suspense) ── */}
      <Suspense fallback={<div className="w-full bg-slate-50/50 py-32" />}>
        <CoursesLoader />
      </Suspense>

      {/* ── Footer ── */}
      <Footer />

      <BackToTop />
    </main>
  );
}
