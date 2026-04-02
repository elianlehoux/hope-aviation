"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
}

export function CampusSidebar({ navLinks }: { navLinks: NavLink[] }) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="hidden xl:flex w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center px-6 h-20 border-b border-border">
        <Link href="/" className="group flex items-center w-fit">
          <img 
            src="/logos/Hope Black.svg" 
            alt="Hope Aviation" 
            className="h-20 w-auto drop-shadow-sm scale-[1.5] origin-left transition-transform duration-300 group-hover:scale-[1.55]" 
          />
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
        {navLinks.map((link) => {
          const isActive = mounted && (pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/campus"));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "text-muted-foreground hover:text-white hover:bg-accent"
                }
              `}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-6 py-4">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-accent transition-colors font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    </aside>
  );
}
