"use client";

import Link from "next/link";
import { ArrowLeft, Check, Download, Link2, Linkedin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import { CertificateSheet, type CertificateSheetProps } from "./CertificateSheet";
import { displayUrl, formatCertificateDate, linkedInCertificationUrl } from "./format";

/** Certificate detail: actions (download PDF, copy verification link, add to LinkedIn), sheet and facts. */
export function CertificateView({
  enrollmentId,
  ...sheet
}: Omit<CertificateSheetProps, "className"> & { enrollmentId: string }) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const course = getLocalizedText(sheet.courseTitle, lang);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(sheet.verifyUrl);
      setCopied(true);
      toast.success(es ? "Link copiado" : "Link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(es ? "No pudimos copiar el link" : "Couldn't copy the link");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* The ::after box grows the tap target to 44px without touching the space-y rhythm. */}
      <Link
        href="/campus/certificates"
        className="relative inline-flex items-center gap-1.5 text-sm font-medium text-primary/65 after:absolute after:-inset-x-2 after:-inset-y-3 hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {es ? "Mis certificados" : "My certificates"}
      </Link>

      {/* Title first, actions below: three buttons beside the title would squeeze long course names. */}
      <div className="flex flex-col gap-5">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-primary/65">
            {es ? "Certificado de finalización" : "Certificate of completion"}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-primary md:text-[2rem] md:leading-tight">
            {course}
          </h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg">
            <a href={`/api/certificates/${enrollmentId}/pdf?lang=${lang}`} download>
              <Download aria-hidden />
              {es ? "Descargar PDF" : "Download PDF"}
            </a>
          </Button>
          <Button variant="outline" size="lg" onClick={copyLink}>
            {copied ? <Check aria-hidden /> : <Link2 aria-hidden />}
            {es ? "Copiar link de verificación" : "Copy verification link"}
          </Button>
          <Button asChild variant="outline" size="lg">
            <a
              href={linkedInCertificationUrl({
                name: course,
                issuedAt: sheet.completedAt,
                verifyUrl: sheet.verifyUrl,
                code: sheet.code,
              })}
              target="_blank"
              rel="noreferrer"
            >
              <Linkedin aria-hidden />
              {es ? "Agregar a LinkedIn" : "Add to LinkedIn"}
              <span className="sr-only">{es ? "(se abre en otra pestaña)" : "(opens in a new tab)"}</span>
            </a>
          </Button>
        </div>
      </div>

      <CertificateSheet {...sheet} />

      <dl className="grid gap-x-8 gap-y-4 rounded-[20px] border border-primary/10 bg-white p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <dt className="text-primary/65">{es ? "A nombre de" : "Awarded to"}</dt>
          <dd className="mt-0.5 font-semibold text-primary">{sheet.fullName}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-primary/65">{es ? "Fecha" : "Date"}</dt>
          <dd className="mt-0.5 font-semibold text-primary">{formatCertificateDate(sheet.completedAt, lang)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-primary/65">{es ? "Código" : "Code"}</dt>
          <dd className="mt-0.5 font-mono font-medium text-primary">{sheet.code}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-primary/65">{es ? "Verificación pública" : "Public verification"}</dt>
          <dd className="mt-0.5 truncate">
            <a href={sheet.verifyUrl} target="_blank" rel="noreferrer" className="font-medium text-accent hover:underline">
              {displayUrl(sheet.verifyUrl)}
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}
