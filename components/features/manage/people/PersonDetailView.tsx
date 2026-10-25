"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { CampusPageHeader } from "@/components/features/campus/ui/page-header";
import { StatusBadge } from "@/components/features/campus/ui/status-badge";
import type { PersonDetail } from "@/lib/campus/people";
import { formatDate, roleLabel } from "./PeopleDirectory";
import { PersonAccountCard } from "./PersonAccountCard";
import { PersonCourses } from "./PersonCourses";
import { PersonAttempts } from "./PersonAttempts";

export function PersonDetailView({
  person,
  isAdmin,
  isSelf,
}: {
  person: PersonDetail;
  isAdmin: boolean;
  isSelf: boolean;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const { profile } = person;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      <Link
        href="/campus/admin/people"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary/60 hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {es ? "Personas" : "People"}
      </Link>

      <CampusPageHeader
        title={profile.fullName}
        description={profile.email}
        actions={!person.isActive ? <StatusBadge status="inactive" /> : undefined}
      />
      <p className="-mt-3 text-sm text-primary/50">
        {isAdmin && person.role ? `${roleLabel(person.role, es)} · ` : ""}
        {es ? "Se sumó el" : "Joined"} {formatDate(profile.createdAt, lang)}
      </p>

      {isAdmin ? <PersonAccountCard person={person} isSelf={isSelf} /> : null}
      <PersonCourses enrollments={person.enrollments} />
      <PersonAttempts userId={profile.id} personName={profile.firstName || profile.fullName} attempts={person.attempts} />
    </div>
  );
}
