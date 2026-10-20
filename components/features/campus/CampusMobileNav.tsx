"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

interface NavLink {
  href: string;
  labelKey: string;
}

export function CampusMobileNav({ navLinks }: { navLinks: NavLink[] }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  // Close menu automatically if the route changes
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when overlay is active
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="xl:hidden flex items-center">
      {/* Trigger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="mr-2 text-primary/70 hover:bg-paper hover:text-primary"
      >
        <Menu className="size-5" />
      </Button>

      {/* Backdrop (Darkened and blurred) */}
      <div
        className={`fixed inset-0 z-50 bg-background/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Nav Panel */}
      <div
        className={`fixed z-50 flex flex-col border-primary/10 bg-paper shadow-xl transition-transform duration-300 ease-in-out
          max-lg:inset-x-0 max-lg:top-0 max-lg:w-full max-lg:max-h-[70vh] max-lg:border-b max-lg:rounded-b-2xl
          lg:inset-y-0 lg:left-0 lg:h-full lg:w-80 lg:border-r
          ${
            isOpen
              ? "max-lg:translate-y-0 lg:translate-x-0"
              : "max-lg:-translate-y-full lg:-translate-x-full"
          }
        `}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-primary/10 px-6">
          <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
            <img
              src="/logos/hope-logo.svg"
              alt="Hope Aviation"
              className="h-8 w-auto"
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="text-primary/70 hover:bg-white hover:text-primary"
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navLinks.map((link) => {
            // Simplified active path matching
            const isActive = mounted && (pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/campus"));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-primary/70 hover:bg-white hover:text-primary"
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-primary/10 px-6 py-4">
          <Link
            href="/"
            className="text-xs font-medium text-primary/50 transition-colors hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            {t("campus.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
