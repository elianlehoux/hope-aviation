"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { T, useTranslation } from "@/lib/i18n/context";
import {
  Heart,
  Target,
  Users,
  CheckCircle2,
  Network,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

/**
 * About page. Same band rhythm as the home (photo → white → amber → paper →
 * white → navy) with real brochure photography instead of icon placeholders.
 * Body copy stays on the existing aboutPage.* translation keys.
 */

const display =
  "font-display font-light leading-[1.02] tracking-[-0.03em] text-[clamp(2.25rem,5vw,4.25rem)]";

function Bullet({ icon: Icon, k }: { icon: LucideIcon; k: string }) {
  return (
    <li className="flex items-start gap-4">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-highlight/15 text-primary">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <p className="leading-relaxed text-primary/75">
        <T k={k} />
      </p>
    </li>
  );
}

function Pillar({
  image,
  alt,
  titleKey,
  descKey,
  children,
  flip = false,
}: {
  image: string;
  alt: string;
  titleKey: string;
  descKey: string;
  children?: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <article className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
      <div
        className={`relative aspect-[4/3] overflow-hidden rounded-[24px] bg-paper-deep lg:col-span-6 ${flip ? "lg:order-2 lg:col-start-7" : ""}`}
      >
        <Image src={image} alt={alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
      </div>
      <div className={`lg:col-span-5 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-8"}`}>
        <h3 className="font-display text-3xl font-normal leading-tight tracking-tight text-primary md:text-4xl">
          <T k={titleKey} />
        </h3>
        <p className="mt-5 text-lg leading-relaxed text-primary/75">
          <T k={descKey} />
        </p>
        {children}
      </div>
    </article>
  );
}

export default function AboutPage() {
  const { lang } = useTranslation();
  const es = lang === "es";

  return (
    <>
      <Navbar overlay />
      <main className="bg-white text-primary">
        {/* Hero: a small plane in a wide sky, watched from the ground */}
        <section className="relative isolate flex min-h-[min(88svh,56rem)] items-end overflow-hidden bg-primary text-white">
          <Image
            src="/images/landing/plane-watchers.webp"
            alt={
              es
                ? "Dos personas, desenfocadas en primer plano, miran un avión pequeño en el cielo"
                : "Two people, blurred in the foreground, watch a small plane in the sky"
            }
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,38,62,0.55)_0%,rgba(0,38,62,0.15)_40%,rgba(0,38,62,0.8)_100%)]" />
          <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-40 sm:px-6 md:pb-20 lg:px-8">
            <h1 className="animate-rise max-w-[16ch] font-display text-[clamp(2.75rem,7vw,6rem)] font-light leading-[0.96] tracking-[-0.035em]">
              <T k="aboutPage.title" />
            </h1>
            <p className="animate-rise mt-6 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl" style={{ animationDelay: "120ms" }}>
              <T k="aboutPage.subtitle" />
            </p>
          </div>
        </section>

        {/* The challenge */}
        <section className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="reveal max-w-4xl font-display text-[clamp(1.5rem,3vw,2.5rem)] font-light leading-[1.25] tracking-[-0.02em] text-primary">
              <T k="aboutPage.challengeText" />
            </p>
          </div>
        </section>

        {/* Vision (amber band) */}
        <section className="relative isolate overflow-hidden bg-highlight py-20 text-primary md:py-28">
          <svg
            className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-[30rem] w-[30rem] text-primary/10"
            viewBox="0 0 400 400"
            fill="none"
            aria-hidden="true"
          >
            {[40, 70, 100, 130, 160, 190].map((r) => (
              <ellipse key={r} cx="180" cy="220" rx={r * 1.2} ry={r} stroke="currentColor" strokeWidth="1.25" />
            ))}
          </svg>
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <h2 className={`${display} lg:col-span-5`}>
              <T k="aboutPage.visionTitle" />
            </h2>
            <p className="text-xl leading-relaxed text-primary/85 lg:col-span-6 lg:col-start-7 md:text-2xl">
              <T k="aboutPage.visionText" />
            </p>
          </div>
        </section>

        {/* What we do */}
        <section className="bg-paper py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className={`reveal ${display} text-primary`}>
              <T k="aboutPage.pillarsTitle" />
            </h2>

            <div className="mt-16 flex flex-col gap-20 md:gap-28">
              <Pillar
                image="/images/landing/cockpit-study.webp"
                alt={es ? "Dos voluntarios estudian los instrumentos en una cabina" : "Two volunteers study the instruments in a cockpit"}
                titleKey="aboutPage.pillar1Title"
                descKey="aboutPage.pillar1Desc"
              >
                <ul className="mt-8 space-y-4">
                  <Bullet icon={Heart} k="aboutPage.pillar1Spiritual" />
                  <Bullet icon={Target} k="aboutPage.pillar1Technical" />
                  <Bullet icon={Users} k="aboutPage.pillar1Humanitarian" />
                </ul>
                <p className="mt-8 text-primary/60">
                  <T k="aboutPage.pillar1Conclusion" />
                </p>
              </Pillar>

              <Pillar
                flip
                image="/images/landing/airfield-group.webp"
                alt={es ? "Un grupo conversa junto a un avión en un campo de pasto" : "A group talks next to an airplane on a grass field"}
                titleKey="aboutPage.pillar2Title"
                descKey="aboutPage.pillar2Desc"
              >
                <ul className="mt-8 space-y-4">
                  <Bullet icon={CheckCircle2} k="aboutPage.pillar2Evaluation" />
                  <Bullet icon={Network} k="aboutPage.pillar2Connection" />
                  <Bullet icon={ShieldCheck} k="aboutPage.pillar2Security" />
                </ul>
              </Pillar>

              <Pillar
                image="/images/landing/cessna-sky.webp"
                alt={es ? "Avión liviano en vuelo contra un cielo azul" : "Light aircraft flying against a blue sky"}
                titleKey="aboutPage.pillar3Title"
                descKey="aboutPage.pillar3Desc"
              />
            </div>
          </div>
        </section>

        {/* How we measure ourselves */}
        <section className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-12">
              <h2 className={`reveal ${display} text-primary lg:col-span-6`}>
                <T k="aboutPage.measureTitle" />
              </h2>
              <p className="max-w-md self-end text-lg leading-relaxed text-primary/75 lg:col-span-5 lg:col-start-8">
                <T k="aboutPage.measureDesc" />
              </p>
            </div>
            <ul className="mt-14 grid gap-px overflow-hidden rounded-[20px] border border-primary/10 bg-primary/10 md:grid-cols-3">
              {["aboutPage.measureQuality", "aboutPage.measureAlignment", "aboutPage.measureIntegrity"].map((k) => (
                <li key={k} className="bg-white p-6 text-lg leading-relaxed text-primary/80 md:p-8">
                  <T k={k} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Call to action (navy band) */}
        <section className="bg-primary py-20 text-white md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-12">
              <h2 className={`${display} lg:col-span-6`}>
                <T k="aboutPage.ctaTitle" />
              </h2>
              <p className="max-w-md self-end text-lg leading-relaxed text-white/80 lg:col-span-5 lg:col-start-8">
                <T k="aboutPage.ctaDesc" />
              </p>
            </div>

            <ul className="mt-14 grid gap-6 border-t border-white/15 pt-10 md:grid-cols-3">
              {[
                { textKey: "aboutPage.ctaPrepare", btnKey: "aboutPage.joinCampus", href: "/campus", primary: true },
                { textKey: "aboutPage.ctaConnect", btnKey: "aboutPage.exploreProjects", href: "/directorio", primary: false },
                { textKey: "aboutPage.ctaSupport", btnKey: "aboutPage.supportUs", href: "/donate", primary: false },
              ].map((card) => (
                <li key={card.btnKey} className="flex flex-col">
                  <p className="flex-1 leading-relaxed text-white/80">
                    <T k={card.textKey} />
                  </p>
                  <Button
                    asChild
                    size="lg"
                    variant={card.primary ? "default" : "outline"}
                    className={`mt-6 h-12 w-fit px-7 focus-visible:ring-white ${
                      card.primary
                        ? "bg-highlight text-primary hover:bg-highlight/90"
                        : "border-white/35 text-white hover:bg-white hover:text-primary"
                    }`}
                  >
                    <Link href={card.href}>
                      <T k={card.btnKey} />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>

            <p className="mt-16 font-display text-2xl font-light tracking-tight text-white md:text-3xl">
              <T k="aboutPage.ctaFooter" />
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
