"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { CampusPageHeader } from "@/components/features/campus/ui/page-header";
import { DataList, type DataListColumn } from "@/components/features/campus/ui/data-list";
import { EmptyState } from "@/components/features/campus/ui/empty-state";
import { StatusBadge } from "@/components/features/campus/ui/status-badge";
import type { PeopleRow, PersonRole } from "@/lib/campus/people";
import { PeopleFilters, peopleHref, type PeopleQuery } from "./PeopleFilters";

export function roleLabel(role: PersonRole | null, es: boolean) {
  if (role === "admin") return "Admin";
  if (role === "instructor") return es ? "Instructor" : "Instructor";
  if (role === "student") return es ? "Alumno" : "Student";
  return "—";
}

export function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(lang === "es" ? "es-AR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PeopleDirectory({
  rows,
  total,
  pageSize,
  query,
  isAdmin,
}: {
  rows: PeopleRow[];
  total: number;
  pageSize: number;
  query: PeopleQuery;
  isAdmin: boolean;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const page = query.page ?? 1;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const filtered = Boolean(query.q || query.role || query.status);

  const columns: DataListColumn<PeopleRow>[] = [
    {
      key: "name",
      header: es ? "Persona" : "Person",
      cell: (r) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-primary">{r.fullName}</span>
          <span className="truncate text-xs font-normal text-primary/65">{r.email}</span>
        </span>
      ),
    },
    ...(isAdmin
      ? [{ key: "role", header: es ? "Rol" : "Role", cell: (r: PeopleRow) => roleLabel(r.role, es) }]
      : []),
    {
      key: "courses",
      header: es ? "Cursos" : "Courses",
      className: "tabular-nums",
      cell: (r) => r.courses,
    },
    {
      key: "status",
      header: es ? "Estado" : "Status",
      cell: (r) =>
        r.isActive ? (
          <span className="text-sm text-primary/70">{es ? "Activa" : "Active"}</span>
        ) : (
          <StatusBadge status="inactive" />
        ),
    },
    {
      key: "joined",
      header: es ? "Alta" : "Joined",
      hideOnMobile: true,
      className: "whitespace-nowrap text-primary/65",
      cell: (r) => formatDate(r.joinedAt, lang),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      <CampusPageHeader
        title={es ? "Personas" : "People"}
        description={
          isAdmin
            ? es
              ? "Buscá a cualquier persona del campus, mirá su avance y gestioná su cuenta."
              : "Find anyone on campus, check their progress and manage their account."
            : es
              ? "Buscá alumnos y mirá su avance en cada curso."
              : "Find learners and check their progress in each course."
        }
      />

      <PeopleFilters query={query} showRole={isAdmin} />

      <p className="text-sm text-primary/65" aria-live="polite">
        {total === 1
          ? es
            ? "1 persona"
            : "1 person"
          : es
            ? `${total} personas`
            : `${total} people`}
      </p>

      <DataList
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        rowHref={(r) => `/campus/admin/people/${r.id}`}
        empty={
          <EmptyState
            icon={Users}
            title={filtered ? (es ? "No encontramos a nadie" : "No one found") : es ? "Todavía no hay personas" : "No people yet"}
            description={
              filtered
                ? es
                  ? "Probá con otro nombre o sacá algún filtro."
                  : "Try another name or clear a filter."
                : undefined
            }
            action={
              filtered ? (
                <Link
                  href="/campus/admin/people"
                  className="inline-flex items-center rounded-full border border-primary/15 px-4 py-2 text-sm font-semibold text-primary hover:bg-paper"
                >
                  {es ? "Limpiar filtros" : "Clear filters"}
                </Link>
              ) : undefined
            }
          />
        }
      />

      {pages > 1 ? (
        <nav className="flex items-center justify-between gap-3" aria-label={es ? "Paginación" : "Pagination"}>
          <PageLink href={peopleHref({ ...query, page: page - 1 })} disabled={page <= 1}>
            <ChevronLeft className="size-4" aria-hidden />
            {es ? "Anterior" : "Previous"}
          </PageLink>
          <span className="text-sm tabular-nums text-primary/65">
            {es ? `Página ${page} de ${pages}` : `Page ${page} of ${pages}`}
          </span>
          <PageLink href={peopleHref({ ...query, page: page + 1 })} disabled={page >= pages}>
            {es ? "Siguiente" : "Next"}
            <ChevronRight className="size-4" aria-hidden />
          </PageLink>
        </nav>
      ) : null}
    </div>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  const cls =
    "inline-flex items-center gap-1 rounded-full border border-primary/15 px-4 py-2 text-sm font-semibold text-primary";
  if (disabled) {
    return (
      <span aria-disabled="true" className={cn(cls, "opacity-40")}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={cn(cls, "hover:bg-paper")}>
      {children}
    </Link>
  );
}
