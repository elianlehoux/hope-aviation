"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { CampusNavList, type CampusNavLink } from "./nav/CampusNavList";

export function CampusMobileNav({ navLinks }: { navLinks: CampusNavLink[] }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  React.useEffect(() => setOpen(false), [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Menu"
        aria-expanded={open}
        className="text-primary/70"
      >
        <Menu className="size-5" />
      </Button>

      <div
        className={`fixed inset-0 z-50 bg-primary/30 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-paper shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <img src="/logos/hope-logo.svg" alt="Hope Aviation" className="h-7 w-auto" />
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close" className="text-primary/70">
            <X className="size-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <CampusNavList links={navLinks} onNavigate={() => setOpen(false)} />
        </div>
        <div className="px-5 py-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary/50 hover:text-primary">
            <ArrowLeft className="size-3.5" aria-hidden />
            {t("campus.backToHome")}
          </Link>
        </div>
      </div>
    </>
  );
}
