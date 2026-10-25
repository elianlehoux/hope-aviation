"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { NewsletterForm } from "@/components/features/landing/NewsletterForm";
import { useTranslation } from "@/lib/i18n/context";

const CONTACT_EMAIL = "hope.aviation.uap@gmail.com";

/**
 * Donate page. There is no payment platform yet, so the page says so plainly:
 * what support funds (figures from the 2025 brochure), the ways to help today,
 * and a direct contact. No fake forms.
 */
export default function DonatePage() {
  const { lang } = useTranslation();
  const es = lang === "es";

  const ways = [
    es ? "Ofrendas únicas o mensuales, personales o de tu iglesia." : "One-off or monthly gifts, personal or from your church.",
    es ? "Becas para estudiantes que no pueden costear su formación." : "Scholarships for students who can't afford their training.",
    es ? "Patrocinar un vuelo, una pieza del avión o un curso." : "Sponsoring a flight, an aircraft part or a course.",
    es
      ? "Donar aeronaves, equipamiento o servicios de mantenimiento."
      : "Donating aircraft, aviation equipment or maintenance services.",
    es
      ? "Sumarte como organización, empresa o fundación aliada."
      : "Partnering with us as an organization, company or foundation.",
  ];

  const mailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(es ? "Quiero apoyar a Hope Aviation" : "I want to support Hope Aviation")}`;

  return (
    <>
      <Navbar />
      <main className="bg-white text-primary">
        {/* Intro */}
        <section className="py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-6">
              <h1 className="animate-rise font-display text-[clamp(2.75rem,6.5vw,5.5rem)] font-light leading-[0.98] tracking-[-0.035em]">
                {es ? "Ayudanos a despegar." : "Help us take off."}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary/80 md:text-xl">
                {es
                  ? "Hope Aviation se sostiene con personas e iglesias que creen en llevar esperanza donde los caminos no llegan. Tu ayuda mantiene el campus gratuito y nos acerca a nuestra propia base y pista en Argentina."
                  : "Hope Aviation is sustained by people and churches who believe in bringing hope where roads can't reach. Your support keeps the campus free and brings us closer to our own base and airstrip in Argentina."}
              </p>
              <div className="mt-8 rounded-[20px] border border-primary/10 bg-paper p-6">
                <p className="font-semibold">
                  {es ? "Todavía no tenemos donaciones en línea." : "We don't take online donations yet."}
                </p>
                <p className="mt-1 text-primary/75">
                  {es
                    ? "Escribinos y coordinamos juntos la mejor forma de ayudar."
                    : "Write to us and we'll work out the best way for you to help."}
                </p>
                <Button asChild size="lg" className="mt-5 h-12 bg-highlight px-7 text-primary hover:bg-highlight/90">
                  <a href={mailHref}>
                    <Mail className="size-4" aria-hidden="true" />
                    {es ? "Escribinos para donar" : "Email us to give"}
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-paper-deep lg:col-span-5 lg:col-start-8">
              <Image
                src="/images/landing/airfield-group.webp"
                alt={
                  es
                    ? "Voluntarios reunidos alrededor de un avión liviano en un campo de pasto"
                    : "Volunteers gathered around a light aircraft on a grass field"
                }
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-[60%_50%]"
              />
            </div>
          </div>
        </section>

        {/* What it costs: transparent figures from the brochure (ink band) */}
        <section className="bg-ink py-20 text-white md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-12">
              <h2 className="font-display text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.03em] lg:col-span-6">
                {es ? "Lo que cuesta llegar." : "What it takes to get there."}
              </h2>
              <p className="max-w-md self-end text-lg leading-relaxed text-white/70 lg:col-span-5 lg:col-start-8">
                {es
                  ? "Una iniciativa humanitaria con aviación necesita una planificación financiera transparente. Estas son nuestras metas."
                  : "An aviation-based humanitarian initiative needs transparent financial planning. These are our goals."}
              </p>
            </div>

            <dl className="mt-14 grid gap-px overflow-hidden rounded-[20px] bg-white/10 md:grid-cols-2">
              <div className="bg-ink p-6 md:p-10">
                <dt className="text-white/70">{es ? "Meta de adquisición" : "Acquisition goal"}</dt>
                <dd className="mt-2 font-display text-4xl font-light tracking-tight text-highlight md:text-5xl">USD 300.000+</dd>
                <dd className="mt-4 leading-relaxed text-white/70">
                  {es
                    ? "Compra del avión, traslado e importación a Argentina, inspección técnica, certificación y registro."
                    : "Aircraft purchase, ferry and import to Argentina, technical inspection, certification and registration."}
                </dd>
              </div>
              <div className="bg-ink p-6 md:p-10">
                <dt className="text-white/70">{es ? "Meta operativa anual" : "Annual operating goal"}</dt>
                <dd className="mt-2 font-display text-4xl font-light tracking-tight text-highlight md:text-5xl">
                  USD 150.000–200.000
                </dd>
                <dd className="mt-4 leading-relaxed text-white/70">
                  {es
                    ? "Seguros, infraestructura y hangar, mantenimiento y repuestos, combustible y logística."
                    : "Insurance, infrastructure and hangar, maintenance and spare parts, fuel and logistics."}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Ways to help */}
        <section className="bg-paper py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-5">
              <h2 className="font-display text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.03em]">
                {es ? "Formas de ayudar hoy." : "Ways to help today."}
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-primary/75">
                {es
                  ? "Cada aporte nos acerca a una Argentina más segura, más sana y mejor conectada."
                  : "Every contribution takes us closer to a safer, healthier and better connected Argentina."}
              </p>
              <Link
                href="/get-involved/church"
                className="mt-8 inline-flex rounded-sm font-semibold underline decoration-highlight decoration-2 underline-offset-[6px] hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {es ? "Cómo puede sumarse tu iglesia" : "How your church can join"}
              </Link>
            </div>
            <ul className="divide-y divide-primary/10 border-y border-primary/10 lg:col-span-6 lg:col-start-7">
              {ways.map((way) => (
                <li key={way} className="py-5 text-lg leading-relaxed">
                  {way}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Stay informed */}
        <section className="bg-white py-20 md:py-24">
          <div className="mx-auto grid max-w-7xl items-end gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-6">
              <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.05] tracking-[-0.03em]">
                {es ? "Te avisamos cuando abramos las donaciones en línea." : "We'll let you know when online giving opens."}
              </h2>
            </div>
            <div className="w-full max-w-md lg:col-span-5 lg:col-start-8">
              <NewsletterForm variant="light" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
