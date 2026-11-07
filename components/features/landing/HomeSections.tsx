"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { NewsletterForm } from "@/components/features/landing/NewsletterForm";

/**
 * Home page bands, in brochure order: white (who we are) → amber (why
 * Argentina) → paper (the training path) → ink (regions, photo-led) → blue
 * (get involved) → paper (newsletter). Copy is inline es/en; facts come from
 * the 2025 brochure and the 2026 summary, nothing invented.
 */

function useEs() {
  const { lang } = useTranslation();
  return lang === "es";
}

const linkFocus =
  "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

/* ── Who we are ─────────────────────────────────────────────────────────── */

export function MissionSection() {
  const es = useEs();

  return (
    <section id="nosotros" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="reveal max-w-[18ch] font-display text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.03em] text-primary">
          {es
            ? "No enseñamos a volar. Te preparamos para servir."
            : "We don't teach you to fly. We prepare you to serve."}
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-12 md:gap-12">
          <figure className="reveal relative aspect-[4/5] overflow-hidden rounded-[24px] bg-paper-deep md:col-span-5 lg:col-span-4">
            <Image
              src="/images/landing/cockpit-study.webp"
              alt={
                es
                  ? "Dos voluntarios revisan los instrumentos dentro de la cabina de un avión liviano"
                  : "Two volunteers going over the instruments inside a light aircraft cockpit"
              }
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </figure>

          <div className="flex flex-col justify-end md:col-span-7 lg:col-span-6 lg:col-start-6">
            <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-primary/80">
              <p>
                {es
                  ? "Hope Aviation es un proyecto humanitario sin fines de lucro de Argentina. Respetamos la formación que cada piloto hace en su escuela de confianza; nosotros entramos después, con lo que la aviación misionera exige y casi nadie enseña."
                  : "Hope Aviation is a non-profit humanitarian project from Argentina. We respect the training each pilot gets at their own flight school; we come in afterwards, with what mission aviation demands and almost nobody teaches."}
              </p>
              <p>
                {es
                  ? "Trabajo transcultural, primeros auxilios y rescate, operaciones en zonas remotas, apoyo emocional, sostén económico y fundamento espiritual. Y cuando estés listo, queremos conectarte con organizaciones que ya vuelan en el campo."
                  : "Cross-cultural work, first aid and rescue, remote-field operations, emotional support, fundraising and spiritual grounding. And when you're ready, we want to connect you with organizations already flying in the field."}
              </p>
            </div>

            <dl className="mt-12 grid grid-cols-1 gap-6 border-t border-primary/10 pt-8 sm:grid-cols-3">
              {[
                {
                  term: es ? "Gratis" : "Free",
                  detail: es ? "Todos los cursos del campus, sin costo." : "Every campus course, at no cost.",
                },
                {
                  term: es ? "A tu ritmo" : "At your pace",
                  detail: es ? "En línea, desde donde estés." : "Online, from wherever you are.",
                },
                {
                  term: es ? "Bilingüe" : "Bilingual",
                  detail: es ? "En español y en inglés." : "In Spanish and English.",
                },
              ].map((item) => (
                <div key={item.term}>
                  <dt className="font-display text-2xl font-normal tracking-tight text-primary">{item.term}</dt>
                  <dd className="mt-1 text-sm text-primary/65">{item.detail}</dd>
                </div>
              ))}
            </dl>

            <Link
              href="/about"
              className={`mt-10 inline-flex w-fit items-center gap-1.5 font-semibold text-primary underline decoration-highlight decoration-2 underline-offset-[6px] transition-colors hover:text-accent ${linkFocus}`}
            >
              {es ? "Conocé el proyecto" : "About the project"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Why Argentina (amber band) ─────────────────────────────────────────── */

export function WhyArgentinaSection() {
  const es = useEs();

  const facts = [
    {
      figure: "2.780.400 km²",
      text: es
        ? "de territorio: Argentina es el octavo país más grande del mundo."
        : "of territory: Argentina is the eighth-largest country in the world.",
    },
    {
      figure: "18",
      text: es
        ? "regiones naturales, de la selva de Misiones a la estepa patagónica."
        : "natural regions, from the Misiones rainforest to the Patagonian steppe.",
    },
    {
      figure: es ? "Horas" : "Hours",
      text: es
        ? "en lancha, en el Delta del Paraná, para llegar a un centro de salud."
        : "by boat in the Paraná Delta to reach a health center.",
    },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-highlight py-20 text-primary md:py-28">
      {/* Contour lines, the brochure's signature graphic, kept to the corner */}
      <svg
        className="pointer-events-none absolute -right-24 -top-24 -z-10 h-[34rem] w-[34rem] text-primary/10"
        viewBox="0 0 400 400"
        fill="none"
        aria-hidden="true"
      >
        {[40, 70, 100, 130, 160, 190].map((r) => (
          <ellipse key={r} cx="260" cy="140" rx={r * 1.2} ry={r} stroke="currentColor" strokeWidth="1.25" />
        ))}
      </svg>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <h2 className="reveal font-display text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.03em] lg:col-span-7">
            {es
              ? "Hay comunidades a horas del hospital más cercano."
              : "Some communities are hours from the nearest hospital."}
          </h2>
          <p className="max-w-md self-end text-lg leading-relaxed text-primary/80 lg:col-span-4 lg:col-start-9">
            {es
              ? "Cuando una crecida corta los caminos en Chaco o en Córdoba, el tiempo se vuelve una cuestión de vida. Las ambulancias aéreas salen de los grandes aeropuertos y no llegan a cientos de pueblos. Hope Aviation nació para cerrar esa distancia."
              : "When floods cut the roads in Chaco or Córdoba, time becomes a matter of life. Air ambulances fly from major airports and never reach hundreds of villages. Hope Aviation was created to close that gap."}
          </p>
        </div>

        {/* Hairline dividers come from the 1px gap; no rounding, so no faint corners on amber. */}
        <dl className="mt-16 grid gap-px bg-primary/15 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.figure} className="bg-highlight p-6 md:p-8">
              <dt className="font-display text-4xl font-light tracking-[-0.03em] md:text-5xl">{fact.figure}</dt>
              <dd className="mt-3 max-w-xs text-base leading-snug text-primary/80">{fact.text}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-12 max-w-2xl font-display text-2xl font-normal leading-snug tracking-tight md:text-3xl">
          {es
            ? "Nuestra misión es simple: preparar a quienes van a llegar donde nadie llega."
            : "Our mission is simple: to prepare the people who will reach the unreachable."}
        </p>
      </div>
    </section>
  );
}

/* ── How the training works (paper) ─────────────────────────────────────── */

export function TrainingPathSection() {
  const es = useEs();

  const steps = [
    {
      title: es ? "Creá tu cuenta" : "Create your account",
      text: es
        ? "Con tu email. Elegís un curso del catálogo y te inscribís en un clic."
        : "With your email. Pick a course from the catalog and enroll in one click.",
    },
    {
      title: es ? "Estudiá por módulos" : "Study module by module",
      text: es
        ? "Clases escritas y en video, ordenadas por módulo. Retomás donde lo dejaste."
        : "Written and video lessons, organized in modules. Pick up where you left off.",
    },
    {
      title: es ? "Rendí cada módulo" : "Pass each module",
      text: es
        ? "Un examen corto al final de cada módulo habilita el siguiente."
        : "A short exam at the end of each module unlocks the next one.",
    },
    {
      title: es ? "Examen final" : "Final exam",
      text: es
        ? "Repasa todo el curso. Se habilita cuando aprobaste todos los módulos."
        : "Covers the whole course. It opens once every module is passed.",
    },
    {
      title: es ? "Tu certificado" : "Your certificate",
      text: es
        ? "Descargalo en PDF, con un link público para que cualquiera lo verifique."
        : "Download it as a PDF, with a public link anyone can use to verify it.",
    },
  ];

  return (
    <section id="como-funciona" className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 className="reveal font-display text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.03em] text-primary lg:col-span-7">
            {es ? "Del primer clic al certificado." : "From the first click to your certificate."}
          </h2>
          <p className="max-w-md self-end text-lg leading-relaxed text-primary/75 lg:col-span-4 lg:col-start-9">
            {es
              ? "El campus es gratuito y funciona a tu ritmo. Así avanza cualquier curso:"
              : "The campus is free and works at your own pace. This is how every course goes:"}
          </p>
        </div>

        {/* The route: a dashed flight path joining five waypoints (vertical on mobile) */}
        <ol className="mt-16 grid gap-10 lg:grid-cols-5 lg:gap-6">
          {steps.map((step, i) => {
            const last = i === steps.length - 1;
            return (
              <li key={step.title} className="relative flex gap-5 lg:flex-col lg:gap-0">
                {/* Each leg runs from this waypoint to the next, so the route ends at the certificate. */}
                {!last && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-10 left-[1.4375rem] top-12 border-l-2 border-dashed border-primary/20 lg:-right-6 lg:bottom-auto lg:left-12 lg:top-[1.4375rem] lg:border-l-0 lg:border-t-2"
                  />
                )}
                <span
                  className={`relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-medium ring-8 ring-paper ${
                    last ? "bg-highlight text-primary" : "bg-primary text-white"
                  }`}
                >
                  {last ? <Award className="size-5" aria-hidden="true" /> : i + 1}
                  {last && <span className="sr-only">{i + 1}</span>}
                </span>
                <div className="pt-2 lg:pt-6">
                  <h3 className="font-display text-xl font-medium tracking-tight text-primary">{step.title}</h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-primary/70">{step.text}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-14 bg-highlight px-8 text-base text-primary hover:bg-highlight/90">
            <Link href="/campus">{es ? "Empezá a formarte" : "Start your training"}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-14 border-primary/25 px-8 text-base hover:bg-paper-deep">
            <Link href="#cursos">{es ? "Ver los cursos" : "See the courses"}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ── Regions (ink, photography-led) ─────────────────────────────────────── */

export function RegionsSection() {
  const es = useEs();

  const regions = [
    {
      name: "Misiones",
      img: "/images/landing/region-misiones.webp",
      alt: es ? "Selva subtropical y una cascada en Misiones" : "Subtropical forest and a waterfall in Misiones",
      need: es
        ? "Selva y lluvias intensas: hay comunidades aisladas por días."
        : "Rainforest and heavy rain: some communities are cut off for days.",
    },
    {
      name: es ? "Chaco y Formosa" : "Chaco and Formosa",
      img: "/images/landing/region-chaco.webp",
      alt: es ? "Avión anfibio sobrevolando agua verde" : "Amphibious aircraft flying over green water",
      need: es
        ? "El Impenetrable: agua potable, salud y clínicas móviles."
        : "The Impenetrable: clean water, health care and mobile clinics.",
    },
    {
      name: es ? "Delta del Paraná" : "Paraná Delta",
      img: "/images/landing/region-delta.webp",
      alt: es ? "Vista aérea de los ríos e islas del Delta del Paraná" : "Aerial view of the rivers and islands of the Paraná Delta",
      need: es
        ? "Miles de islas donde a veces solo se llega en lancha."
        : "Thousands of islands, sometimes reachable only by boat.",
    },
    {
      name: "Córdoba",
      img: "/images/landing/region-cordoba.webp",
      alt: es ? "Sierras de Córdoba vistas desde el aire" : "The Córdoba hills seen from the air",
      need: es
        ? "Sierras y crecidas repentinas que cortan los caminos."
        : "Hills and flash floods that cut off the roads.",
    },
    {
      name: es ? "Patagonia y Andes" : "Patagonia and the Andes",
      img: "/images/landing/region-patagonia.webp",
      alt: es ? "Cordillera de los Andes nevada desde el aire" : "The snow-covered Andes seen from the air",
      need: es
        ? "Incendios forestales y pueblos aislados por el clima."
        : "Wildfires and villages isolated by harsh weather.",
    },
  ];

  return (
    <section className="bg-ink py-20 text-white md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 className="reveal font-display text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.03em] lg:col-span-7">
            {es ? "Donde el avión es el único camino rápido." : "Where a plane is the only fast way in."}
          </h2>
          <p className="max-w-md self-end text-lg leading-relaxed text-white/70 lg:col-span-4 lg:col-start-9">
            {es
              ? "Cinco regiones de Argentina que estudiamos para servir. Todavía no operamos vuelos: es lo que estamos preparando, empezando por las personas."
              : "Five regions of Argentina we are studying to serve. We don't operate flights yet: that's what we're preparing for, starting with people."}
          </p>
        </div>
      </div>

      {/* Horizontal scroll on small screens, five columns on large ones */}
      <ul className="scrollbar-hide mx-auto mt-14 flex max-w-7xl snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:px-6 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-8">
        {regions.map((region) => (
          <li key={region.name} className="w-[72vw] max-w-[18rem] shrink-0 snap-start lg:w-auto lg:max-w-none">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] bg-white/5">
              <Image
                src={region.img}
                alt={region.alt}
                fill
                sizes="(min-width: 1024px) 20vw, 72vw"
                className="object-cover"
              />
            </div>
            <h3 className="mt-5 font-display text-xl font-medium tracking-tight">{region.name}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/65">{region.need}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Get involved / donate (the one blue band) ──────────────────────────── */

export function GetInvolvedBand() {
  const es = useEs();

  const ways = [
    {
      href: "/get-involved/church",
      title: es ? "Tu iglesia" : "Your church",
      text: es ? "Ofrendas especiales o mensuales, y becas para estudiantes." : "One-off or monthly offerings, and student scholarships.",
    },
    {
      href: "/get-involved/project",
      title: es ? "Tu proyecto" : "Your project",
      text: es ? "Aviones, un lugar para operar o cursos para el campus." : "Aircraft, a place to operate or courses for the campus.",
    },
    {
      href: "/get-involved/teach",
      title: es ? "Enseñar" : "Teach",
      text: es ? "Si sos profesional, enseñá tu tema como voluntario." : "If you're a professional, teach your subject as a volunteer.",
    },
    {
      href: "/get-involved/volunteer",
      title: es ? "Voluntariado" : "Volunteer",
      text: es ? "Video, producción, marketing y más, desde donde estés." : "Video, production, marketing and more, from anywhere.",
    },
  ];

  return (
    <section id="sumate" className="relative isolate overflow-hidden bg-accent py-20 text-white md:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <h2 className="reveal font-display text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.03em]">
            {es ? "Cada vuelo empieza con alguien que se suma." : "Every flight starts with someone who joins in."}
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/85">
            {es
              ? "Tu ayuda sostiene el campus gratuito, las becas y el camino hacia nuestra propia base y pista en Argentina."
              : "Your gift keeps the campus free and funds scholarships and the road to our own base and airstrip in Argentina."}
          </p>
          <Button
            asChild
            size="lg"
            className="mt-10 h-14 bg-highlight px-8 text-base text-primary hover:bg-highlight/90 focus-visible:ring-white"
          >
            <Link href="/donate">{es ? "Donar" : "Donate"}</Link>
          </Button>
        </div>

        <ul className="divide-y divide-white/20 border-y border-white/20 self-end lg:col-span-6 lg:col-start-7">
          {ways.map((way) => (
            <li key={way.href}>
              <Link
                href={way.href}
                className="group flex items-center justify-between gap-6 py-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>
                  <span className="block font-display text-2xl font-normal tracking-tight">{way.title}</span>
                  <span className="mt-1 block text-white/85">{way.text}</span>
                </span>
                <ArrowUpRight
                  className="size-6 shrink-0 text-white/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Newsletter (paper) ─────────────────────────────────────────────────── */

export function NewsletterBand() {
  const es = useEs();

  return (
    <section className="bg-paper py-20 md:py-24">
      <div className="mx-auto grid max-w-7xl items-end gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-6">
          <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.05] tracking-[-0.03em] text-primary">
            {es ? "Un correo al año, con lo que logramos juntos." : "One email a year, with what we achieved together."}
          </h2>
          <p className="mt-4 max-w-md text-lg text-primary/70">
            {es
              ? "Novedades del campus, de los cursos nuevos y del proyecto de pista. Sin spam."
              : "News about the campus, new courses and the airstrip project. No spam."}
          </p>
        </div>
        <div className="w-full max-w-md lg:col-span-5 lg:col-start-8">
          <NewsletterForm variant="light" />
        </div>
      </div>
    </section>
  );
}
