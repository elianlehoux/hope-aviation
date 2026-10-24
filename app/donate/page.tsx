"use client";

import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Send } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export default function DonatePage() {
  const { t } = useTranslation();

  return (
    <main className="relative min-h-screen flex flex-col bg-white text-slate-900 font-inter">
      <Navbar />

      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">
        {/* Apple-style background effect */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(23,73,255,0.05),transparent)]" />
        
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Icon/Decoration */}
          <div className="relative inline-flex items-center justify-center scale-125 mb-4">
             <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
             <div className="relative size-24 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-2xl">
                <Heart className="size-10 text-accent fill-accent/10 animate-pulse" />
             </div>
          </div>

          <div className="space-y-4">
            <Title level="h1" className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary">
              {t("donate.title")}
            </Title>
            <p className="max-w-lg mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
              {t("donate.description")}
            </p>
          </div>

          {/* Placeholder/Coming Soon Card */}
          <div className="relative p-1 px-1 rounded-3xl bg-gradient-to-br from-accent/10 to-transparent">
            <div className="bg-white rounded-[22px] p-8 md:p-12 border border-slate-100 shadow-xl">
               <div className="flex flex-col items-center gap-6 text-center">
                  <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center">
                     <Send className="size-5 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-primary">{t("donate.comingSoon")}</h3>
                    <p className="text-slate-400 font-medium">{t("donate.subscribeText")}</p>
                  </div>
                  <div className="w-full max-w-sm flex gap-2">
                    <input 
                      type="email" 
                      placeholder={t("donate.emailPlaceholder")} 
                      className="flex-1 h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                    />
                    <Button size="icon" className="h-12 w-12 rounded-xl bg-primary text-white">
                       <ArrowLeft className="size-4 rotate-180" />
                    </Button>
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-8">
            <Button asChild variant="ghost" className="text-slate-500 hover:text-primary transition-colors cursor-pointer group">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                {t("donate.backToHome")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 w-full h-[50vh] bg-gradient-to-t from-slate-50/50 to-transparent -z-10" />
    </main>
  );
}
