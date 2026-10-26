"use client";

import Link from "next/link";
import { Award, Download, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import { cn } from "@/lib/utils";
import type { TranslatedText } from "@/types/database";
import { CampusPageHeader } from "@/components/features/campus/ui/page-header";
import { EmptyState } from "@/components/features/campus/ui/empty-state";
import { formatCertificateDate } from "./format";

export type CertificateListItem = {
  enrollmentId: string;
  courseId: string;
  courseTitle: TranslatedText;
  completedAt: string;
  code: string;
};

/** "My certificates": one card per completed course; `newCourseId` celebrates a fresh one. */
export function CertificateList({
  certificates,
  newCourseId,
  nameReady,
}: {
  certificates: CertificateListItem[];
  newCourseId: string | null;
  /** False when the profile lacks a first or last name: downloads go through the NameGate. */
  nameReady: boolean;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const fresh = newCourseId ? certificates.find((c) => c.courseId === newCourseId) : undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <CampusPageHeader
        title={es ? "Certificados" : "Certificates"}
        description={
          es
            ? "Cada curso que completás suma un certificado con tu nombre y un link para verificarlo."
            : "Every course you complete earns a certificate with your name and a link to verify it."
        }
      />

      {fresh ? (
        <div
          role="status"
          className="flex flex-col gap-4 rounded-[20px] bg-highlight p-5 text-primary sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div className="flex items-start gap-3">
            <PartyPopper className="mt-0.5 size-6 shrink-0" aria-hidden />
            <div>
              <p className="font-display text-xl font-semibold">{es ? "¡Felicitaciones!" : "Congratulations!"}</p>
              <p className="mt-0.5 text-sm text-primary/80">
                {es
                  ? `Completaste ${getLocalizedText(fresh.courseTitle, lang)}. Tu certificado ya está listo.`
                  : `You completed ${getLocalizedText(fresh.courseTitle, lang)}. Your certificate is ready.`}
              </p>
            </div>
          </div>
          <Button asChild className="bg-primary text-white hover:bg-primary/90">
            <Link href={`/campus/certificates/${fresh.enrollmentId}`}>{es ? "Ver certificado" : "View certificate"}</Link>
          </Button>
        </div>
      ) : null}

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title={es ? "Todavía no tenés certificados" : "No certificates yet"}
          description={
            es
              ? "Cuando completes un curso, tu certificado aparece acá listo para descargar."
              : "When you complete a course, your certificate shows up here ready to download."
          }
          action={
            <Button asChild>
              <Link href="/campus/courses">{es ? "Ver cursos" : "Browse courses"}</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {certificates.map((cert) => {
            const isNew = cert.courseId === newCourseId;
            const title = getLocalizedText(cert.courseTitle, lang);
            return (
              <li
                key={cert.enrollmentId}
                className={cn(
                  "flex flex-col overflow-hidden rounded-[20px] border border-primary/10 bg-white transition-shadow hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]",
                  isNew && "ring-2 ring-highlight",
                )}
              >
                <Link
                  href={`/campus/certificates/${cert.enrollmentId}`}
                  className="relative flex h-28 items-end overflow-hidden bg-primary px-5 pb-4"
                  aria-label={es ? `Ver certificado de ${title}` : `View certificate for ${title}`}
                >
                  <svg
                    viewBox="0 0 300 112"
                    className="absolute inset-0 size-full fill-none stroke-highlight"
                    preserveAspectRatio="xMidYMid slice"
                    aria-hidden
                  >
                    {[0, 1, 2, 3, 4, 5].map((k) => (
                      <path
                        key={k}
                        d={`M-10 ${92 - k * 14} C 70 ${60 - k * 16}, 140 ${120 - k * 12}, 310 ${40 - k * 10}`}
                        strokeWidth={k % 3 === 0 ? 1.1 : 0.6}
                        strokeOpacity={0.75 - k * 0.09}
                      />
                    ))}
                  </svg>
                  <span className="relative grid size-10 place-items-center rounded-xl bg-highlight text-primary">
                    <Award className="size-5" aria-hidden />
                  </span>
                  {isNew ? (
                    <span className="absolute right-4 top-4 rounded-full bg-highlight px-2.5 py-1 text-xs font-semibold text-primary">
                      {es ? "¡Nuevo!" : "New!"}
                    </span>
                  ) : null}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-lg font-semibold leading-snug text-primary">{title}</h2>
                  <p className="mt-1 text-sm text-primary/60">
                    {es ? "Completado el " : "Completed "}
                    {formatCertificateDate(cert.completedAt, lang)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-primary/45">{cert.code}</p>
                  <div className="mt-5 flex flex-wrap gap-2 pt-1">
                    <Button asChild size="sm">
                      {nameReady ? (
                        <a href={`/api/certificates/${cert.enrollmentId}/pdf?lang=${lang}`} download>
                          <Download aria-hidden />
                          {es ? "Descargar PDF" : "Download PDF"}
                        </a>
                      ) : (
                        <Link href={`/campus/certificates/${cert.enrollmentId}`}>
                          <Download aria-hidden />
                          {es ? "Descargar PDF" : "Download PDF"}
                        </Link>
                      )}
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/campus/certificates/${cert.enrollmentId}`}>{es ? "Ver" : "View"}</Link>
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
