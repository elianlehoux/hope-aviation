"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "fixed bottom-8 right-8 z-50 size-10 rounded-full bg-accent text-white hover:text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-accent hover:scale-110 active:scale-95 border border-accent",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}
      onClick={scrollToTop}
      aria-label="Volver arriba"
    >
      <ArrowUp className="size-5 text-accent-foreground" />
    </Button>
  );
}
