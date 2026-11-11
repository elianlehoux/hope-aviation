import { NextResponse, type NextRequest } from "next/server";
import { parseUuidParam } from "@/lib/api/params";
import { jsonError } from "@/lib/api/json";
import { getCertificate } from "@/lib/campus/certificates";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import {
  CERTIFICATE_COPY,
  certificateVerifyUrl,
  formatCertificateDate,
  slugify,
} from "@/components/features/campus/certificate/format";
import { renderCertificatePdf } from "../../_lib/render-certificate-pdf";

// pdf-lib, fontkit and fs need Node. Route handlers default to the Node runtime, and
// `export const runtime` is rejected under `cacheComponents`, so it is not declared here.

/**
 * GET /api/certificates/:enrollmentId/pdf?lang=es|en
 * Streams the learner's certificate as a downloadable PDF. Only the learner or staff may
 * download it (404 otherwise); 409 `name_required` when the profile has no full name yet.
 */
export async function GET(request: NextRequest, ctx: { params: Promise<{ enrollmentId: string }> }) {
  const enrollmentId = parseUuidParam((await ctx.params).enrollmentId);
  if (!enrollmentId) return jsonError("not_found", "Certificate not found.", 404);

  const cert = await getCertificate(enrollmentId);
  if (!cert) return jsonError("not_found", "Certificate not found.", 404);

  if (!cert.fullName) {
    return NextResponse.json(
      {
        code: "name_required",
        error: { code: "name_required", message: "First and last name are required for the certificate." },
      },
      { status: 409 },
    );
  }

  const lang = request.nextUrl.searchParams.get("lang") === "en" ? "en" : "es";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || request.nextUrl.origin;
  const courseTitle = getLocalizedText(cert.courseTitle, lang);

  let bytes: Uint8Array;
  try {
    bytes = await renderCertificatePdf({
      lang,
      fullName: cert.fullName,
      courseTitle,
      dateLabel: formatCertificateDate(cert.completedAt, lang),
      code: cert.code,
      verifyUrl: certificateVerifyUrl(siteUrl, cert.code),
      copy: CERTIFICATE_COPY[lang],
    });
  } catch (err) {
    console.error("certificate pdf", err);
    return jsonError("pdf_failed", "Could not generate the certificate.", 500);
  }

  const filename = `certificado-${slugify(courseTitle)}.pdf`;
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}
