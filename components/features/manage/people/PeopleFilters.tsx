"use client";

import Form from "next/form";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { fieldControl } from "@/components/features/campus/ui/field";
import type { PersonRole, PersonStatus } from "@/lib/campus/people";

export type PeopleQuery = { q?: string; role?: PersonRole; status?: PersonStatus; page?: number };

const BASE = "/campus/admin/people";

/** Builds a people URL from the current filters, dropping empty values and page 1. */
export function peopleHref(query: PeopleQuery) {
  const sp = new URLSearchParams();
  if (query.q) sp.set("q", query.q);
  if (query.role) sp.set("role", query.role);
  if (query.status) sp.set("status", query.status);
  if (query.page && query.page > 1) sp.set("page", String(query.page));
  const s = sp.toString();
  return s ? `${BASE}?${s}` : BASE;
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/20",
        active
          ? "border-primary bg-primary text-white"
          : "border-primary/15 bg-white text-primary/70 hover:bg-paper hover:text-primary",
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Search box plus role/status chips. Filters live in the URL, so the server page
 * re-queries on navigation; the search box is a GET form (works without JS).
 */
export function PeopleFilters({ query, showRole }: { query: PeopleQuery; showRole: boolean }) {
  const { lang } = useTranslation();
  const es = lang === "es";

  const roles: { value?: PersonRole; label: string }[] = [
    { label: es ? "Todos los roles" : "All roles" },
    { value: "student", label: es ? "Alumnos" : "Students" },
    { value: "instructor", label: es ? "Instructores" : "Instructors" },
    { value: "admin", label: es ? "Admins" : "Admins" },
  ];
  const statuses: { value?: PersonStatus; label: string }[] = [
    { label: es ? "Todas" : "All" },
    { value: "active", label: es ? "Activas" : "Active" },
    { value: "inactive", label: es ? "Inactivas" : "Inactive" },
  ];

  return (
    <div className="space-y-3">
      <Form action={BASE} scroll={false} className="flex gap-2" role="search">
        {query.role ? <input type="hidden" name="role" value={query.role} /> : null}
        {query.status ? <input type="hidden" name="status" value={query.status} /> : null}
        <label htmlFor="people-q" className="sr-only">
          {es ? "Buscar por nombre o email" : "Search by name or email"}
        </label>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary/40" aria-hidden />
          <input
            id="people-q"
            name="q"
            type="search"
            defaultValue={query.q ?? ""}
            placeholder={es ? "Buscá por nombre o email" : "Search by name or email"}
            className={cn(fieldControl, "pl-10")}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="inline-flex shrink-0 items-center rounded-full border border-primary/15 bg-white px-4 text-sm font-semibold text-primary transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/20"
        >
          {es ? "Buscar" : "Search"}
        </button>
      </Form>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {showRole ? (
          <div className="flex flex-wrap gap-1.5" aria-label={es ? "Filtrar por rol" : "Filter by role"} role="group">
            {roles.map((r) => (
              <Chip key={r.label} href={peopleHref({ ...query, role: r.value, page: 1 })} active={query.role === r.value}>
                {r.label}
              </Chip>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-1.5" aria-label={es ? "Filtrar por estado" : "Filter by status"} role="group">
          {statuses.map((s) => (
            <Chip key={s.label} href={peopleHref({ ...query, status: s.value, page: 1 })} active={query.status === s.value}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
