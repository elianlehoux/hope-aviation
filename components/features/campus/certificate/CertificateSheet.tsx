"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { TranslatedText } from "@/types/database";
import { cn } from "@/lib/utils";
import {
  CERTIFICATE_COPY,
  CERTIFICATE_SHEET as SHEET,
  displayUrl,
  formatCertificateDate,
} from "./format";
import type { ContourRing } from "./geometry";

export type CertificateSheetProps = {
  fullName: string;
  courseTitle: TranslatedText;
  completedAt: string;
  code: string;
  verifyUrl: string;
  contours: ContourRing[];
  qr: { d: string; size: number };
  className?: string;
};

/** Sheet points -> container-query width units, so the preview scales like the PDF. */
const pt = (n: number) => `${((n / SHEET.width) * 100).toFixed(3)}cqw`;

/**
 * On-screen replica of the PDF certificate (A4 landscape). Everything is sized in `cqw`
 * against the sheet width, so it keeps the PDF proportions from 320px to desktop.
 */
export function CertificateSheet({
  fullName,
  courseTitle,
  completedAt,
  code,
  verifyUrl,
  contours,
  qr,
  className,
}: CertificateSheetProps) {
  const { lang } = useTranslation();
  const copy = CERTIFICATE_COPY[lang];
  const course = getLocalizedText(courseTitle, lang);
  // Same rule as the PDF: shrink to fit one line (≈0.55em per glyph over the 458pt text
  // column), and only wrap to two lines below 30pt.
  const fitted = 458 / (Math.max(1, fullName.length) * 0.55);
  const nameSize = fitted >= 30 ? Math.min(50, fitted) : 34;

  return (
    <div className={cn("@container w-full", className)}>
      <div
        className="relative w-full overflow-hidden rounded-[4px] bg-primary text-primary shadow-[0_12px_28px_rgba(0,38,62,0.18),0_2px_4px_rgba(0,38,62,0.08)]"
        style={{ aspectRatio: `${SHEET.width} / ${SHEET.height}` }}
        aria-label={`${copy.title}: ${fullName}, ${course}`}
        role="img"
      >
        {/* Navy band: contour lines, logo and verification QR */}
        <div className="absolute inset-y-0 left-0" style={{ width: pt(SHEET.band) }} aria-hidden>
          <svg
            viewBox={`0 0 ${SHEET.band} ${SHEET.height}`}
            className="absolute inset-0 size-full fill-none stroke-highlight"
            preserveAspectRatio="none"
          >
            {contours.map((ring, i) => (
              <path key={i} d={ring.d} strokeWidth={ring.width} strokeOpacity={ring.opacity} />
            ))}
          </svg>
          <Image
            src="/logos/hope-logo.svg"
            alt=""
            width={1680}
            height={516}
            unoptimized
            className="absolute h-auto brightness-0 invert"
            style={{ left: pt(34), top: pt(40), width: pt(148) }}
          />
          <p
            className="absolute font-bold uppercase text-highlight"
            style={{ left: pt(34), bottom: pt(160), fontSize: pt(7), letterSpacing: pt(1.2), lineHeight: 1 }}
          >
            {copy.verify}
          </p>
          <div className="absolute bg-white" style={{ left: pt(34), bottom: pt(58), width: pt(92), height: pt(92), padding: pt(6) }}>
            <svg viewBox={`0 0 ${qr.size} ${qr.size}`} className="size-full fill-primary" shapeRendering="crispEdges">
              <path d={qr.d} />
            </svg>
          </div>
          <div className="absolute text-white" style={{ left: pt(34), right: pt(20), bottom: pt(24), fontSize: pt(7.5), lineHeight: 1.6 }}>
            <p className="text-white/75">{copy.scan}</p>
            <p className="truncate">{displayUrl(verifyUrl)}</p>
          </div>
        </div>

        {/* Paper panel */}
        <div
          className="absolute flex flex-col border-highlight bg-paper"
          style={{
            left: pt(SHEET.band),
            top: pt(SHEET.frame),
            right: pt(SHEET.frame),
            bottom: pt(SHEET.frame),
            borderLeftWidth: pt(3),
            padding: `${pt(46)} ${pt(58)} ${pt(34)} ${pt(55)}`,
          }}
        >
          <div className="flex items-center" style={{ gap: pt(10) }}>
            <span className="bg-highlight" style={{ width: pt(22), height: pt(2.2) }} />
            <span
              className="font-bold uppercase text-primary/65"
              style={{ fontSize: pt(8), letterSpacing: pt(1.6), lineHeight: 1 }}
            >
              {copy.eyebrow}
            </span>
          </div>
          <p className="font-display font-bold tracking-tight" style={{ fontSize: pt(30), lineHeight: 1.1, marginTop: pt(14) }}>
            {copy.title}
          </p>

          <div className="flex flex-1 flex-col justify-center" style={{ paddingBottom: pt(18) }}>
            <p className="text-primary/65" style={{ fontSize: pt(12) }}>
              {copy.awardedTo}
            </p>
            <p
              className="line-clamp-2 font-display font-bold break-words"
              style={{ fontSize: pt(nameSize), lineHeight: 1.04, marginTop: pt(8) }}
            >
              {fullName}
            </p>
            <div className="relative bg-primary/15" style={{ height: pt(0.6), marginTop: pt(18) }}>
              <span className="absolute left-0 bg-highlight" style={{ width: pt(56), height: pt(2.2), top: pt(-0.8) }} />
            </div>
            <p className="text-primary/65" style={{ fontSize: pt(12), marginTop: pt(22) }}>
              {copy.forCompleting}
            </p>
            <p className="line-clamp-2" style={{ fontSize: pt(20), lineHeight: 1.25, marginTop: pt(6) }}>
              {course}
            </p>
          </div>

          <div
            className="grid border-t border-primary/15"
            style={{ gridTemplateColumns: "38% 32% 30%", paddingTop: pt(20) }}
          >
            {[
              { label: copy.date, value: formatCertificateDate(completedAt, lang) },
              { label: copy.code, value: code },
            ].map((col) => (
              <div key={col.label} className="min-w-0">
                <p className="font-bold uppercase text-primary/65" style={{ fontSize: pt(7), letterSpacing: pt(1.4) }}>
                  {col.label}
                </p>
                <p className="truncate" style={{ fontSize: pt(12), marginTop: pt(6) }}>
                  {col.value}
                </p>
              </div>
            ))}
            <div className="min-w-0">
              <p className="font-bold uppercase text-primary/65" style={{ fontSize: pt(7), letterSpacing: pt(1.4) }}>
                {copy.issuedBy}
              </p>
              <p className="font-display font-bold" style={{ fontSize: pt(13), marginTop: pt(5) }}>
                {copy.issuer}
              </p>
              <p className="text-primary/65" style={{ fontSize: pt(8.5) }}>
                {copy.issuerSub}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
