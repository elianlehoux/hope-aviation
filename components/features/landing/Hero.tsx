"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

/**
 * Landing hero. Real brochure photography (volunteers around a small plane on
 * a grass airfield): the wide sky carries the headline, people stay visible
 * at the bottom. One amber word, one amber CTA, as in the printed brochure.
 */
export function Hero() {
  const { lang } = useTranslation();
  const es = lang === "es";

  return (
    <section className="relative isolate flex min-h-[min(100svh,64rem)] flex-col overflow-hidden bg-primary text-white">
      <Image
        src="/images/landing/airfield-team.webp"
        alt={
          es
            ? "Voluntarios de Hope Aviation conversan junto a un avión liviano en un aeródromo de pasto"
            : "Hope Aviation volunteers talking next to a light aircraft on a grass airfield"
        }
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[50%_78%]"
      />
      {/* Navy scrim from the top: the headline sits in the sky, the people stay clear */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,38,62,0.78)_0%,rgba(0,38,62,0.5)_38%,rgba(0,38,62,0.08)_68%,rgba(0,38,62,0.35)_100%)]" />
      {/* Left-side scrim keeps the intro copy legible over busy photo areas. */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,38,62,0.72)_0%,rgba(0,38,62,0.45)_40%,rgba(0,38,62,0)_70%)]" />

      {/* Signature flight path: one thin amber line drawn once on load */}
      <svg
        className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full md:block"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path
          d="M940,330 C1060,290 1170,230 1270,170 C1350,122 1410,98 1480,84"
          stroke="#ffaa00"
          strokeOpacity="0.85"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={1}
          pathLength={1}
          className="animate-draw-path [stroke-dashoffset:1]"
          style={{ ["--path-length" as string]: 1, animationDelay: "500ms" }}
        />
      </svg>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-16 pt-32 sm:px-6 md:pt-40 lg:px-8">
        <h1
          className="animate-rise max-w-[15ch] font-display text-[clamp(2.75rem,7.6vw,6.75rem)] font-light leading-[0.94] tracking-[-0.035em]"
          style={{ animationDelay: "80ms" }}
        >
          {es ? (
            <>
              Llevando <span className="font-normal text-highlight">esperanza</span>{" "}
              donde los caminos no llegan.
            </>
          ) : (
            <>
              Bringing <span className="font-normal text-highlight">hope</span>{" "}
              where roads can&rsquo;t reach.
            </>
          )}
        </h1>

        <p
          className="animate-rise mt-7 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl"
          style={{ animationDelay: "180ms" }}
        >
          {es
            ? "Formación gratuita y en línea para pilotos y voluntarios que quieren servir con la aviación humanitaria. No somos una escuela de vuelo: te preparamos para todo lo que viene después."
            : "Free online training for pilots and volunteers who want to serve through humanitarian aviation. We are not a flight school: we prepare you for everything that comes after."}
        </p>

        <div
          className="animate-rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          style={{ animationDelay: "260ms" }}
        >
          <Button
            asChild
            size="lg"
            className="h-14 bg-highlight px-8 text-base text-primary shadow-[0_12px_28px_rgba(0,0,0,0.25)] hover:bg-highlight/90 focus-visible:ring-white"
          >
            <Link href="/campus">{es ? "Empezá a formarte" : "Start your training"}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 border-white/40 bg-primary/20 px-8 text-base text-white backdrop-blur-sm hover:bg-white hover:text-primary focus-visible:ring-white"
          >
            <Link href="/donate">{es ? "Donar" : "Donate"}</Link>
          </Button>
        </div>

        <p className="mt-auto pt-16 text-sm text-white/80 [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
          {es
            ? "Proyecto humanitario sin fines de lucro, nacido en Argentina."
            : "A non-profit humanitarian project born in Argentina."}
        </p>
      </div>
    </section>
  );
}
