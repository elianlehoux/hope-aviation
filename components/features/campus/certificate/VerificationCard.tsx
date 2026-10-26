"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { TranslatedText } from "@/types/database";
import { formatCertificateDate } from "./format";

export type VerifiedCertificate = {
  fullName: string;
  courseTitle: TranslatedText;
  completedAt: string;
};

/** Public result of /certificados/[codigo]: valid certificate details or "not found". */
export function VerificationCard({ code, certificate }: { code: string; certificate: VerifiedCertificate | null }) {
  const { lang } = useTranslation();
  const es = lang === "es";

  return (
    <main className="min-h-dvh bg-paper px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="inline-block" aria-label="Hope Aviation">
          <Image src="/logos/hope-logo.svg" alt="Hope Aviation" width={1680} height={516} unoptimized className="h-9 w-auto" />
        </Link>

        <div className="mt-8 overflow-hidden rounded-[24px] border border-primary/10 bg-white">
          {certificate ? (
            <>
              <div className="relative overflow-hidden bg-primary px-6 py-7 text-white sm:px-8">
                <svg
                  viewBox="0 0 400 140"
                  className="absolute inset-0 size-full fill-none stroke-highlight"
                  preserveAspectRatio="xMidYMid slice"
                  aria-hidden
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((k) => (
                    <path
                      key={k}
                      d={`M-10 ${120 - k * 15} C 110 ${70 - k * 14}, 210 ${150 - k * 12}, 410 ${50 - k * 9}`}
                      strokeWidth={k % 3 === 0 ? 1.1 : 0.6}
                      strokeOpacity={0.6 - k * 0.06}
                    />
                  ))}
                </svg>
                <div className="relative flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-success text-white">
                    <BadgeCheck className="size-6" aria-hidden />
                  </span>
                  <div>
                    <h1 className="font-display text-2xl font-semibold tracking-tight">
                      {es ? "Certificado válido" : "Valid certificate"}
                    </h1>
                    <p className="text-sm text-white/70">
                      {es ? "Emitido por Hope Aviation" : "Issued by Hope Aviation"}
                    </p>
                  </div>
                </div>
              </div>
              <dl className="space-y-5 px-6 py-7 sm:px-8">
                <div>
                  <dt className="text-sm text-primary/55">{es ? "Otorgado a" : "Awarded to"}</dt>
                  <dd className="mt-0.5 font-display text-3xl font-semibold leading-tight tracking-tight text-primary">
                    {certificate.fullName}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-primary/55">{es ? "Curso completado" : "Course completed"}</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-primary">
                    {getLocalizedText(certificate.courseTitle, lang)}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-primary/10 pt-5">
                  <div>
                    <dt className="text-sm text-primary/55">{es ? "Fecha" : "Date"}</dt>
                    <dd className="mt-0.5 font-medium text-primary">
                      {formatCertificateDate(certificate.completedAt, lang)}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-sm text-primary/55">{es ? "Código" : "Code"}</dt>
                    <dd className="mt-0.5 truncate font-mono text-sm font-medium text-primary">{code}</dd>
                  </div>
                </div>
              </dl>
            </>
          ) : (
            <div className="flex flex-col items-center px-6 py-12 text-center sm:px-8">
              <span className="grid size-12 place-items-center rounded-2xl bg-paper text-primary/60">
                <SearchX className="size-6" aria-hidden />
              </span>
              <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-primary">
                {es ? "No encontramos este certificado" : "We couldn't find this certificate"}
              </h1>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-primary/60">
                {es
                  ? "Revisá que el código esté bien escrito. Si te lo compartieron, pedí el link de verificación original."
                  : "Check that the code is spelled correctly. If someone shared it with you, ask for the original verification link."}
              </p>
              {code ? <p className="mt-4 break-all font-mono text-sm text-primary/50">{code}</p> : null}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-primary/60">
            {es ? "Llevando esperanza donde los caminos no llegan." : "Bringing hope where roads can't reach."}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/">{es ? "Conocé Hope Aviation" : "About Hope Aviation"}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
