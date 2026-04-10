"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

export function ProfileCompletionBanner() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-amber-50/80 backdrop-blur-xl border border-amber-200/50 p-6 md:p-8 shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-top-4 duration-1000">
      {/* Decorative background element */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />
      
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200/50 shadow-inner">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-amber-900 tracking-tight">{t("profileBanner.title")}</h3>
            <p className="text-sm text-amber-800/80 font-medium leading-relaxed max-w-xl">
              {t("profileBanner.description")}
            </p>
          </div>
        </div>
        
        <div className="flex shrink-0">
          <Button asChild className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 px-6 shadow-lg shadow-amber-600/20 active:scale-95 transition-all">
            <Link href="/campus/profile" className="flex items-center gap-2">
              {t("profileBanner.finishSetup")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
