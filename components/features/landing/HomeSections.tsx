"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { NewsletterForm } from "@/components/features/landing/NewsletterForm";
import { CountUp, ScrollFill, Words } from "@/components/features/landing/motion";

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

const linkFocus = "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

/* ── Who we are ─────────────────────────────────────────────────────────── */

export function MissionSection() {
  const es = useEs();

  const facts = [
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
  ];

  return (
    <section id="nosotros" className="scroll-mt-20 overflow-hidden bg-white py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="max-w-[18ch] font-display text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.03em] text-primary">
          <Words
            text={
              es
                ? "No enseñamos a volar. Te preparamos para servir."
                : "We don\u2019t teach you to fly. We prepare you to serve."
            }
            highlight={[es ? "servir" : "serve"]}
              emphasis="underline"
          />
        </h2>

        <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-12">
          {/* Two overlapping photos that drift at different speeds */}
          <div className="relative md:col-span-5">
            <div data-reveal="clip">
              <figure
                data-progress="through"
                className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-paper-deep"
              >
                <Image
                  src="/images/landing/cockpit-study.webp"
                  alt={
                    es
                      ? "Dos voluntarios revisan los instrumentos dentro de la cabina de un avión liviano"
                      : "Two volunteers going over the instruments inside a light aircraft cockpit"
                  }
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="parallax object-cover [--shift:70px]"
                />
              </figure>
            </div>
            <figure
              data-progress="through"
              data-reveal="up"
              style={{ ["--i" as string]: 4 }}
              className="absolute -bottom-10 -right-3 w-[52%] sm:-right-8 md:-right-10 lg:-right-16"
            >
              <div className="parallax relative aspect-[4/3] overflow-hidden rounded-[24px] bg-paper-deep shadow-[0_24px_48px_rgba(0,38,62,0.22)] ring-4 ring-white [--shift:-90px] [--zoom:1]">
                <Image
                  src="/images/landing/airfield-group.webp"
                  alt={
                    es
                      ? "Cinco personas conversan junto a un avión liviano en una pista de pasto"
                      : "Five people talking beside a light aircraft on a grass strip"
                  }
                  fill
                  sizes="(min-width: 768px) 22vw, 52vw"
                  className="object-cover object-[60%_60%]"
                />
              </div>
            </figure>
          </div>

          <div className="mt-10 flex flex-col justify-end md:col-span-6 md:col-start-7 md:mt-0">
            <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-primary/80">
              <p data-reveal="up">
                {es
                  ? "Hope Aviation es un proyecto humanitario sin fines de lucro de Argentina. Respetamos la formación que cada piloto hace en su escuela de confianza; nosotros entramos después, con lo que la aviación misionera exige y casi nadie enseña."
                  : "Hope Aviation is a non-profit humanitarian project from Argentina. We respect the training each pilot gets at their own flight school; we come in afterwards, with what mission aviation demands and almost nobody teaches."}
              </p>
              <p data-reveal="up" style={{ ["--i" as string]: 1 }}>
                {es
                  ? "Trabajo transcultural, primeros auxilios y rescate, operaciones en zonas remotas, apoyo emocional, sostén económico y fundamento espiritual. Y cuando estés listo, queremos conectarte con organizaciones que ya vuelan en el campo."
                  : "Cross-cultural work, first aid and rescue, remote-field operations, emotional support, fundraising and spiritual grounding. And when you\u2019re ready, we want to connect you with organizations already flying in the field."}
              </p>
            </div>

            <div className="relative mt-12 pt-8">
              <span data-reveal="line" className="absolute inset-x-0 top-0 h-px bg-primary/15" aria-hidden="true" />
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {facts.map((item, i) => (
                  <div key={item.term} data-reveal="up" style={{ ["--i" as string]: i + 1 }}>
                    <dt className="font-display text-2xl font-normal tracking-tight text-primary">{item.term}</dt>
                    <dd className="mt-1 text-sm text-primary/65">{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <Link
              href="/about"
              data-reveal="up"
              className={`group mt-10 inline-flex w-fit items-center gap-2 font-semibold text-primary underline decoration-highlight decoration-2 underline-offset-[6px] transition-colors hover:text-accent ${linkFocus}`}
            >
              {es ? "Conocé el proyecto" : "About the project"}
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                aria-hidden="true"
              />
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
      figure: (
        <>
          <CountUp value={2780400} /> km²
        </>
      ),
      key: "area",
      text: es
        ? "de territorio: Argentina es el octavo país más grande del mundo."
        : "of territory: Argentina is the eighth-largest country in the world.",
    },
    {
      figure: <CountUp value={18} duration={1200} />,
      key: "regions",
      text: es
        ? "regiones naturales, de la selva de Misiones a la estepa patagónica."
        : "natural regions, from the Misiones rainforest to the Patagonian steppe.",
    },
    {
      figure: es ? "Horas" : "Hours",
      key: "hours",
      text: es
        ? "en lancha, en el Delta del Paraná, para llegar a un centro de salud."
        : "by boat in the Paraná Delta to reach a health center.",
    },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-highlight py-20 text-primary md:py-28">
      {/* Contour lines, the brochure's signature graphic, kept to the corner */}
      <svg
        className="spin-slow pointer-events-none absolute -right-24 -top-24 -z-10 h-[34rem] w-[34rem] text-primary/10 md:h-[44rem] md:w-[44rem]"
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
          <h2 className="font-display text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.03em] lg:col-span-7">
            <Words
              text={
                es
                  ? "Hay comunidades a horas del hospital más cercano."
                  : "Some communities are hours from the nearest hospital."
              }
            />
          </h2>
          <p
            data-reveal="up"
            className="max-w-md self-end text-lg leading-relaxed text-primary/80 lg:col-span-4 lg:col-start-9"
          >
            {es
              ? "Cuando una crecida corta los caminos en Chaco o en Córdoba, el tiempo se vuelve una cuestión de vida. Las ambulancias aéreas salen de los grandes aeropuertos y no llegan a cientos de pueblos. Hope Aviation nació para cerrar esa distancia."
              : "When floods cut the roads in Chaco or Córdoba, time becomes a matter of life. Air ambulances fly from major airports and never reach hundreds of villages. Hope Aviation was created to close that gap."}
          </p>
        </div>

        {/* Hairline dividers come from the 1px gap; no rounding, so no faint corners on amber. */}
        <dl className="mt-16 grid gap-px bg-primary/15 sm:grid-cols-3">
          {facts.map((fact, i) => (
            <div key={fact.key} className="bg-highlight p-6 md:p-8" data-reveal="up" style={{ ["--i" as string]: i }}>
              <dt className="font-display text-4xl font-light tracking-[-0.03em] md:text-5xl">{fact.figure}</dt>
              <dd className="mt-3 max-w-xs text-base leading-snug text-primary/80">{fact.text}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-14 max-w-4xl font-display text-[clamp(1.75rem,3.6vw,3rem)] font-normal leading-[1.12] tracking-[-0.02em]">
          <ScrollFill
            text={
              es
                ? "Nuestra misión es simple: preparar a quienes van a llegar donde nadie llega."
                : "Our mission is simple: to prepare the people who will reach the unreachable."
            }
          />
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
    <section id="como-funciona" className="scroll-mt-20 bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 className="font-display text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.03em] text-primary lg:col-span-7">
            <Words
              text={es ? "Del primer clic al certificado." : "From the first click to your certificate."}
              highlight={[es ? "certificado" : "certificate"]}
              emphasis="underline"
            />
          </h2>
          <p
            data-reveal="up"
            className="max-w-md self-end text-lg leading-relaxed text-primary/75 lg:col-span-4 lg:col-start-9"
          >
            {es
              ? "El campus es gratuito y funciona a tu ritmo. Así avanza cualquier curso:"
              : "The campus is free and works at your own pace. This is how every course goes:"}
          </p>
        </div>

        {/* The route: five waypoints joined by a path that fills in as you scroll (vertical on mobile) */}
        <ol data-progress="span" className="mt-16 grid gap-10 lg:grid-cols-5 lg:gap-6">
          {steps.map((step, i) => {
            const last = i === steps.length - 1;
            return (
              <li
                key={step.title}
                className="relative flex gap-5 lg:flex-col lg:gap-0"
                style={{ ["--i" as string]: i }}
              >
                {/* Each leg runs from this waypoint to the next, so the route ends at the certificate. */}
                {!last && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-10 left-[1.4375rem] top-12 w-0.5 bg-primary/15 lg:-right-6 lg:bottom-auto lg:left-12 lg:top-[1.4375rem] lg:h-0.5 lg:w-auto"
                  >
                    <span className="route-leg absolute inset-0 origin-top bg-highlight [scale:1_var(--leg)] lg:origin-left lg:[scale:var(--leg)_1]" />
                  </span>
                )}
                <span
                  className={cn(
                    "route-stop relative isolate z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-paper-deep font-display text-lg font-medium ring-8 ring-paper",
                    last && "[--stop-ink:var(--color-primary)] [--stop:var(--color-highlight)]",
                  )}
                >
                  {last ? <Award className="size-5" aria-hidden="true" /> : i + 1}
                  {last && <span className="sr-only">{i + 1}</span>}
                </span>
                <div className="pt-2 lg:pt-6" data-reveal="up">
                  <h3 className="font-display text-xl font-medium tracking-tight text-primary">{step.title}</h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-primary/70">{step.text}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div data-reveal="up" className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            asChild
            size="lg"
            className="group h-14 bg-highlight pl-8 pr-6 text-base text-primary hover:bg-highlight/90"
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
            className="h-14 border-primary/25 px-8 text-base hover:bg-paper-deep"
          >
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
  const [active, setActive] = React.useState(0);

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
      alt: es
        ? "Vista aérea de los ríos e islas del Delta del Paraná"
        : "Aerial view of the rivers and islands of the Paraná Delta",
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
          <h2 className="font-display text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.03em] lg:col-span-7">
            <Words text={es ? "Donde el avión es el único camino rápido." : "Where a plane is the only fast way in."} />
          </h2>
          <p
            data-reveal="up"
            className="max-w-md self-end text-lg leading-relaxed text-white/75 lg:col-span-4 lg:col-start-9"
          >
            {es
              ? "Cinco regiones de Argentina que estudiamos para servir. Todavía no operamos vuelos: es lo que estamos preparando, empezando por las personas."
              : "Five regions of Argentina we are studying to serve. We don't operate flights yet: that's what we're preparing for, starting with people."}
          </p>
        </div>
      </div>

      {/* Swipeable cards on small screens; on large ones the panel you point at opens up */}
      <ul
        data-reveal="up"
        className="scrollbar-hide mx-auto mt-14 flex max-w-7xl snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:px-6 lg:h-[34rem] lg:gap-3 lg:overflow-visible lg:px-8"
      >
        {regions.map((region, i) => {
          const open = active === i;
          return (
            <li
              key={region.name}
              className={cn(
                "w-[78vw] max-w-[20rem] shrink-0 snap-start lg:w-auto lg:min-w-0 lg:max-w-none lg:shrink lg:basis-0 lg:transition-[flex-grow] lg:duration-700 lg:ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
                open ? "lg:grow-[3.4]" : "lg:grow",
              )}
            >
              <button
                type="button"
                aria-pressed={open}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className="group relative isolate block h-[26rem] w-full overflow-hidden rounded-[24px] bg-white/5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-highlight lg:h-full"
              >
                <Image
                  src={region.img}
                  alt={region.alt}
                  fill
                  sizes="(min-width: 1024px) 45vw, 78vw"
                  className={cn(
                    "-z-20 object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
                    open ? "lg:scale-100" : "lg:scale-110",
                  )}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,15,21,0.1)_0%,rgba(11,15,21,0.15)_40%,rgba(11,15,21,0.88)_100%)]"
                />
                <span className="absolute inset-x-0 bottom-0 flex flex-col p-5 lg:p-6">
                  <span className="font-mono text-xs text-highlight">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-2 block font-display text-2xl font-normal leading-tight tracking-tight lg:text-xl xl:text-2xl">
                    {region.name}
                  </span>
                  {/* Collapsed panels keep the text in the page for screen readers; it only folds visually. */}
                  <span
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
                      open ? "lg:grid-rows-[1fr] lg:opacity-100" : "lg:grid-rows-[0fr] lg:opacity-0",
                    )}
                  >
                    <span className="overflow-hidden">
                      <span className="block pt-2 text-sm leading-relaxed text-white/85 lg:w-[22rem]">
                        {region.need}
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── Form, connect, serve (photo band that opens as you scroll) ─────────── */

export function ValuesBand() {
  const es = useEs();

  const values = es
    ? [
        { word: "Formar", text: "Cursos gratuitos en el campus, a tu ritmo." },
        {
          word: "Conectar",
          text: "Queremos acercarte a organizaciones que ya vuelan.",
        },
        { word: "Servir", text: "Donde los caminos no llegan." },
      ]
    : [
        {
          word: "Train",
          text: "Free courses on the campus, at your own pace.",
        },
        {
          word: "Connect",
          text: "We want to bring you closer to organizations already flying.",
        },
        { word: "Serve", text: "Where roads can\u2019t reach." },
      ];

  return (
    <section data-progress="through" className="relative isolate overflow-hidden bg-ink">
      <div className="open-frame relative isolate flex min-h-[38rem] items-start overflow-hidden bg-info py-20 md:min-h-[46rem] md:py-28">
        <Image
          src="/images/landing/plane-watchers.webp"
          alt={
            es
              ? "Dos personas, fuera de foco, miran un avión pequeño que cruza el cielo a lo lejos"
              : "Two people, out of focus, watch a small plane crossing the sky in the distance"
          }
          fill
          sizes="100vw"
          className="parallax -z-20 object-cover [--shift:160px] [--zoom:1.2]"
        />
        {/* Light wash: the sky stays bright enough for navy type */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.5)_45%,rgba(255,255,255,0.15)_80%)]" />

        <div className="mx-auto w-full max-w-7xl px-4 text-primary sm:px-6 lg:px-8">
          <h2 className="sr-only">{values.map((v) => v.word).join(", ")}</h2>
          <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
            {values.map((value, i) => (
              <li key={value.word} className="rise-word" style={{ ["--i" as string]: i }}>
                <p className="font-display text-[clamp(3.25rem,5.8vw,5.25rem)] font-light leading-none tracking-[-0.04em]">
                  {value.word}
                  <span className="text-highlight">.</span>
                </p>
                <p className="mt-4 max-w-[18rem] text-lg font-medium leading-snug text-primary">{value.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
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
      text: es
        ? "Ofrendas especiales o mensuales, y becas para estudiantes."
        : "One-off or monthly offerings, and student scholarships.",
    },
    {
      href: "/get-involved/project",
      title: es ? "Tu proyecto" : "Your project",
      text: es
        ? "Aviones, un lugar para operar o cursos para el campus."
        : "Aircraft, a place to operate or courses for the campus.",
    },
    {
      href: "/get-involved/teach",
      title: es ? "Enseñar" : "Teach",
      text: es
        ? "Si sos profesional, enseñá tu tema como voluntario."
        : "If you're a professional, teach your subject as a volunteer.",
    },
    {
      href: "/get-involved/volunteer",
      title: es ? "Voluntariado" : "Volunteer",
      text: es
        ? "Video, producción, marketing y más, desde donde estés."
        : "Video, production, marketing and more, from anywhere.",
    },
  ];

  return (
    <section id="sumate" className="scroll-mt-20 relative isolate overflow-hidden bg-accent py-20 text-white md:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <h2 className="font-display text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.03em]">
            <Words
              text={
                es ? "Cada vuelo empieza con alguien que se suma." : "Every flight starts with someone who joins in."
              }
            />
          </h2>
          <p data-reveal="up" className="mt-6 max-w-md text-lg leading-relaxed text-white/85">
            {es
              ? "Tu ayuda sostiene el campus gratuito, las becas y el camino hacia nuestra propia base y pista en Argentina."
              : "Your gift keeps the campus free and funds scholarships and the road to our own base and airstrip in Argentina."}
          </p>
          <Button
            asChild
            size="lg"
            data-reveal="up"
            style={{ ["--i" as string]: 1 }}
            className="group mt-10 h-14 bg-highlight pl-8 pr-6 text-base text-primary hover:bg-highlight/90 focus-visible:ring-white"
          >
            <Link href="/donate">
              {es ? "Donar" : "Donate"}
              <ArrowRight
                className="size-5 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Link>
          </Button>
        </div>

        <ul className="self-end border-t border-white/25 lg:col-span-6 lg:col-start-7">
          {ways.map((way, i) => (
            <li key={way.href} data-reveal="up" style={{ ["--i" as string]: i }} className="border-b border-white/25">
              {/* A white sheet slides up behind the row on hover; the type flips to navy */}
              <Link
                href={way.href}
                className="group relative isolate -mx-4 flex items-center justify-between gap-6 overflow-hidden rounded-[12px] px-4 py-6 before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-white before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:text-primary hover:before:scale-y-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:before:transition-none"
              >
                <span className="flex items-baseline gap-5">
                  <span className="font-mono text-xs text-white/85 transition-colors group-hover:text-primary/65">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block font-display text-2xl font-normal tracking-tight md:text-3xl">
                      {way.title}
                    </span>
                    <span className="mt-1 block text-white/85 transition-colors group-hover:text-primary/75">
                      {way.text}
                    </span>
                  </span>
                </span>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/40 transition-[background-color,border-color,transform] duration-500 group-hover:rotate-45 group-hover:border-highlight group-hover:bg-highlight group-hover:text-primary motion-reduce:transition-none">
                  <ArrowUpRight className="size-5" aria-hidden="true" />
                </span>
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
            <Words
              text={
                es
                  ? "Un correo al año, con lo que logramos juntos."
                  : "One email a year, with what we achieved together."
              }
            />
          </h2>
          <p data-reveal="up" className="mt-4 max-w-md text-lg text-primary/70">
            {es
              ? "Novedades del campus, de los cursos nuevos y del proyecto de pista. Sin spam."
              : "News about the campus, new courses and the airstrip project. No spam."}
          </p>
        </div>
        <div data-reveal="up" className="w-full max-w-md lg:col-span-5 lg:col-start-8">
          <NewsletterForm variant="light" />
        </div>
      </div>
    </section>
  );
}
