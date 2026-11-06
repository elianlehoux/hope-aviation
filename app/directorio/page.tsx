import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Plane, Handshake, Radar } from "lucide-react";

export const metadata: Metadata = {
  title: "Directorio · Hope Aviation",
  description:
    "Directorio de organizaciones de aviación misionera en el mundo. Hope Aviation te conecta con quienes ya vuelan en el campo.",
};

/**
 * Public directory of missionary-aviation organizations.
 *
 * Data comes from the Hope Aviation 2026 brief. Organizations are grouped
 * honestly by the real state of the relationship:
 *   - "En contacto": current contacts, informal agreements or joint plans.
 *   - "En el radar": referents in the field, no direct contact yet.
 * A third block lists Hope Aviation's own mission opportunities in Argentina.
 *
 * Cards are informational (no external links) to avoid guessing org URLs.
 * Add each organization's verified website when available.
 */

type Org = {
  name: string;
  region: string;
  focus: string;
  description: string;
};

const inContact: Org[] = [
  {
    name: "PAMAS",
    region: "Filipinas",
    focus: "Evacuación médica",
    description:
      "Philippine Adventist Medical Aviation Services. Referente en Asia: evacuaciones médicas y alcance donde no hay otro servicio de salud.",
  },
  {
    name: "Alas de Vida",
    region: "Costa Rica",
    focus: "Salud y discipulado",
    description:
      "Aviación, discipulado y salud en Centroamérica. Buscan sumar un Vulcanair y podrían necesitar pilotos hispanohablantes nativos desde 2027.",
  },
  {
    name: "Perú Projects",
    region: "Perú",
    focus: "Aviones anfibios",
    description:
      "Aviones terrestres y anfibios. Uno de los proyectos más desarrollados de la región.",
  },
  {
    name: "Gospel Mission Aviation",
    region: "Bolivia",
    focus: "Logística",
    description:
      "Apoyo logístico y futura capacitación online para su personal operativo.",
  },
  {
    name: "MiseJe",
    region: "Internacional",
    focus: "Helicópteros",
    description:
      "Incorporación de helicópteros para proyectos humanitarios. Operaron junto a PAMAS en Filipinas.",
  },
  {
    name: "AngelOne",
    region: "Internacional",
    focus: "Red de apoyo",
    description:
      "Contacto y colaboración dentro de la red de aviación misionera.",
  },
];

const onRadar: Org[] = [
  {
    name: "MAF",
    region: "Global · +25 países",
    focus: "Red mundial",
    description:
      "Mission Aviation Fellowship. La organización más grande del mundo en el rubro, con logística humanitaria de élite.",
  },
  {
    name: "Adventist Aviation Services",
    region: "Papúa Nueva Guinea",
    focus: "Zonas extremas",
    description:
      "El referente máximo de la aviación adventista en una de las geografías más desafiantes del planeta.",
  },
  {
    name: "Ethnos360 Aviation",
    region: "Internacional",
    focus: "Comunidades remotas",
    description:
      "Aviación al servicio de comunidades aisladas y trabajo con pueblos originarios.",
  },
  {
    name: "Africa Medical Aviation",
    region: "África",
    focus: "Traslados críticos",
    description:
      "Traslados médicos de alta complejidad y respuesta rápida en zonas de bajos recursos.",
  },
  {
    name: "Airways of Hope · Miracle Air",
    region: "Fiji",
    focus: "Soporte médico y espiritual",
    description:
      "Soporte espiritual y médico a través de la aviación en comunidades remotas.",
  },
];

const argentina = [
  {
    zone: "Misiones (Noreste)",
    description:
      "Respuesta rápida ante aislamiento por lluvias e inundaciones.",
  },
  {
    zone: "Chaco y Formosa (El Impenetrable)",
    description:
      "Clínicas móviles, agua potable y alimentos en zonas de difícil acceso.",
  },
  {
    zone: "Delta del Paraná",
    description:
      "Soporte sanitario y evacuaciones de emergencia en la red de islas.",
  },
  {
    zone: "Patagonia y Región Andina",
    description:
      "Apoyo logístico contra incendios y asistencia a pueblos aislados.",
  },
];

function OrgCard({ org }: { org: Org }) {
  return (
    <article className="reveal group rounded-2xl border border-primary/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/30 hover:shadow-xl hover:shadow-primary/5">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand-orange">
        <MapPin className="size-3.5" />
        {org.region} · {org.focus}
      </div>
      <h3 className="mt-3 font-display text-xl font-bold tracking-tight text-primary">
        {org.name}
      </h3>
      <p className="mt-2 leading-relaxed text-primary/70">{org.description}</p>
    </article>
  );
}

