"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect, useState, type ReactNode } from "react";
import { Navbar } from "@/components/shared/navbar";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { T } from "@/lib/i18n/context";
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Target,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Network,
  Users,
  BookMarked,
  Heart,
  HandHeart,
  Sparkles,
  ChevronDown,
} from "lucide-react";

/* ─────────────────────────── Scroll-reveal wrapper ─────────────────────────── */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────── Pillar bullet component ──────────────────────────── */
function Bullet({
  icon: Icon,
  translationKey,
  color = "accent",
}: {
  icon: typeof Heart;
  translationKey: string;
  color?: "accent" | "aviation-orange";
}) {
  const colorMap = {
    accent: "text-accent bg-accent/10",
    "aviation-orange": "text-[#ffaa00] bg-[#ffaa00]/10",
  };
  return (
    <li className="flex items-start gap-4 group">
      <span
        className={`shrink-0 mt-1 size-10 rounded-xl flex items-center justify-center ${colorMap[color]} transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon className="size-5" />
      </span>
      <p className="text-[17px] leading-relaxed text-slate-600">
        <T k={translationKey} />
      </p>
    </li>
  );
}

/* ═══════════════════════════════ PAGE ═══════════════════════════════════════ */

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      <Navbar />

      {/* ═══════════════════════ HERO ═══════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#00263E]">
        {/* Background photo */}
        <Image
          src="/Untitled-1 copy.webp"
          alt="Kids watching an airplane"
          fill
          priority
          className="object-cover object-center opacity-40"
        />
        {/* Gradient scrims */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#00263E] via-transparent to-[#00263E]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00263E]/80 to-transparent" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center flex flex-col items-center gap-6 py-32">
          <Reveal>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest mb-4 transition-colors group"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              <T k="common.back" />
            </Link>
          </Reveal>

          <Reveal delay={100}>
            <Title
              level="h1"
              className="!text-5xl sm:!text-6xl md:!text-7xl font-extrabold !text-white tracking-tight leading-[1.08]"
            >
              <T k="aboutPage.title" />
            </Title>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-xl md:text-2xl text-white/70 font-medium leading-relaxed max-w-2xl">
              <T k="aboutPage.subtitle" />
            </p>
          </Reveal>

          <Reveal delay={350}>
            <ChevronDown className="size-6 text-white/30 animate-bounce mt-6" />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ CHALLENGE TEXT (white) ═════════════════════════ */}
      <section className="py-24 md:py-32 px-6 bg-white">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Sparkles className="size-10 text-accent/40 mx-auto mb-8" />
          </Reveal>
          <Reveal delay={100}>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium">
              <T k="aboutPage.challengeText" />
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ VISION (dark immersive) ════════════════════════ */}
      <section className="relative py-32 md:py-40 px-6 bg-[#0B0F15] overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[160px] -mr-96 -mt-96 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#ffaa00]/8 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />

        <div className="mx-auto max-w-4xl text-center relative z-10">
          <Reveal>
            <div className="size-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-8">
              <Globe className="size-8 text-white" />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <Title
              level="h2"
              className="!text-4xl md:!text-5xl font-bold !text-white mb-8 tracking-tight"
            >
              <T k="aboutPage.visionTitle" />
            </Title>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-medium max-w-3xl mx-auto">
              <T k="aboutPage.visionText" />
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ PILLARS (soft gray, gallery) ═══════════════════ */}
      <section className="py-32 px-6 bg-[#F1F4F7]">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="text-center mb-20 md:mb-28">
              <Title
                level="h2"
                className="!text-4xl md:!text-6xl font-extrabold tracking-tight"
              >
                <T k="aboutPage.pillarsTitle" />
              </Title>
            </div>
          </Reveal>

          <div className="flex flex-col gap-28 md:gap-36">
            {/* ──── Pillar 1 ──── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <Reveal>
                <div className="aspect-[4/3] bg-white rounded-[24px] overflow-hidden relative shadow-[0_12px_28px_0_rgba(0,0,0,0.08),0_2px_4px_0_rgba(0,0,0,0.04)] flex items-center justify-center p-12 group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent" />
                  <BookOpen className="size-40 text-accent/15 relative z-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3" />
                </div>
              </Reveal>
              <Reveal delay={150}>
                <div>
                  <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-accent/10 text-accent font-bold text-xs uppercase tracking-widest mb-6">
                    01
                  </span>
                  <Title
                    level="h3"
                    className="!text-3xl md:!text-4xl font-bold mb-6"
                  >
                    <T k="aboutPage.pillar1Title" />
                  </Title>
                  <p className="text-lg text-slate-500 leading-relaxed mb-8">
                    <T k="aboutPage.pillar1Desc" />
                  </p>
                  <ul className="space-y-5 mb-8">
                    <Bullet icon={Heart} translationKey="aboutPage.pillar1Spiritual" />
                    <Bullet icon={Target} translationKey="aboutPage.pillar1Technical" />
                    <Bullet icon={Users} translationKey="aboutPage.pillar1Humanitarian" />
                  </ul>
                  <p className="text-slate-400 font-medium italic text-[15px]">
                    <T k="aboutPage.pillar1Conclusion" />
                  </p>
                </div>
              </Reveal>
            </div>

            {/* ──── Pillar 2 ──── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <Reveal delay={150} className="order-2 lg:order-1">
                <div>
                  <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#ffaa00]/10 text-[#ffaa00] font-bold text-xs uppercase tracking-widest mb-6">
                    02
                  </span>
                  <Title
                    level="h3"
                    className="!text-3xl md:!text-4xl font-bold mb-6"
                  >
                    <T k="aboutPage.pillar2Title" />
                  </Title>
                  <p className="text-lg text-slate-500 leading-relaxed mb-8">
                    <T k="aboutPage.pillar2Desc" />
                  </p>
                  <ul className="space-y-5">
                    <Bullet icon={CheckCircle2} translationKey="aboutPage.pillar2Evaluation" color="aviation-orange" />
                    <Bullet icon={Network} translationKey="aboutPage.pillar2Connection" color="aviation-orange" />
                    <Bullet icon={ShieldCheck} translationKey="aboutPage.pillar2Security" color="aviation-orange" />
                  </ul>
                </div>
              </Reveal>
              <Reveal className="order-1 lg:order-2">
                <div className="aspect-[4/3] bg-white rounded-[24px] overflow-hidden relative shadow-[0_12px_28px_0_rgba(0,0,0,0.08),0_2px_4px_0_rgba(0,0,0,0.04)] flex items-center justify-center p-12 group">
                  <div className="absolute inset-0 bg-gradient-to-bl from-[#ffaa00]/5 to-transparent" />
                  <Network className="size-40 text-[#ffaa00]/15 relative z-10 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3" />
                </div>
              </Reveal>
            </div>

            {/* ──── Pillar 3 ──── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <Reveal>
                <div className="aspect-[4/3] rounded-[24px] overflow-hidden relative shadow-[0_12px_28px_0_rgba(0,0,0,0.08),0_2px_4px_0_rgba(0,0,0,0.04)] group">
                  {/* Real airplane image */}
                  <Image
                    src="/avion.svg"
                    alt="Aviation illustration"
                    fill
                    className="object-contain p-8 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent pointer-events-none" />
                </div>
              </Reveal>
              <Reveal delay={150}>
                <div>
                  <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-accent/10 text-accent font-bold text-xs uppercase tracking-widest mb-6">
                    03
                  </span>
                  <Title
                    level="h3"
                    className="!text-3xl md:!text-4xl font-bold mb-6"
                  >
                    <T k="aboutPage.pillar3Title" />
                  </Title>
                  <p className="text-lg text-slate-500 leading-relaxed">
                    <T k="aboutPage.pillar3Desc" />
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ MEASUREMENT (white) ═══════════════════════════ */}
      <section className="py-32 px-6 bg-white">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="text-center mb-16">
              <Target className="size-12 text-slate-200 mx-auto mb-6" />
              <Title
                level="h2"
                className="!text-4xl md:!text-5xl font-bold mb-6 tracking-tight"
              >
                <T k="aboutPage.measureTitle" />
              </Title>
              <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
                <T k="aboutPage.measureDesc" />
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: BookMarked, key: "aboutPage.measureQuality", color: "text-accent" },
              { icon: Network, key: "aboutPage.measureAlignment", color: "text-[#ffaa00]" },
              { icon: Heart, key: "aboutPage.measureIntegrity", color: "text-accent" },
            ].map((item, i) => (
              <Reveal key={item.key} delay={i * 120}>
                <div className="bg-[#F7F8FA] rounded-[20px] p-8 border border-[#DEE3E9] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                  <item.icon className={`size-8 ${item.color} mb-6`} />
                  <p className="text-[17px] text-[#1C2B33] font-medium leading-relaxed">
                    <T k={item.key} />
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA (dark immersive card) ══════════════════════ */}
      <section className="py-32 px-6 bg-[#F1F4F7]">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="bg-[#00263E] rounded-[32px] p-10 md:p-16 lg:p-20 relative overflow-hidden shadow-[0_12px_28px_0_rgba(0,0,0,0.2),0_2px_4px_0_rgba(0,0,0,0.1)]">
              {/* Ambient blobs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -mr-48 -mt-48" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#ffaa00]/15 rounded-full blur-[100px] -ml-40 -mb-40" />

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-14">
                  <Reveal>
                    <Title
                      level="h2"
                      className="!text-4xl md:!text-5xl font-extrabold !text-white mb-6 tracking-tight"
                    >
                      <T k="aboutPage.ctaTitle" />
                    </Title>
                  </Reveal>
                  <Reveal delay={100}>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-medium">
                      <T k="aboutPage.ctaDesc" />
                    </p>
                  </Reveal>
                </div>

                {/* CTA Cards */}
                <Reveal delay={200}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
                    {[
                      {
                        icon: GraduationCap,
                        textKey: "aboutPage.ctaPrepare",
                        btnKey: "aboutPage.joinCampus",
                        href: "/campus",
                        primary: true,
                      },
                      {
                        icon: Globe,
                        textKey: "aboutPage.ctaConnect",
                        btnKey: "aboutPage.exploreProjects",
                        href: "/get-involved/project",
                        primary: false,
                      },
                      {
                        icon: HandHeart,
                        textKey: "aboutPage.ctaSupport",
                        btnKey: "aboutPage.supportUs",
                        href: "/donate",
                        primary: false,
                      },
                    ].map((card) => (
                      <div
                        key={card.btnKey}
                        className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 flex flex-col hover:bg-white/10 transition-colors duration-300"
                      >
                        <card.icon className="size-7 text-white/80 mb-4" />
                        <p className="text-white/80 text-[15px] font-medium leading-relaxed mb-6 flex-1">
                          <T k={card.textKey} />
                        </p>
                        <Button
                          asChild
                          className={`w-full rounded-full font-bold h-11 text-sm transition-all duration-200 ${
                            card.primary
                              ? "bg-white text-[#00263E] hover:bg-slate-100"
                              : "bg-transparent border border-white/20 text-white hover:bg-white/10"
                          }`}
                        >
                          <Link href={card.href}>
                            <T k={card.btnKey} />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </Reveal>

                {/* Tagline */}
                <Reveal delay={300}>
                  <div className="text-center pt-8 border-t border-white/10">
                    <p className="text-xl md:text-2xl text-white/80 font-bold tracking-tight">
                      <T k="aboutPage.ctaFooter" />
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ FOOTER (minimal) ══════════════════════════════ */}
      <footer className="py-12 border-t border-[#DEE3E9] text-center text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] bg-white">
        <p>© 2026 HOPE AVIATION. ALL RIGHTS RESERVED.</p>
      </footer>
    </main>
  );
}
