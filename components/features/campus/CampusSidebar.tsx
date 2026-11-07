"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { CampusNavList, type CampusNavLink } from "./nav/CampusNavList";

/** Whether the current route is the focused classroom (no campus chrome). */
export function isClassroomPath(pathname: string) {
  return /^\/campus\/courses\/[^/]+\/learn(\/|$)/.test(pathname);
}

export function CampusSidebar({ navLinks }: { navLinks: CampusNavLink[] }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  if (isClassroomPath(pathname)) return null;

  return (
    <aside className="sticky top-0 hidden h-[100dvh] w-60 shrink-0 flex-col border-r border-primary/10 bg-paper xl:flex">
      <div className="flex h-16 items-center px-5">
        <Link href="/campus" className="flex items-center" aria-label="Hope Aviation campus">
          <img src="/logos/hope-logo.svg" alt="Hope Aviation" className="h-7 w-auto" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <CampusNavList links={navLinks} />
      </div>

      <div className="px-5 py-4">
        <Link
          href="/"
          className="-my-2 inline-flex items-center gap-1.5 py-2 text-xs font-medium text-primary/65 transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          {t("campus.backToHome")}
        </Link>
      </div>
    </aside>
  );
}
