"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";

interface NavLink {
  href: string;
  labelKey: string;
}

export function CampusSidebar({ navLinks }: { navLinks: NavLink[] }) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="sticky top-0 hidden h-[100dvh] w-64 flex-col border-r border-primary/10 bg-white xl:flex">
      <div className="flex h-16 items-center border-b border-primary/10 px-6">
        <Link href="/" className="group flex items-center">
          <img
            src="/logos/hope-logo.svg"
            alt="Hope Aviation"
            className="h-8 w-auto transition-opacity group-hover:opacity-80"
          />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
        {navLinks.map((link) => {
          const isActive = mounted && (pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/campus"));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-primary/65 hover:bg-paper hover:text-primary"
                }
              `}
            >
              {t(link.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-primary/10 px-6 py-4">
        <Link
          href="/"
          className="text-xs font-medium text-primary/50 transition-colors hover:text-primary"
        >
          {t("campus.backToHome")}
        </Link>
      </div>
    </aside>
  );
}
