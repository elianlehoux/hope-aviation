/**
 * Pure certificate helpers shared by the PDF route, the on-screen sheet and the public
 * verification page. No server-only imports here: client components use it too.
 */

export type CertificateLang = "es" | "en";

/** Certificate page size in PDF points (A4 landscape), navy band width and frame. */
export const CERTIFICATE_SHEET = { width: 841.89, height: 595.28, band: 248, frame: 14 } as const;

/** Dates are shown in the organization's time zone so server and client agree. */
const CERTIFICATE_TIME_ZONE = "America/Argentina/Buenos_Aires";

export function formatCertificateDate(iso: string, lang: CertificateLang): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(lang === "es" ? "es-AR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: CERTIFICATE_TIME_ZONE,
  }).format(date);
}

/** Absolute public verification URL for a certificate code. */
export function certificateVerifyUrl(siteUrl: string, code: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/certificados/${encodeURIComponent(code)}`;
}

/** The URL without protocol, for print where it reads cleaner. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

/** ASCII slug for download file names ("Vuelo básico" -> "vuelo-basico"). */
export function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "curso"
  );
}

export function joinFullName(first: string | null | undefined, last: string | null | undefined): string | null {
  const f = (first ?? "").replace(/\s+/g, " ").trim();
  const l = (last ?? "").replace(/\s+/g, " ").trim();
  return f && l ? `${f} ${l}` : null;
}

export const CERTIFICATE_COPY = {
  es: {
    title: "Certificado de finalización",
    eyebrow: "Hope Aviation · Campus virtual",
    awardedTo: "Se otorga a",
    forCompleting: "por haber completado el curso",
    date: "Fecha",
    code: "Código",
    issuedBy: "Emitido por",
    issuer: "Hope Aviation",
    issuerSub: "Campus virtual",
    verify: "Verificá este certificado",
    scan: "Escaneá el código o entrá a",
  },
  en: {
    title: "Certificate of completion",
    eyebrow: "Hope Aviation · Virtual campus",
    awardedTo: "This certifies that",
    forCompleting: "has completed the course",
    date: "Date",
    code: "Code",
    issuedBy: "Issued by",
    issuer: "Hope Aviation",
    issuerSub: "Virtual campus",
    verify: "Verify this certificate",
    scan: "Scan the code or visit",
  },
} as const;
