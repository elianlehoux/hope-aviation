"use client";

import * as React from "react";
import { BookOpen } from "lucide-react";
import { CampusPageHeader } from "@/components/features/campus/ui/page-header";
import { DataList, type DataListColumn } from "@/components/features/campus/ui/data-list";
import { EmptyState } from "@/components/features/campus/ui/empty-state";
import { StatusBadge } from "@/components/features/campus/ui/status-badge";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import { cn } from "@/lib/utils";
import type { ManagedCourseRow } from "@/lib/campus/manage";
import type { CourseStatus } from "@/types/database";
import { manageHref } from "./api";
import { NewCourseDialog } from "./NewCourseDialog";

type Filter = "all" | CourseStatus;

const FILTERS: { key: Filter; es: string; en: string }[] = [
  { key: "all", es: "Todos", en: "All" },
  { key: "draft", es: "Borradores", en: "Drafts" },
  { key: "published", es: "Publicados", en: "Published" },
  { key: "archived", es: "Archivados", en: "Archived" },
];

export function CourseList({ courses }: { courses: ManagedCourseRow[] }) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const [filter, setFilter] = React.useState<Filter>("all");

  const counts = React.useMemo(() => {
    const c: Record<Filter, number> = { all: courses.length, draft: 0, published: 0, archived: 0 };
    for (const course of courses) c[course.status] += 1;
    return c;
  }, [courses]);

  const rows = filter === "all" ? courses : courses.filter((c) => c.status === filter);
  const date = new Intl.DateTimeFormat(es ? "es-AR" : "en-US", { day: "numeric", month: "short", year: "numeric" });

  const columns: DataListColumn<ManagedCourseRow>[] = [
    {
      key: "title",
      header: es ? "Curso" : "Course",
      cell: (c) => <span className="font-display text-[15px] font-semibold">{getLocalizedText(c.title, lang)}</span>,
    },
    { key: "status", header: es ? "Estado" : "Status", cell: (c) => <StatusBadge status={c.status} /> },
    {
      key: "content",
      header: es ? "Contenido" : "Content",
      cell: (c) => (
        <span className="tabular-nums">
          {c.moduleCount} {es ? (c.moduleCount === 1 ? "módulo" : "módulos") : c.moduleCount === 1 ? "module" : "modules"}
          <span className="text-primary/35"> · </span>
          {c.lessonCount} {es ? (c.lessonCount === 1 ? "clase" : "clases") : c.lessonCount === 1 ? "class" : "classes"}
        </span>
      ),
    },
    {
      key: "learners",
      header: es ? "Alumnos" : "Learners",
      cell: (c) => <span className="tabular-nums">{c.learnerCount}</span>,
    },
    {
      key: "updated",
      header: es ? "Actualizado" : "Updated",
      cell: (c) => <span className="text-primary/65">{date.format(new Date(c.updatedAt))}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary/65">
          {es ? "Gestión" : "Management"}
        </p>
        <CampusPageHeader
          title={es ? "Cursos" : "Courses"}
          description={
            es
              ? "Armá los módulos, las clases y los exámenes de cada curso, y publicalo cuando esté listo."
              : "Build each course's modules, classes and exams, and publish it when it's ready."
          }
          actions={<NewCourseDialog />}
        />
      </div>

      {courses.length > 0 ? (
        <div role="group" aria-label={es ? "Filtrar por estado" : "Filter by status"} className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-primary/15 bg-white/60 text-primary/70 hover:bg-white hover:text-primary",
                )}
              >
                {es ? f.es : f.en}
                <span className={cn("tabular-nums text-xs", active ? "text-white/70" : "text-primary/65")}>
                  {counts[f.key]}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <DataList
        rows={rows}
        columns={columns}
        rowKey={(c) => c.id}
        rowHref={(c) => manageHref.course(c.id)}
        empty={
          courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={es ? "Todavía no hay cursos" : "No courses yet"}
              description={
                es
                  ? "Creá el primero: le ponés un título y lo vas armando módulo por módulo."
                  : "Create the first one: give it a title and build it module by module."
              }
              action={<NewCourseDialog />}
            />
          ) : (
            <EmptyState
              icon={BookOpen}
              title={es ? "Nada por acá" : "Nothing here"}
              description={es ? "No hay cursos con este estado." : "No courses with this status."}
            />
          )
        }
      />
    </div>
  );
}
