"use client";

import { Users } from "lucide-react";
import { DataList, type DataListColumn } from "@/components/features/campus/ui/data-list";
import { EmptyState } from "@/components/features/campus/ui/empty-state";
import { StatusBadge } from "@/components/features/campus/ui/status-badge";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import { cn } from "@/lib/utils";
import type { CourseLearnerRow } from "@/lib/campus/manage";
import { manageHref } from "./api";
import { EnrollByEmailDialog } from "./EnrollByEmailDialog";

/** Alumnos tab: everyone enrolled, with progress, last exam and status. */
export function LearnerTable({
  courseId,
  learners,
  isAdmin,
}: {
  courseId: string;
  learners: CourseLearnerRow[];
  isAdmin: boolean;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const date = new Intl.DateTimeFormat(es ? "es-AR" : "en-US", { day: "numeric", month: "short", year: "numeric" });
  const active = learners.filter((l) => l.status === "active").length;
  const completed = learners.filter((l) => l.status === "completed").length;

  const columns: DataListColumn<CourseLearnerRow>[] = [
    {
      key: "name",
      header: es ? "Alumno" : "Learner",
      cell: (l) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-primary">{l.fullName || l.email || "—"}</span>
          {l.fullName && l.email ? <span className="truncate text-xs font-normal text-primary/65">{l.email}</span> : null}
        </span>
      ),
    },
    {
      key: "progress",
      header: es ? "Progreso" : "Progress",
      cell: (l) => (
        <span className="flex items-center gap-2.5">
          <span className="h-1.5 w-20 overflow-hidden rounded-full bg-muted" aria-hidden>
            <span
              className={cn("block h-full rounded-full", l.progress >= 100 ? "bg-success" : "bg-accent")}
              style={{ width: `${Math.min(100, l.progress)}%` }}
            />
          </span>
          <span className="tabular-nums">{l.progress}%</span>
        </span>
      ),
    },
    {
      key: "exam",
      header: es ? "Último examen" : "Last exam",
      cell: (l) =>
        l.lastExam ? (
          <span className="flex min-w-0 items-center gap-2">
            <span className="tabular-nums font-semibold">{l.lastExam.score}%</span>
            <StatusBadge status={l.lastExam.passed ? "passed" : "failed"} />
            <span className="hidden truncate text-xs text-primary/65 lg:inline">{getLocalizedText(l.lastExam.title, lang)}</span>
          </span>
        ) : (
          <span className="text-primary/65">{es ? "Sin rendir" : "Not taken"}</span>
        ),
    },
    { key: "status", header: es ? "Estado" : "Status", cell: (l) => <StatusBadge status={l.status} /> },
    {
      key: "enrolled",
      header: es ? "Inscripción" : "Enrolled",
      cell: (l) => <span className="text-primary/65">{date.format(new Date(l.enrolledAt))}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-primary">
            {es ? "Alumnos" : "Learners"} <span className="tabular-nums text-primary/65">{learners.length}</span>
          </h2>
          {learners.length > 0 ? (
            <p className="mt-1 text-sm text-primary/65">
              {es
                ? `${active} en curso · ${completed} ${completed === 1 ? "completó" : "completaron"}`
                : `${active} in progress · ${completed} completed`}
            </p>
          ) : null}
        </div>
        {isAdmin ? <EnrollByEmailDialog courseId={courseId} /> : null}
      </div>

      <DataList
        rows={learners}
        columns={columns}
        rowKey={(l) => l.userId}
        rowHref={(l) => manageHref.person(l.userId)}
        empty={
          <EmptyState
            icon={Users}
            title={es ? "Todavía no hay alumnos" : "No learners yet"}
            description={
              es
                ? "Cuando alguien se inscriba vas a ver acá su progreso y sus exámenes."
                : "When someone enrolls you'll see their progress and exams here."
            }
          />
        }
      />
    </div>
  );
}
