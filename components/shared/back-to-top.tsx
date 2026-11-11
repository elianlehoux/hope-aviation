"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const { lang } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 600);
    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
      className={cn(
        "fixed bottom-5 right-5 z-40 size-11 rounded-full border border-primary/10 bg-white text-primary shadow-[0_12px_28px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.1)] transition-[opacity,transform] duration-300 hover:bg-paper hover:text-primary motion-reduce:transition-none sm:bottom-8 sm:right-8",
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
      onClick={scrollToTop}
      aria-label={lang === "es" ? "Volver arriba" : "Back to top"}
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </Button>
  );
}
