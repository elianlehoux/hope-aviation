"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const LOGO_WHITE = "/logos/Hope Aviation White.webp";

/** Rounds to one decimal so server and client render identical path strings. */
const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Builds one closed, slightly irregular contour ring (topographic style) as a
 * smooth cubic path. Deterministic: same input, same path.
 */
function contourPath(cx: number, cy: number, radius: number, seed: number): string {
  const n = 40;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const k =
      1 +
      0.1 * Math.sin(3 * t + seed) +
      0.05 * Math.cos(5 * t + seed * 1.7) +
      0.03 * Math.sin(2 * t + seed * 0.6);
    pts.push([cx + Math.cos(t) * radius * k * 1.18, cy + Math.sin(t) * radius * k]);
  }
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return `${d}Z`;
}

// Two contour clusters: a "peak" top-right (the destination) and a softer one
// bottom-right. Computed once at module load.
const PEAK = { x: 470, y: 190 };
const RINGS_A = Array.from({ length: 9 }, (_, i) => ({
  d: contourPath(PEAK.x, PEAK.y, 26 + i * 30, 0.4 + i * 0.32),
  opacity: 0.55 - i * 0.05,
}));
const RINGS_B = Array.from({ length: 6 }, (_, i) => ({
  d: contourPath(640, 860, 60 + i * 36, 2.1 + i * 0.28),
  opacity: 0.32 - i * 0.04,
}));

/** Amber contour lines plus a dashed flight route to the peak. Decorative only. */
function FlightLines({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 900"
      preserveAspectRatio="xMidYMin slice"
      fill="none"
      aria-hidden
      focusable="false"
      className={cn("pointer-events-none text-highlight", className)}
    >
      {RINGS_A.map((ring, i) => (
        <path
          key={`a${i}`}
          d={ring.d}
          stroke="currentColor"
          strokeOpacity={ring.opacity}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {RINGS_B.map((ring, i) => (
        <path
          key={`b${i}`}
          d={ring.d}
          stroke="currentColor"
          strokeOpacity={ring.opacity}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {/* Flight route from the lowlands to the peak */}
      <path
        d={`M-30 620 C 90 560, 150 470, 250 430 S 410 300, ${PEAK.x} ${PEAK.y}`}
        stroke="currentColor"
        strokeOpacity={0.9}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeDasharray="1 9"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={PEAK.x} cy={PEAK.y} r={14} stroke="currentColor" strokeOpacity={0.6} strokeWidth={1} />
      <circle cx={PEAK.x} cy={PEAK.y} r={5} fill="currentColor" />
    </svg>
  );
}

/** Tagline with "hope" / "esperanza" in amber (one highlighted word). */
function Tagline({ es }: { es: boolean }) {
  return es ? (
    <>
      Llevando <span className="text-highlight">esperanza</span> donde los caminos no llegan.
    </>
  ) : (
    <>
      Bringing <span className="text-highlight">hope</span> where roads can&apos;t reach.
    </>
  );
}

/**
 * Frame for every auth screen: navy brand panel on the left (desktop) or a
 * compact navy header (mobile), and the form on paper.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const { lang } = useTranslation();
  const es = lang === "es";

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand panel — desktop */}
      <aside className="relative hidden overflow-hidden bg-primary text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <FlightLines className="absolute inset-0 size-full" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-primary via-primary/90 to-transparent"
        />

        <Link
          href="/"
          className="relative z-10 -ml-1 -mt-4 inline-flex w-fit rounded-[8px] focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-highlight"
        >
          <Image
            src={LOGO_WHITE}
            alt="Hope Aviation"
            width={1921}
            height={1081}
            priority
            className="h-[72px] w-auto"
          />
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-highlight">
            {es ? "Campus de formación" : "Training campus"}
          </p>
          <p className="font-display text-[44px] font-semibold leading-[1.05] tracking-tight xl:text-[52px]">
            <Tagline es={es} />
          </p>
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-white/70">
            {es
              ? "Formamos pilotos y voluntarios para servir a comunidades aisladas con aviación misionera."
              : "We train pilots and volunteers to serve isolated communities through mission aviation."}
          </p>
        </div>
      </aside>

      {/* Compact brand header — mobile and tablet */}
      <header className="relative overflow-hidden bg-primary px-4 pb-7 pt-3 text-white sm:px-8 lg:hidden">
        <FlightLines className="absolute inset-0 size-full opacity-80" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="-my-1 -ml-1 inline-flex rounded-[8px] focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-highlight"
          >
            <Image
              src={LOGO_WHITE}
              alt="Hope Aviation"
              width={1921}
              height={1081}
              priority
              className="h-14 w-auto"
            />
          </Link>
          <LanguageToggle className="size-11 rounded-full text-white/80 hover:bg-white/10 hover:text-white" />
        </div>
        <p className="relative z-10 mt-3 max-w-[19rem] font-display text-[22px] font-semibold leading-[1.15] tracking-tight">
          <Tagline es={es} />
        </p>
      </header>

      {/* Form column */}
      <div className="flex flex-col lg:min-h-dvh">
        <div className="hidden items-center justify-between px-12 pt-8 lg:flex">
          <BackToSite es={es} />
          <LanguageToggle className="size-10 rounded-full border border-primary/10 bg-white text-primary/70 hover:bg-paper-deep hover:text-primary" />
        </div>

        <main className="flex flex-1 justify-center px-4 py-10 sm:px-8 sm:py-14 lg:items-center lg:px-12">
          <div className="w-full max-w-[420px]">{children}</div>
        </main>

        <div className="flex justify-center px-4 pb-10 lg:hidden">
          <BackToSite es={es} />
        </div>
      </div>
    </div>
  );
}

function BackToSite({ es }: { es: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 rounded-full px-1 py-1 text-sm font-medium text-primary/70 transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring"
    >
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
      {es ? "Volver al sitio" : "Back to the site"}
    </Link>
  );
}
