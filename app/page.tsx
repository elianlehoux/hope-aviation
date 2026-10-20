import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/shared/navbar";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Plane,
  Compass,
  MapPin,
  Languages,
  HeartPulse,
  Radio,
  LifeBuoy,
  HandCoins,
  HeartHandshake,
} from "lucide-react";

/**
 * Landing Page — Public-facing homepage for Hope Aviation.
 *
 * Hope Aviation is NOT a flight school. Captured by the line "Learning to
 * Reach", it does two things:
 *   1) Teaches the EXTRA skills an aviation ministry needs and almost no one
 *      prepares for (cross-cultural work, first aid & rescue, remote-field
 *      operations, emotional support, fundraising, spiritual grounding).
 *   2) Shows a global directory of missionary-aviation projects so someone
 *      who wants to serve can see what exists and how to get involved.
 *
 * Design language (2nd pass — warm overhaul): editorial + cinematic
 * photography, warm paper neutrals, deep brand navy for the two "altitude"
 * moments (hero + directory). Amber (#ffaa00) is the SINGLE locked accent —
 * the "hope / reaching" color. Aviation is the means, people are the end.
 *
 * IMAGES: every <Image> below points at a seeded picsum placeholder so the
 * page renders immediately. Replace each `src` with a real mission photo in
 * /public/images (see the list at the bottom of this file). A navy/warm scrim
 * sits over every photo so ANY replacement reads as one cohesive system.
 */

// ── Placeholder photography (swap for real /public/images/* later) ──
const img = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const courses = [
  {
    title: "Trabajo transcultural",
    description:
      "Servir entre culturas y contextos distintos, con respeto, escucha y cercanía real.",
    items: ["Culturas", "Contextos", "Otras religiones"],
    icon: Languages,
  },
  {
    title: "Primeros auxilios y rescate",
    description:
      "Atención sanitaria y operaciones de rescate para cuando cada minuto cuenta.",
    items: ["Primeros auxilios", "Rescate", "Emergencias"],
    icon: HeartPulse,
  },
  {
    title: "Operaciones en zonas remotas",
    description:
      "Aeródromos aislados: logística, comunicaciones y lectura del clima.",
    items: ["Aeródromos", "Logística", "Meteorología"],
    icon: Radio,
  },
  {
    title: "Apoyo psicológico y emocional",
    description:
      "Contención para sostener al equipo, a la familia y a la comunidad.",
    items: ["Contención", "Cuidado del misionero", "Resiliencia"],
    icon: LifeBuoy,
  },
  {
    title: "Sostén y recaudación de fondos",
    description:
      "Financiar y sostener la misión, incluso siendo un ministerio pequeño.",
    items: ["Fundraising", "Tiendas de Pablo", "Sostenibilidad"],
    icon: HandCoins,
  },
  {
    title: "Fundamento espiritual",
    description:
      "Herramientas prácticas: tiempos de oración y trabajo con iglesias locales.",
    items: ["Oración", "Iglesias locales", "Vocación"],
    icon: HeartHandshake,
  },
];

// Real organizations already flying in the mission field. Hope Aviation acts as
// the bridge that connects trained volunteers with them (from the 2026 brief).
const projects = [
  {
    org: "PAMAS",
    region: "Filipinas",
    focus: "Evacuación médica",
    description:
      "Evacuaciones médicas y alcance en zonas sin ningún otro servicio de salud.",
    seed: "hope-philippines-islands",
  },
  {
    org: "Alas de Vida",
    region: "Costa Rica",
    focus: "Montaña",
    description:
      "Pilotos hispanohablantes y operaciones aéreas en zonas montañosas.",
    seed: "hope-costa-rica-mountains",
  },
  {
    org: "Perú Projects",
    region: "Perú",
    focus: "Aviones anfibios",
    description:
      "Aviones terrestres y anfibios para comunidades de selva y de río.",
    seed: "hope-peru-jungle-river",
  },
  {
    org: "MAF",
    region: "Global",
    focus: "+25 países",
    description:
      "Mission Aviation Fellowship, la red de aviación misionera más grande del mundo.",
    seed: "hope-global-aviation-sky",
  },
  {
    org: "Adventist Aviation Services",
    region: "Papúa Nueva Guinea",
    focus: "Zonas extremas",
    description:
      "Referente en una de las geografías más desafiantes del planeta.",
    seed: "hope-papua-highlands",
  },
  {
    org: "Africa Medical Aviation",
    region: "África",
    focus: "Traslados críticos",
    description:
      "Traslados médicos de alta complejidad y respuesta rápida en zonas de bajos recursos.",
    seed: "hope-africa-savanna",
  },
];