export default function DirectorioPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-paper font-sans text-primary">
      <Navbar />

      {/* ── Header band ── */}
      <section className="relative isolate overflow-hidden bg-primary py-20 text-white md:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_80%_at_100%_0%,rgba(23,73,255,0.22),transparent_55%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_90%_at_0%_100%,rgba(255,170,0,0.12),transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6">
          <p className="flex items-center gap-2.5 text-sm font-medium text-brand-orange">
            <span className="h-px w-8 bg-brand-orange/70" />
            Directorio global
          </p>
          <Title
            level="h1"
            as="h1"
            className="mt-5 max-w-3xl font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-white md:text-6xl"
          >
            Aviación misionera en el mundo
          </Title>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            Organizaciones reales que ya vuelan en el campo. Hope Aviation quiere ser el
            puente que conecta voluntarios preparados con quienes sirven en
            terreno.
          </p>
        </div>
      </section>

      {/* ── En contacto ── */}
      <section className="bg-paper py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="reveal flex items-center gap-3">
            <Handshake className="size-6 text-brand-orange" />
            <Title
              level="h2"
              as="h2"
              className="font-display text-3xl font-extrabold tracking-tight text-primary md:text-4xl"
            >
              En contacto
            </Title>
          </div>
          <p className="reveal mt-3 max-w-2xl text-lg text-primary/70">
            Organizaciones con las que ya mantenemos contacto, convenios
            informales o planes de trabajo conjuntos.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {inContact.map((org) => (
              <OrgCard key={org.name} org={org} />
            ))}
          </div>
        </div>
      </section>

      {/* ── En el radar ── */}
      <section className="border-t border-primary/10 bg-paper-deep py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="reveal flex items-center gap-3">
            <Radar className="size-6 text-brand-orange" />
            <Title
              level="h2"
              as="h2"
              className="font-display text-3xl font-extrabold tracking-tight text-primary md:text-4xl"
            >
              Referentes en el radar
            </Title>
          </div>
          <p className="reveal mt-3 max-w-2xl text-lg text-primary/70">
            Referentes del rubro con los que todavía no hay contacto directo, pero
            marcan el camino de lo que es posible.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {onRadar.map((org) => (
              <OrgCard key={org.name} org={org} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Oportunidades en Argentina ── */}
      <section className="bg-paper py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="reveal max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Nuestro campo
            </p>
            <Title
              level="h2"
              as="h2"
              className="mt-3 font-display text-3xl font-extrabold tracking-tight text-primary md:text-4xl"
            >
              Oportunidades en Argentina
            </Title>
            <p className="mt-4 text-lg text-primary/70">
              Donde queremos volar con nuestra propia base y pista: traslados
              médicos, respuesta a desastres y asistencia a comunidades aisladas.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {argentina.map((z, i) => (
              <div
                key={z.zone}
                className={`reveal ${i % 2 === 1 ? "reveal-delay-1" : ""} flex gap-4 rounded-2xl border border-primary/10 bg-white p-6`}
              >
                <Plane className="mt-0.5 size-5 shrink-0 text-brand-orange" />
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight text-primary">
                    {z.zone}
                  </h3>
                  <p className="mt-1.5 leading-relaxed text-primary/70">
                    {z.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative isolate overflow-hidden bg-primary py-24 text-center text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,170,0,0.16),transparent_60%)]" />
        <div className="mx-auto max-w-2xl px-6">
          <Title
            level="h2"
            as="h2"
            className="font-display text-3xl font-extrabold tracking-tight text-white md:text-5xl"
          >
            ¿Querés servir con alguna de ellas?
          </Title>
          <p className="mx-auto mt-5 max-w-lg text-lg text-slate-300">
            Prepárate con las habilidades que el campo exige y te ayudamos a
            encontrar tu lugar.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="group h-14 rounded-full bg-brand-orange px-10 text-base font-semibold text-primary hover:bg-brand-orange/90"
            >
              <Link href="/campus">
                Comenzar a aprender
                <ArrowRight className="ml-1 size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 rounded-full !border-white/25 bg-white/5 px-10 text-base text-white hover:!bg-white hover:!text-primary"
            >
              <Link href="/#about">Conocer Hope Aviation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-primary py-14 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <img
            src="/logos/Hope Aviation White.webp"
            alt="Hope Aviation"
            className="h-9 w-auto"
          />
          <div className="flex gap-8 text-sm">
            <Link href="/" className="text-slate-300 transition-colors hover:text-white">
              Inicio
            </Link>
            <Link href="/#cursos" className="text-slate-300 transition-colors hover:text-white">
              Cursos
            </Link>
            <a
              href="https://hopeaviation.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 transition-colors hover:text-white"
            >
              hopeaviation.org
            </a>
          </div>
          <p className="text-sm text-slate-500">&copy; 2026 Hope Aviation</p>
        </div>
      </footer>
    </main>
  );
}
