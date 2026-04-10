"use client";

import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Video, 
  BarChart3, 
  Library, 
  Users, 
  Award, 
  ArrowRight,
  CheckCircle2,
  Heart
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

/**
 * Landing Page — Public-facing homepage for Hope Aviation.
 * Serves as the entry point showcasing the platform and
 * providing navigation to the virtual campus.
 */
export default function LandingPage() {
  const { t } = useTranslation();

  const features = [
    {
      titleKey: "landing.featureInteractiveCourses",
      descKey: "landing.featureInteractiveCoursesDesc",
      icon: <BookOpen className="size-6 text-accent" />,
    },
    {
      titleKey: "landing.featureLiveSessions",
      descKey: "landing.featureLiveSessionsDesc",
      icon: <Video className="size-6 text-accent" />,
    },
    {
      titleKey: "landing.featureProgressTracking",
      descKey: "landing.featureProgressTrackingDesc",
      icon: <BarChart3 className="size-6 text-accent" />,
    },
    {
      titleKey: "landing.featureResourceLibrary",
      descKey: "landing.featureResourceLibraryDesc",
      icon: <Library className="size-6 text-accent" />,
    },
    {
      titleKey: "landing.featureCommunity",
      descKey: "landing.featureCommunityDesc",
      icon: <Users className="size-6 text-accent" />,
    },
    {
      titleKey: "landing.featureCertifications",
      descKey: "landing.featureCertificationsDesc",
      icon: <Award className="size-6 text-accent" />,
    },
  ];

  return (
    <main className="relative min-h-screen flex flex-col bg-white text-slate-900 overflow-hidden font-inter">
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-32 lg:py-40">
        {/* Apple-style background effect */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(23,73,255,0.08),transparent)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(0,38,62,0.03)_0deg,transparent_360deg)] blur-3xl -z-10" />

        <div className="space-y-6 max-w-4xl mx-auto">
          <Badge variant="secondary" className="px-4 py-1.5 text-xs font-bold tracking-wider uppercase bg-accent/5 text-accent border-accent/10 mb-4 cursor-default">
            {t("landing.heroBadge")}
          </Badge>
          
          <Title level="h1" className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-primary">
            {t("landing.heroTitle1")}
            <br />
            <span className="text-accent">{t("landing.heroTitle2")}</span>
          </Title>

          <p className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
            {t("landing.heroDescription")}
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-10 text-lg shadow-xl shadow-primary/20 group bg-accent hover:bg-accent/90 border-none">
              <Link href="/donate" className="flex items-center gap-2">
                <Heart className="size-5 fill-white/20" />
                {t("landing.donateNow")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg border-slate-200 hover:bg-slate-50 group">
              <Link href="/campus" className="flex items-center gap-2">
                {t("landing.enterCampus")}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section
        id="features"
        className="w-full bg-slate-50/50 border-y border-slate-100 py-24 px-6 relative"
      >
        <div className="mx-auto max-w-5xl text-center mb-16">
          <Title level="h2" className="text-3xl md:text-4xl font-extrabold text-primary">
            {t("landing.featuresTitle")}
          </Title>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-lg font-medium">
            {t("landing.featuresDescription")}
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.titleKey} className="border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white group">
              <CardHeader>
                <div className="size-12 rounded-2xl bg-accent/5 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-bold text-primary">{t(feature.titleKey)}</CardTitle>
                <CardDescription className="text-slate-500 pt-2 font-medium">
                  {t(feature.descKey)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="w-full py-32 px-6 relative overflow-hidden">
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <Title level="h2" className="text-3xl md:text-4xl font-extrabold text-primary mb-8">
            {t("landing.aboutTitle")}
          </Title>
          <div className="relative p-8 md:p-12 rounded-3xl bg-white border border-slate-100 shadow-2xl shadow-slate-200/50">
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              {t("landing.aboutDescription")}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-accent" />
                <span className="font-bold text-sm text-primary">{t("landing.aboutInnovation")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-accent" />
                <span className="font-bold text-sm text-primary">{t("landing.aboutExcellence")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-accent" />
                <span className="font-bold text-sm text-primary">{t("landing.aboutCommitment")}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtly decorative circles */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-slate-100 py-16 px-6 bg-white overflow-hidden">
        <div className="mx-auto max-w-7xl relative">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
               <img 
                 src="/logos/Hope Black.svg" 
                 alt="Hope Aviation" 
                 className="h-12 w-auto scale-125 origin-left" 
               />
               <p className="text-slate-400 font-medium text-sm mt-2">
                 {t("landing.footerTagline")}
               </p>
            </div>
            
            <div className="flex gap-8 md:gap-12 font-bold text-primary text-sm">
              <a href="#features" className="hover:text-accent transition-colors">{t("landing.footerFeatures")}</a>
              <a href="#about" className="hover:text-accent transition-colors">{t("landing.footerAbout")}</a>
              <Link href="/campus" className="hover:text-accent transition-colors">{t("landing.footerCampus")}</Link>
            </div>

            <div className="text-slate-400 font-medium text-sm">
              <p>{t("landing.footerCopyright")}</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