const steps = [
  { title: "Aprende", description: "Las habilidades que el ministerio de aviación realmente necesita." },
  { title: "Explora", description: "Proyectos de aviación misionera en el mundo, y qué hace cada uno." },
  { title: "Conecta", description: "Con organizaciones que ya sirven en el campo, para encontrar tu lugar." },
  { title: "Sirve", description: "Súmate con preparación real, no solo con buenas intenciones." },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-paper font-sans text-primary">
      <Navbar />

      {/* ══ Hero — cinematic altitude, photography-led ══ */}
      <section className="relative isolate flex min-h-[calc(100dvh-5rem)] items-center overflow-hidden bg-primary text-white">
        {/* Real hero photo — small plane framed between two silhouettes.
            Save the provided photo to: public/images/hero-plane.jpg */}
        <Image
          src="/images/hero-plane.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        {/* Navy grade: strong on the left (behind text), the photo breathes
            through the centre and right so the plane and sky stay visible */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(0,38,62,0.92)_0%,rgba(0,38,62,0.7)_34%,rgba(0,38,62,0.32)_62%,rgba(0,38,62,0.12)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(0,38,62,0.6)_0%,transparent_26%)]" />

        {/* Signature flight-path arc, quieted right down */}
        <svg
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-70"
          viewBox="0 0 1200 640"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="pathGrad" x1="0" y1="640" x2="1200" y2="0">
              <stop offset="0%" stopColor="#ffaa00" stopOpacity="0" />
              <stop offset="60%" stopColor="#ffaa00" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffaa00" />
            </linearGradient>
          </defs>
          <path
            d="M-40,600 C260,540 430,380 700,320 C900,280 1040,190 1260,70"
            stroke="url(#pathGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={1}
            pathLength={1}
            className="animate-draw-path [stroke-dashoffset:1]"
            style={{ ["--path-length" as string]: 1 }}
          />
          <g className="animate-drift origin-center" style={{ transformBox: "fill-box" }}>
            <circle cx="1040" cy="185" r="3.5" fill="#ffaa00" />
            <circle cx="1040" cy="185" r="9" fill="none" stroke="#ffaa00" strokeWidth="1" opacity="0.5" />
          </g>
        </svg>

        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <p
            className="animate-rise flex items-center gap-2.5 text-sm font-medium text-brand-orange"
            style={{ animationDelay: "80ms" }}
          >
            <span className="h-px w-8 bg-brand-orange/70" />
            Learning to Reach · Aviación misionera
          </p>

          <h1
            className="animate-rise mt-6 max-w-4xl font-display text-6xl font-extrabold leading-[0.98] tracking-tight text-white md:text-7xl lg:text-8xl"
            style={{ animationDelay: "160ms" }}
          >
            Aprende para{" "}
            <span className="text-brand-orange">alcanzar</span>
          </h1>

          <p
            className="animate-rise mt-8 max-w-xl text-lg leading-relaxed text-slate-200 md:text-xl"
            style={{ animationDelay: "240ms" }}
          >
            No enseñamos a volar. Enseñamos las habilidades que la misión
            necesita y te mostramos dónde servir en el mundo.
          </p>

          <div
            className="animate-rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "320ms" }}
          >
            <Button
              asChild
              size="lg"
              className="group h-14 rounded-full bg-brand-orange px-8 text-base font-semibold text-primary shadow-xl shadow-black/25 hover:bg-brand-orange/90"
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
              className="h-14 rounded-full !border-white/25 bg-white/5 px-8 text-base text-white backdrop-blur-sm hover:!bg-white hover:!text-primary"
            >
              <a href="#proyectos">Ver proyectos</a>
            </Button>
          </div>

          {/* Honest orienting strip — no fake live metrics, no status dots */}
          <div
            className="animate-rise mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-sm text-slate-300"
            style={{ animationDelay: "420ms" }}
          >
            <span className="flex items-center gap-2">
              <Compass className="size-4 text-brand-orange" /> Cursos 100% en línea
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-brand-orange" /> Directorio global de proyectos
            </span>
            <span className="hidden items-center gap-2 sm:flex">
              <Plane className="size-4 text-brand-orange" /> Para ministerios grandes y pequeños
            </span>
          </div>
        </div>
      </section>

      {/* ══ Clarifier — a plain, confident editorial statement (no card) ══ */}
      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <p className="reveal font-display text-3xl font-bold leading-[1.15] tracking-tight text-primary md:text-4xl">
            Hope Aviation no es una escuela de vuelo.{" "}
            <span className="text-primary/55">
              El avión ya tiene quien lo pilotee. Lo que casi nunca se prepara es
              todo lo demás: lo que hace que una misión funcione, dure y llegue.
            </span>
          </p>
        </div>
      </section>

      {/* ══ Courses — the real product, editorial numbered layout ══ */}
      <section id="cursos" className="border-t border-primary/10 bg-paper-deep py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl reveal">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Los cursos
            </p>
            <Title
              level="h2"
              as="h2"
              className="mt-3 font-display text-4xl font-extrabold tracking-tight text-primary md:text-5xl"
            >
              Todo lo que el avión no enseña
            </Title>
            <p className="mt-4 text-lg text-primary/70">
              Formación técnica, humanitaria y espiritual para situaciones reales
              de misión. Seis áreas que la instrucción aeronáutica tradicional no
              cubre y el campo sí exige.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {courses.map((course, i) => {
              const Icon = course.icon;
              return (
                <article
                  key={course.title}
                  className={`reveal ${i % 2 === 1 ? "reveal-delay-1" : ""} group relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/30 hover:shadow-xl hover:shadow-primary/5`}
                >
                  {/* top hairline that lights up on hover */}
                  <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-orange/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange transition-colors duration-300 group-hover:bg-brand-orange group-hover:text-primary">
                      <Icon className="size-6" strokeWidth={2} />
                    </div>
                    <span className="font-display text-3xl font-bold text-primary/12 transition-colors group-hover:text-primary/25">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-primary">
                    {course.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-primary/70">
                    {course.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {course.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-primary/[0.06] px-3 py-1 text-xs font-medium text-primary/70"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ Directory — dark cinematic altitude moment #2, honestly framed ══ */}
      <section id="proyectos" className="relative isolate overflow-hidden bg-primary py-24 text-white md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_0%_0%,rgba(23,73,255,0.22),transparent_55%)]" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl reveal">
              <Title
                level="h2"
                as="h2"
                className="font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl"
              >
                Mira lo que ya se está haciendo
              </Title>
              <p className="mt-4 text-lg text-slate-300">
                Organizaciones reales que ya vuelan en el campo misionero. Hope
                Aviation es el puente que te conecta con ellas.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-13 shrink-0 rounded-full !border-white/25 bg-white/5 px-7 text-base text-white hover:!bg-white hover:!text-primary"
            >
              <Link href="/directorio">
                Explorar el directorio
                <ArrowRight className="ml-1 size-5" />
              </Link>
            </Button>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <article
                key={project.org}
                className={`reveal ${i > 0 ? `reveal-delay-${Math.min(i, 3)}` : ""} group relative isolate flex min-h-[19rem] flex-col justify-end overflow-hidden rounded-2xl`}
              >
                <Image
                  src={img(project.seed, 900, 1000)}
                  alt={`${project.org}, aviación misionera en ${project.region}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="-z-20 object-cover transition-transform duration-700 [filter:grayscale(0.4)] group-hover:scale-105"
                />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,38,62,0.15)_0%,rgba(0,38,62,0.55)_55%,rgba(0,38,62,0.94)_100%)]" />
                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-brand-orange">
                    {project.region} · {project.focus}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-white">
                    {project.org}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                    {project.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 text-sm text-slate-400">
            Una muestra de la red global. El directorio completo sigue creciendo
            con ministerios grandes y pequeños.
          </p>
        </div>
      </section>

      {/* ══ Journey — from learning to serving, along the flight path ══ */}
      <section id="ruta" className="bg-paper py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl reveal">
            <Title
              level="h2"
              as="h2"
              className="font-display text-4xl font-extrabold tracking-tight text-primary md:text-5xl"
            >
              De aprender a servir
            </Title>
            <p className="mt-4 text-lg text-primary/70">
              Un recorrido claro: aprende, explora el mundo, conecta con quienes
              ya sirven y encuentra tu lugar.
            </p>
          </div>

          <div className="relative mt-16">
            {/* Flight path connecting the four stops (desktop) */}
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-[linear-gradient(90deg,rgba(255,170,0,0.25),rgba(255,170,0,0.7))] lg:block" />
            <ol className="grid gap-12 lg:grid-cols-4 lg:gap-8">
              {steps.map((step, i) => (
                <li key={step.title} className={`reveal ${i > 0 ? `reveal-delay-${Math.min(i, 3)}` : ""} relative`}>
                  <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
                    {i === steps.length - 1 ? (
                      <Plane className="size-5 text-brand-orange" />
                    ) : (
                      <span className="font-display text-base font-bold text-brand-orange">
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-primary/70">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ══ About — mission, photo split ══ */}
      <section id="about" className="border-t border-primary/10 bg-paper-deep py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
          <div className="reveal">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Sobre Hope Aviation
            </p>
            <Title
              level="h2"
              as="h2"
              className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-primary md:text-5xl"
            >
              La aviación abre el camino. Vos llevás la esperanza.
            </Title>
            <p className="mt-6 text-lg leading-relaxed text-primary/70">
              Demasiada gente llega al campo con el corazón lleno y las manos
              vacías, o termina sirviendo sola. Existimos para que eso no pase:
              para que nadie empiece de cero y nadie sirva solo. Y estamos
              construyendo nuestra propia base y pista en Argentina, para
              traslados médicos y respuesta a desastres.
            </p>
            <blockquote className="mt-8 border-l-2 border-brand-orange pl-5 font-display text-2xl font-bold leading-snug text-primary">
              &ldquo;No enseñamos a volar. Enseñamos a alcanzar.&rdquo;
            </blockquote>
          </div>

          {/* Real mission/community photo (swap seed for a real /public/images photo) */}
          <div className="reveal reveal-delay-1 relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src={img("hope-mission-community-people", 1000, 1250)}
              alt="Comunidad alcanzada por la aviación misionera"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover [filter:grayscale(0.15)]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,38,62,0.65)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-6 text-white">
              <Compass className="size-6 text-brand-orange" />
              <p className="font-display text-lg font-semibold">
                Aviación como medio. Personas como destino.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Final CTA — warm photographic close ══ */}
      <section className="relative isolate overflow-hidden bg-primary py-28 text-center text-white md:py-32">
        <Image
          src={img("hope-remote-airstrip-dusk", 2000, 1000)}
          alt=""
          fill
          sizes="100vw"
          className="-z-20 object-cover opacity-40 [filter:grayscale(0.4)]"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,38,62,0.82),rgba(0,38,62,0.95))]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,170,0,0.16),transparent_60%)]" />
        <div className="mx-auto max-w-3xl px-6">
          <Plane className="mx-auto size-9 text-brand-orange" />
          <Title
            level="h2"
            as="h2"
            className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white md:text-6xl"
          >
            Hay lugares donde solo llega quien se prepara
          </Title>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
            Empieza a prepararte para el lugar donde vas a servir.
          </p>
          <div className="mt-10 flex justify-center">
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
          </div>
        </div>
      </section>

      {/* ══ Footer ══ */}
      <footer className="bg-primary py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col justify-between gap-12 md:flex-row md:items-start">
            <div className="max-w-xs">
              <img
                src="/logos/Hope Aviation White.webp"
                alt="Hope Aviation"
                className="h-10 w-auto"
              />
              <p className="mt-5 text-sm text-slate-400">
                Learning to Reach. Habilidades y proyectos para alcanzar donde no
                llega el camino.
              </p>
            </div>

            <div className="flex gap-14 text-sm">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Aprender
                </span>
                <a href="#cursos" className="text-slate-300 transition-colors hover:text-white">
                  Los cursos
                </a>
                <a href="#ruta" className="text-slate-300 transition-colors hover:text-white">
                  El recorrido
                </a>
                <Link href="/campus" className="text-slate-300 transition-colors hover:text-white">
                  Campus
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Alcanzar
                </span>
                <a href="#proyectos" className="text-slate-300 transition-colors hover:text-white">
                  Proyectos
                </a>
                <a href="#about" className="text-slate-300 transition-colors hover:text-white">
                  Nosotros
                </a>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Contacto
                </span>
                <a
                  href="https://hopeaviation.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 transition-colors hover:text-white"
                >
                  hopeaviation.org
                </a>
                <a
                  href="https://instagram.com/hope.aviation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 transition-colors hover:text-white"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
            <p className="text-sm text-slate-500">&copy; 2026 Hope Aviation</p>
            <p className="text-sm text-slate-500">
              Proyecto humanitario sin fines de lucro.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/*
 * IMAGES:
 *   - HERO: uses /images/hero-plane.jpg — save the provided photo there.
 *   - Directory cards, About photo and CTA still use seeded picsum
 *     placeholders. Swap each `src` for a real photo in /public/images when
 *     available (org / region shots for the directory, a mission/community
 *     photo for About, an airstrip-at-dusk mood for the CTA).
 * Every photo sits under a navy scrim, so warm or cool originals both work.
 */
