"use client";

import { useTranslation } from "@/lib/i18n/context";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Language toggle button.
 * Switches between English and Spanish.
 * Shows the 文A icon (Languages from lucide) matching the reference design.
 */
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useTranslation();

  const handleToggle = () => {
    setLang(lang === "en" ? "es" : "en");
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className={cn(
            "relative size-10 rounded-full transition-all",
            className ? className : "text-slate-500 hover:text-primary hover:bg-slate-50"
          )}
          aria-label={t("langToggle.switchLang")}
        >
          <Languages className="size-[18px]" />
          <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-white text-primary border border-slate-100 rounded-full px-1 leading-tight shadow-sm">
            {lang === "en" ? "EN" : "ES"}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs font-bold">
        {t("langToggle.switchLang")}
      </TooltipContent>
    </Tooltip>
  );
}
