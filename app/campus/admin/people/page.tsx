import { Suspense } from "react";
import {
  listPeople,
  PEOPLE_PAGE_SIZE,
  requireStaffForPeople,
  type PersonRole,
  type PersonStatus,
} from "@/lib/campus/people";
import { PeopleDirectory } from "@/components/features/manage/people/PeopleDirectory";

export const metadata = {
  title: "Personas — Hope Aviation",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const ROLES: PersonRole[] = ["admin", "instructor", "student"];
const STATUSES: PersonStatus[] = ["active", "inactive"];

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default function PeoplePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<PeopleSkeleton />}>
      <People searchParams={searchParams} />
    </Suspense>
  );
}

async function People({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const { isAdmin } = await requireStaffForPeople();

  const q = first(sp.q)?.trim().slice(0, 100) || undefined;
  const roleRaw = first(sp.role);
  const statusRaw = first(sp.status);
  const role = isAdmin && ROLES.includes(roleRaw as PersonRole) ? (roleRaw as PersonRole) : undefined;
  const status = STATUSES.includes(statusRaw as PersonStatus) ? (statusRaw as PersonStatus) : undefined;
  const page = Math.max(1, Number.parseInt(first(sp.page) ?? "1", 10) || 1);

  const { rows, total } = await listPeople({ q, role, status, page });

  return (
    <PeopleDirectory
      rows={rows}
      total={total}
      pageSize={PEOPLE_PAGE_SIZE}
      query={{ q, role, status, page }}
      isAdmin={isAdmin}
    />
  );
}

function PeopleSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16" aria-hidden>
      <div className="h-10 w-48 animate-pulse rounded-lg bg-primary/10" />
      <div className="h-11 animate-pulse rounded-xl bg-primary/5" />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-primary/5" />
        ))}
      </div>
      <div className="space-y-px overflow-hidden rounded-2xl border border-primary/10 bg-white">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 animate-pulse bg-primary/[0.03]" />
        ))}
      </div>
    </div>
  );
}
