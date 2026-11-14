"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { Marquee, Words } from "@/components/features/landing/motion";

/**
 * Landing hero. Real brochure photography (volunteers around a small plane on
 * a grass airfield): the wide sky carries the headline, people stay visible
 * at the bottom. One amber word, one amber CTA, as in the printed brochure.
 * Motion: the photo settles in and drifts slower than the page, the headline
 * rises word by word, and the amber flight path draws once with a plane at its tip.
 */
export function Hero() {
  const { lang } = useTranslation();
  const es = lang === "es";

  const flightPath = "M1130,300 C1200,275 1270,225 1330,180 C1380,142 1420,110 1480,88";

  return (
    <>
      <section
        data-progress="through"
        className="relative isolate flex min-h-[min(100svh,64rem)] flex-col overflow-hidden bg-primary text-white"
      >
        <div className="parallax absolute inset-0 -z-20 [--shift:220px] [--zoom:1.12]">
          <Image
            src="/images/landing/airfield-team.webp"
            alt={
              es
                ? "Un grupo de personas conversa junto a un avión liviano en un aeródromo de pasto"
                : "A group of people talking next to a light aircraft on a grass airfield"
            }
            fill
            priority
            sizes="100vw"
            className="hero-settle object-cover object-[50%_78%]"
          />
        </div>
        {/* Navy scrim from the top: the headline sits in the sky, the people stay clear */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,38,62,0.8)_0%,rgba(0,38,62,0.5)_38%,rgba(0,38,62,0.08)_68%,rgba(0,38,62,0.45)_100%)]" />
        {/* Left-side scrim keeps the intro copy legible over busy photo areas. */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,38,62,0.72)_0%,rgba(0,38,62,0.45)_40%,rgba(0,38,62,0)_70%)]" />

        {/* Signature flight path: one thin amber line drawn once on load, a plane at its tip */}
        <svg
          className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full md:block"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <path
            d={flightPath}
            stroke="#ffaa00"
            strokeOpacity="0.9"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="1"
            pathLength={1}
            className="animate-draw-path [stroke-dashoffset:1]"
            style={{ ["--path-length" as string]: 1, animationDelay: "700ms" }}
          />
          <circle
            cx="1130"
            cy="300"
            r="4"
            fill="#ffaa00"
            className="animate-rise"
            style={{ animationDelay: "600ms" }}
          />
        </svg>

        <div className="hero-copy mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-10 pt-32 sm:px-6 md:pt-40 lg:px-8">
          <h1 className="max-w-[15ch] font-display text-[clamp(2.75rem,7.6vw,6.75rem)] font-light leading-[0.94] tracking-[-0.035em]">
            <Words
              mode="load"
              text={es ? "Llevando esperanza donde los caminos no llegan." : "Bringing hope where roads can’t reach."}
              highlight={[es ? "esperanza" : "hope"]}
            />
          </h1>

          <p
            className="animate-rise mt-7 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl"
            style={{ animationDelay: "720ms" }}
          >
            {es
              ? "Formación gratuita y en línea para pilotos y voluntarios que quieren servir con la aviación humanitaria. No somos una escuela de vuelo: te preparamos para todo lo que viene después."
              : "Free online training for pilots and volunteers who want to serve through humanitarian aviation. We are not a flight school: we prepare you for everything that comes after."}
          </p>

          <div
            className="animate-rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "860ms" }}
          >
            <Button
              asChild
              size="lg"
              className="group h-14 bg-highlight pl-8 pr-6 text-base text-primary shadow-[0_12px_28px_rgba(0,38,62,0.35)] hover:bg-highlight hover:shadow-[0_16px_36px_rgba(0,38,62,0.45)] focus-visible:ring-white"
            >
              <Link href="/campus">
                {es ? "Empezá a formarte" : "Start your training"}
                <ArrowRight
                  className="size-5 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </Link>
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

          <div
            className="animate-rise mt-auto flex items-end justify-between gap-6 pt-16"
            style={{ animationDelay: "1000ms" }}
          >
            <p className="text-sm text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
              {es
                ? "Proyecto humanitario sin fines de lucro, nacido en Argentina."
                : "A non-profit humanitarian project born in Argentina."}
            </p>
            <a
              href="#nosotros"
              className="group hidden shrink-0 items-center gap-3 rounded-full text-sm font-medium text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.45)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:flex"
            >
              {es ? "Conocé el proyecto" : "About the project"}
              <span className="relative flex size-11 items-center justify-center overflow-hidden rounded-full border border-white/45 bg-primary/25 backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-primary">
                <ArrowDown className="scroll-cue size-4" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* The six training areas, as a slow strip under the hero */}
      <Marquee
        className="border-b border-white/10 bg-primary py-5 font-display text-[clamp(1.25rem,2.4vw,2rem)] font-light tracking-[-0.02em] text-white/90 md:py-6"
        items={
          es
            ? [
                "Trabajo transcultural",
                "Primeros auxilios y rescate",
                "Operaciones en zonas remotas",
                "Apoyo emocional",
                "Sostén económico",
                "Fundamento espiritual",
              ]
            : [
                "Cross-cultural work",
                "First aid and rescue",
                "Remote-field operations",
                "Emotional support",
                "Fundraising",
                "Spiritual grounding",
              ]
        }
      />
    </>
  );
}
