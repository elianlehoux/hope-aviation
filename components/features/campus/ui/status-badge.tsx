"use client";

import { Archive, CheckCircle2, CircleDashed, CircleSlash, Clock, Globe, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

export type BadgeStatus =
  | "draft"
  | "published"
  | "archived"
  | "active"
  | "completed"
  | "cancelled"
  | "passed"
  | "failed"
  | "inactive";

const STATUS: Record<BadgeStatus, { icon: LucideIcon; es: string; en: string; tone: string }> = {
  draft: { icon: CircleDashed, es: "Borrador", en: "Draft", tone: "bg-primary/5 text-primary/70" },
  published: { icon: Globe, es: "Publicado", en: "Published", tone: "bg-success/10 text-success" },
  archived: { icon: Archive, es: "Archivado", en: "Archived", tone: "bg-primary/5 text-primary/50" },
  active: { icon: Clock, es: "En curso", en: "In progress", tone: "bg-accent/10 text-accent" },
  completed: { icon: CheckCircle2, es: "Completado", en: "Completed", tone: "bg-highlight/20 text-primary" },
  cancelled: { icon: CircleSlash, es: "Cancelado", en: "Cancelled", tone: "bg-primary/5 text-primary/50" },
  passed: { icon: CheckCircle2, es: "Aprobado", en: "Passed", tone: "bg-success/10 text-success" },
  failed: { icon: XCircle, es: "No aprobado", en: "Not passed", tone: "bg-destructive/10 text-destructive" },
  inactive: { icon: CircleSlash, es: "Inactivo", en: "Inactive", tone: "bg-primary/5 text-primary/50" },
};

/** Status pill that always pairs an icon with a text label (never color alone). */
export function StatusBadge({ status, className }: { status: BadgeStatus; className?: string }) {
  const { lang } = useTranslation();
  const s = STATUS[status];
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        s.tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {lang === "es" ? s.es : s.en}
    </span>
  );
}
