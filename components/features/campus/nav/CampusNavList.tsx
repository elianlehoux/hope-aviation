"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  Home,
  Library,
  Mail,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

export interface CampusNavLink {
  href: string;
  labelKey: string;
}

const ICONS: Record<string, LucideIcon> = {
  "/campus": Home,
  "/campus/courses": BookOpen,
  "/campus/certificates": Award,
  "/campus/profile": UserRound,
  "/campus/admin/courses": Library,
  "/campus/admin/people": Users,
  "/campus/admin/newsletter": Mail,
};

function isActive(pathname: string, href: string) {
  if (href === "/campus") return pathname === "/campus";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Campus navigation grouped into "learn" and "manage" sections. */
export function CampusNavList({
  links,
  onNavigate,
}: {
  links: CampusNavLink[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { t, lang } = useTranslation();

  const learn = links.filter((l) => !l.href.startsWith("/campus/admin"));
  const manage = links.filter((l) => l.href.startsWith("/campus/admin"));

  const renderGroup = (group: CampusNavLink[]) =>
    group.map((link) => {
      const Icon = ICONS[link.href] ?? BookOpen;
      const active = isActive(pathname, link.href);
      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            active
              ? "bg-primary text-white"
              : "text-primary/70 hover:bg-paper-deep hover:text-primary",
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          {t(link.labelKey)}
        </Link>
      );
    });

  return (
    <nav className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">{renderGroup(learn)}</div>
      {manage.length > 0 ? (
        <div className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-xs font-semibold text-primary/65">
            {lang === "es" ? "Gestión" : "Manage"}
          </p>
          {renderGroup(manage)}
        </div>
      ) : null}
    </nav>
  );
}
