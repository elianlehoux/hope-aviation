"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Eye, ListTree, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { CourseOutline } from "@/lib/campus/learning";
import { CourseOutlinePanel } from "./CourseOutlinePanel";

/**
 * Focused classroom shell: slim top bar, lesson in the center, course outline on the
 * right (desktop) or in a drawer (mobile). The outline is loaded once by the learn layout
 * and kept across lesson navigation.
 */
export function ClassroomFrame({
  outline,
  children,
}: {
  outline: CourseOutline;
  children: React.ReactNode;
}) {
  const { lang } = useTranslation();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  const title = getLocalizedText(outline.title, lang);
  const preview = Boolean(outline.preview);
  const es = lang === "es";

  return (
    <div className="min-h-[100dvh] bg-paper">
      <header className="sticky top-0 z-40 border-b border-primary/10 bg-paper/90 backdrop-blur-xl">
        {preview ? (
          <div className="flex items-center justify-center gap-2 bg-highlight px-4 py-1.5 text-center text-xs font-semibold text-primary">
            <Eye className="size-3.5 shrink-0" aria-hidden />
            {es ? "Vista previa — no se guarda progreso" : "Preview — progress is not saved"}
          </div>
        ) : null}
        <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
          <Button asChild variant="ghost" size="sm" className="shrink-0 text-primary/70">
            <Link href={preview ? `/campus/admin/courses/${outline.courseId}` : `/campus/courses/${outline.courseId}`}>
              <ArrowLeft className="size-4" aria-hidden />
              <span className="hidden sm:inline">
                {preview ? (es ? "Editor" : "Editor") : es ? "Curso" : "Course"}
              </span>
            </Link>
          </Button>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-primary">{title}</p>
          {preview ? null : (
            <div className="hidden items-center gap-2 sm:flex" aria-label={`${outline.progress}%`}>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-primary/10">
                <div className="h-full rounded-full bg-accent" style={{ width: `${outline.progress}%` }} />
              </div>
              <span className="text-xs font-semibold tabular-nums text-primary/60">{outline.progress}%</span>
            </div>
          )}
          <LanguageToggle />
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-expanded={open}
          >
            <ListTree className="size-4" aria-hidden />
            {lang === "es" ? "Temario" : "Outline"}
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <div className="min-w-0 flex-1">{children}</div>
        <aside
          className={cn(
            "sticky hidden w-80 shrink-0 overflow-y-auto border-l border-primary/10 lg:block xl:w-[22rem]",
            preview ? "top-[5.25rem] h-[calc(100dvh-5.25rem)]" : "top-14 h-[calc(100dvh-3.5rem)]",
          )}
        >
          <CourseOutlinePanel outline={outline} />
        </aside>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-primary/30 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={lang === "es" ? "Temario" : "Outline"}
        className={`fixed inset-y-0 right-0 z-50 w-[22rem] max-w-[90vw] overflow-y-auto bg-paper shadow-xl transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-2">
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
            <X className="size-5" />
          </Button>
        </div>
        <CourseOutlinePanel outline={outline} />
      </div>
    </div>
  );
}
