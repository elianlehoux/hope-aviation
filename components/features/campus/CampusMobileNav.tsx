"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavLink {
  href: string;
  label: string;
}

export function CampusMobileNav({ navLinks }: { navLinks: NavLink[] }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  // Close menu automatically if the route changes
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
        className="text-muted-foreground hover:bg-accent/10 hover:text-accent mr-3"
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
        className={`fixed z-50 flex flex-col bg-white/98 supports-[backdrop-filter]:bg-white/90 backdrop-blur-2xl border-border shadow-2xl transition-transform duration-300 ease-in-out
          max-lg:inset-x-0 max-lg:top-0 max-lg:w-full max-lg:max-h-[50vh] max-lg:border-b max-lg:rounded-b-2xl
          lg:inset-y-0 lg:left-0 lg:w-80 lg:h-full lg:border-r
          ${
            isOpen
              ? "max-lg:translate-y-0 lg:translate-x-0"
              : "max-lg:-translate-y-full lg:-translate-x-full"
          }
        `}
      >
        <div className="flex items-center justify-between px-6 h-20 border-b border-border/50 shrink-0">
          <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
            <img 
              src="/logos/Hope Black.svg" 
              alt="Hope Aviation" 
              className="h-12 w-auto scale-[1.2] origin-left" 
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="hover:bg-accent/10 hover:text-accent text-slate-500"
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navLinks.map((link) => {
            // Simplified active path matching
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/campus");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-accent/10 text-accent font-semibold"
                      : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/50 px-6 py-5 shrink-0 bg-background/50">
          <Link
            href="/"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsOpen(false)}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
