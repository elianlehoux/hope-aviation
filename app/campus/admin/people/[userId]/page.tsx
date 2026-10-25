import { Suspense } from "react";
import { notFound } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getPerson, requireStaffForPeople } from "@/lib/campus/people";
import { PersonDetailView } from "@/components/features/manage/people/PersonDetailView";

export const metadata = {
  title: "Persona — Hope Aviation",
};

type Params = Promise<{ userId: string }>;

export default function PersonPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PersonSkeleton />}>
      <Person params={params} />
    </Suspense>
  );
}

async function Person({ params }: { params: Params }) {
  const { userId: raw } = await params;
  const userId = parseUuidParam(raw);
  if (!userId) notFound();

  const { isAdmin, userId: viewerId } = await requireStaffForPeople();
  const person = await getPerson(userId);
  if (!person) notFound();

  return <PersonDetailView person={person} isAdmin={isAdmin} isSelf={viewerId === userId} />;
}

function PersonSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16" aria-hidden>
      <div className="h-4 w-20 animate-pulse rounded bg-primary/10" />
      <div className="h-10 w-72 animate-pulse rounded-lg bg-primary/10" />
      <div className="h-40 animate-pulse rounded-2xl bg-primary/5" />
      <div className="h-56 animate-pulse rounded-2xl bg-primary/5" />
    </div>
  );
}
