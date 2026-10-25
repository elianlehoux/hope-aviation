"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Check, ClipboardCheck, FileText, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { CourseOutline, OutlineItem } from "@/lib/campus/learning";

function ItemIcon({ item }: { item: OutlineItem }) {
  const done = item.kind === "class" ? item.completed : item.passed;
  if (done) {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
        <Check className="size-3.5" strokeWidth={3} aria-hidden />
      </span>
    );
  }
  if (item.locked) return <Lock className="size-4 shrink-0 text-primary/35" aria-hidden />;
  const Icon =
    item.kind === "final" ? Award : item.kind === "exam" ? ClipboardCheck : item.hasVideo ? PlayCircle : FileText;
  return <Icon className="size-[1.125rem] shrink-0 text-primary/55" aria-hidden />;
}

function itemMeta(item: OutlineItem, lang: "es" | "en") {
  if (item.kind === "class") {
    const parts: string[] = [];
    if (item.hasVideo) parts.push("Video");
    if (item.hasText) parts.push(lang === "es" ? "Lectura" : "Reading");
    if (item.durationMinutes) parts.push(`${item.durationMinutes} min`);
    return parts.join(" · ");
  }
  if (item.kind === "exam") {
    return lang === "es"
      ? `Evaluación · ${item.attemptsUsed}/${item.maxAttempts} intentos`
      : `Assessment · ${item.attemptsUsed}/${item.maxAttempts} attempts`;
  }
  return lang === "es" ? "Certificación del curso" : "Course certification";
}

/** Course outline with progress; highlights the current route. */
export function CourseOutlinePanel({ outline }: { outline: CourseOutline }) {
  const pathname = usePathname();
  const { lang } = useTranslation();
  const final = outline.items.find((i) => i.kind === "final");

  const renderItem = (item: OutlineItem) => {
    const active = pathname === item.href;
    const content = (
      <>
        <ItemIcon item={item} />
        <span className="min-w-0 flex-1">
          <span className={cn("block text-sm leading-snug", active ? "font-semibold text-primary" : "text-primary/80")}>
            {getLocalizedText(item.title, lang)}
          </span>
          <span className="mt-0.5 block text-xs text-primary/50">{itemMeta(item, lang)}</span>
        </span>
      </>
    );
    const className = cn(
      "flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors",
      active ? "bg-white shadow-[0_1px_0_rgba(0,38,62,0.06)] ring-1 ring-primary/10" : "hover:bg-paper-deep",
      item.locked && "cursor-not-allowed opacity-60 hover:bg-transparent",
    );
    return (
      <li key={item.id}>
        {item.locked ? (
          <div className={className} aria-disabled>
            {content}
          </div>
        ) : (
          <Link href={item.href} className={className} aria-current={active ? "page" : undefined}>
            {content}
          </Link>
        )}
      </li>
    );
  };

  return (
    <nav className="px-3 pb-10 pt-5" aria-label={lang === "es" ? "Temario del curso" : "Course outline"}>
      {outline.preview ? null : (
      <div className="mb-5 px-3">
        <p className="text-xs font-semibold text-primary/50">{lang === "es" ? "Tu progreso" : "Your progress"}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary/10">
            <div
              className={cn("h-full rounded-full", outline.progress === 100 ? "bg-success" : "bg-accent")}
              style={{ width: `${outline.progress}%` }}
            />
          </div>
          <span className="text-sm font-semibold tabular-nums text-primary">{outline.progress}%</span>
        </div>
      </div>
      )}

      <ol className="space-y-6">
        {outline.modules.map((module) => (
          <li key={module.id}>
            <div className="mb-1.5 flex items-baseline gap-2 px-3">
              <span className="text-xs font-semibold text-primary/45">
                {lang === "es" ? "Módulo" : "Module"} {module.index + 1}
              </span>
              {module.locked ? <Lock className="size-3 text-primary/35" aria-label="locked" /> : null}
            </div>
            <p className="mb-2 px-3 font-display text-[15px] font-semibold leading-snug text-primary">
              {getLocalizedText(module.title, lang)}
            </p>
            <ul className="space-y-0.5">{module.items.map(renderItem)}</ul>
          </li>
        ))}
        {final ? (
          <li>
            <ul>{renderItem(final)}</ul>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
