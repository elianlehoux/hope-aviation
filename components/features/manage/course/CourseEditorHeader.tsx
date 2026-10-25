"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive, ArrowLeft, Eye, MoreHorizontal, RotateCcw, Rocket } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/features/campus/ui/status-badge";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import { cn } from "@/lib/utils";
import type { ChecklistIssue } from "@/lib/campus/publish-checklist";
import type { CourseStatus, TranslatedText } from "@/types/database";
import { api, courseRoutes, manageHref } from "./api";
import { PublishChecklist } from "./PublishChecklist";

/** Editor header: back link, title + status, preview/publish actions and the tab bar. */
export function CourseEditorHeader({
  courseId,
  title,
  status,
  issues,
}: {
  courseId: string;
  title: TranslatedText;
  status: CourseStatus;
  issues: ChecklistIssue[];
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const pathname = usePathname();
  const [publishOpen, setPublishOpen] = React.useState(false);

  const setStatus = async (next: CourseStatus) => {
    const res = await api(courseRoutes(courseId).course, "PATCH", { status: next });
    if (!res.ok) {
      toast.error(es ? "No se pudo cambiar el estado." : "Couldn't change the status.");
      return;
    }
    toast.success(
      next === "draft"
        ? es
          ? "El curso volvió a borrador. Ya no aparece en el catálogo."
          : "Back to draft. It no longer shows in the catalog."
        : es
          ? "Curso archivado."
          : "Course archived.",
    );
    router.refresh();
  };

  const tabs = [
    { href: manageHref.course(courseId), es: "Contenido", en: "Content" },
    { href: manageHref.settings(courseId), es: "Ajustes", en: "Settings" },
    { href: manageHref.learners(courseId), es: "Alumnos", en: "Learners" },
  ];

  return (
    <header className="space-y-5">
      <Link
        href={manageHref.courses}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary/55 hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {es ? "Cursos" : "Courses"}
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status={status} />
            {status !== "published" && issues.length > 0 ? (
              <span className="text-xs text-primary/50">
                {es
                  ? `${issues.length} ${issues.length === 1 ? "pendiente" : "pendientes"} para publicar`
                  : `${issues.length} to fix before publishing`}
              </span>
            ) : null}
          </div>
          <h1 className="break-words font-display text-3xl font-semibold tracking-tight text-primary md:text-[2.25rem] md:leading-tight">
            {getLocalizedText(title, lang)}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={manageHref.preview(courseId)}
            target="_blank"
            className={buttonVariants({ variant: "outline" })}
          >
            <Eye aria-hidden />
            {es ? "Vista previa" : "Preview"}
          </Link>
          {status !== "published" ? (
            <Button onClick={() => setPublishOpen(true)}>
              <Rocket aria-hidden />
              {es ? "Publicar" : "Publish"}
            </Button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label={es ? "Más acciones" : "More actions"}>
                <MoreHorizontal aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {status !== "draft" ? (
                <DropdownMenuItem onSelect={() => void setStatus("draft")}>
                  <RotateCcw aria-hidden />
                  {es ? "Pasar a borrador" : "Move to draft"}
                </DropdownMenuItem>
              ) : null}
              {status !== "archived" ? (
                <DropdownMenuItem onSelect={() => void setStatus("archived")}>
                  <Archive aria-hidden />
                  {es ? "Archivar" : "Archive"}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <nav aria-label={es ? "Secciones del curso" : "Course sections"} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-6 border-b border-primary/10">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "-mb-px inline-flex h-11 items-center border-b-2 text-sm font-semibold transition-colors",
                    active ? "border-primary text-primary" : "border-transparent text-primary/50 hover:text-primary",
                  )}
                >
                  {es ? t.es : t.en}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <PublishChecklist courseId={courseId} issues={issues} open={publishOpen} onOpenChange={setPublishOpen} />
    </header>
  );
}
