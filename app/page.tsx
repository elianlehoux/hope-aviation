import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Video,
  BarChart3,
  Library,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
  Plane,
  Navigation,
  Gauge,
  GraduationCap,
  Radio,
} from "lucide-react";

/**
 * Landing Page — Public-facing homepage for Hope Aviation.
 *
 * Design thesis: aviation is a world of precise instruments and plotted
 * flight paths. The hero renders a cruising-altitude atmosphere (brand navy),
 * a flight-path arc drawn on load, and instrument-style readouts. That flight
 * path returns as the organizing metaphor for the training journey ("Ruta de
 * vuelo"), where each waypoint is a real stage. Amber is the single warm
 * signal, reserved for "live" accents.
 */

const features = [
  {
    title: "Cursos interactivos",
    description:
      "Módulos estructurados de teoría de vuelo, regulación y conocimiento práctico, a tu ritmo.",
    icon: BookOpen,
    code: "TEO",
    featured: true,
  },
  {
    title: "Sesiones en vivo",
    description:
      "Clases en tiempo real con instructores que vuelan en la industria.",
    icon: Video,
    code: "LIV",
  },
  {
    title: "Seguimiento de progreso",
    description:
      "Analíticas claras de tu avance, hito a hito, como un plan de vuelo.",
    icon: BarChart3,
    code: "TRK",
  },
  {
    title: "Biblioteca de recursos",
    description:
      "Manuales, guías de estudio y material de referencia, disponibles 24/7.",
    icon: Library,
    code: "LIB",
  },
  {
    title: "Comunidad",
    description:
      "Conecta con estudiantes y profesionales de la aviación en todo el mundo.",
    icon: Users,
    code: "NET",
  },
  {
    title: "Certificaciones",
    description:
      "Certificados reconocidos al completar cada programa de formación.",
    icon: Award,
    code: "CRT",
  },
];

const route = [
  {
    stage: "01",
    title: "Fundamentos",
    description:
      "Teoría de vuelo, meteorología y regulación aeronáutica desde cero.",
    icon: BookOpen,
  },
  {
    stage: "02",
    title: "Simulación",
    description:
      "Prácticas guiadas en simulador y sesiones en vivo con instructores.",
    icon: Gauge,
  },
  {
    stage: "03",
    title: "Evaluación",
    description:
      "Exámenes, seguimiento continuo y retroalimentación personalizada.",
    icon: BarChart3,
  },
  {
    stage: "04",
    title: "Certificación",
    description:
      "Obtén tu certificado reconocido y despega hacia tu carrera.",
    icon: GraduationCap,
  },
];

const stats = [
  { value: "+2.400", label: "Estudiantes en ruta" },
  { value: "48", label: "Cursos certificados" },
  { value: "96%", label: "Tasa de aprobación" },
  { value: "24/7", label: "Acceso al campus" },
];

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-white font-sans text-slate-900">
      <Navbar />

      {/* ── Hero — cruising-altitude atmosphere ── */}
      <section className="relative overflow-hidden bg-primary text-white">
        {/* Atmospheric depth: horizon glow + vibrant-blue haze + amber sunrise */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_15%_0%,rgba(23,73,255,0.28),transparent_55%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_100%_100%,rgba(255,170,0,0.14),transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Signature: flight-path arc drawn across the hero */}
        <svg
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-90"
          viewBox="0 0 1200 640"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="pathGrad" x1="0" y1="640" x2="1200" y2="0">
              <stop offset="0%" stopColor="#1749ff" stopOpacity="0.15" />
              <stop offset="55%" stopColor="#1749ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffaa00" />
            </linearGradient>
          </defs>
          <path
            d="M-40,560 C260,520 430,340 700,300 C900,270 1040,200 1260,80"
            stroke="url(#pathGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            className="animate-draw-path [stroke-dashoffset:1]"
            style={{ ["--path-length" as string]: 1 }}
          />
          {/* Waypoints along the route */}
          {[
            { cx: 260, cy: 470 },
            { cx: 700, cy: 300 },
            { cx: 1040, cy: 175 },
          ].map((wp, i) => (
            <g
              key={i}
              className="animate-waypoint origin-center"
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            >
              <circle
                cx={wp.cx}
                cy={wp.cy}
                r="9"
                fill="none"
                stroke="#ffaa00"
                strokeWidth="1.5"
                opacity="0.5"
              />
              <circle cx={wp.cx} cy={wp.cy} r="3.5" fill="#ffaa00" />
            </g>
          ))}
        </svg>

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:py-36">
          {/* Left — headline */}
          <div>
            <p
              className="animate-rise flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.28em] text-brand-orange"
              style={{ animationDelay: "80ms" }}
            >
              <Radio className="size-3.5" />
              FL350 · Campus virtual · En ruta
            </p>

            <Title
              level="h1"
              className="animate-rise mt-6 text-5xl font-extrabold leading-[1.03] tracking-tight text-white md:text-6xl lg:text-7xl"
              style={{ animationDelay: "160ms" }}
            >
              Tu carrera en la
              <br />
              aviación,{" "}
              <span className="bg-gradient-to-r from-white to-[#8fb4ff] bg-clip-text text-transparent">
                trazada
              </span>
            </Title>

            <p
              className="animate-rise mt-7 max-w-xl text-lg leading-relaxed text-slate-300 md:text-xl"
              style={{ animationDelay: "240ms" }}
            >
              Un campus virtual que reúne cursos, simulación, instructores y
              certificación en un solo plan de vuelo. Aprende, practica y despega
              — desde donde estés.
            </p>

            <div
              className="animate-rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "320ms" }}
            >
              <Button
                asChild
                size="lg"
                className="group h-14 bg-white px-8 text-base text-primary shadow-xl shadow-black/20 hover:bg-white/90"
              >
                <Link href="/campus">
                  Ingresar al campus
                  <ArrowRight className="ml-1 size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 !border-white/30 bg-white/5 px-8 text-base text-white hover:!bg-white hover:!text-primary"
              >
                <a href="#ruta">Ver la ruta de vuelo</a>
              </Button>
            </div>
          </div>

          {/* Right — instrument panel */}
          <div
            className="animate-rise relative rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:p-7"
            style={{ animationDelay: "420ms" }}
          >
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
              <span className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="animate-radar absolute inline-flex size-full rounded-full bg-brand-orange" />
                  <span className="relative inline-flex size-2 rounded-full bg-brand-orange" />
                </span>
                Estado del vuelo
              </span>
              <span>HOPE·01</span>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  Progreso del programa
                </p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight text-white">
                  68<span className="text-brand-orange">%</span>
                </p>
              </div>
              <Navigation className="size-8 -rotate-45 text-accent" />
            </div>

            {/* Progress track styled as an altitude tape */}
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-accent to-brand-orange" />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-slate-500">
              <span>Despegue</span>
              <span>Certificación</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { k: "Módulos", v: "12 / 18" },
                { k: "Horas de vuelo", v: "42.5" },
                { k: "Próxima sesión", v: "Hoy 18:00" },
                { k: "Instructor", v: "Cap. Rivas" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                    {row.k}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {row.v}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instrument readout strip */}
        <div className="border-t border-white/10">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="py-7 md:py-8">
                <p className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — flight-deck bento ── */}
      <section id="features" className="bg-[#f7f9fb] py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.24em] text-accent">
              <Plane className="size-3.5" />
              Panel de instrumentos
            </p>
            <Title
              level="h2"
              className="mt-4 text-4xl font-extrabold tracking-tight text-primary md:text-5xl"
            >
              Todo a bordo para volar alto
            </Title>
            <p className="mt-4 text-lg font-medium text-slate-500">
              Una suite completa, diseñada específicamente para la formación
              aeronáutica moderna.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl hover:shadow-primary/5 ${
                    feature.featured ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  {/* top hairline that lights up on hover */}
                  <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-accent/8 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                      <Icon className="size-6" />
                    </div>
                    <span className="font-mono text-xs tracking-[0.2em] text-slate-300 transition-colors group-hover:text-accent">
                      {feature.code}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold tracking-tight text-primary">
                    {feature.title}
                  </h3>
                  <p className="mt-2 font-medium leading-relaxed text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Ruta de vuelo — the training journey as waypoints ── */}
      <section id="ruta" className="relative bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.24em] text-brand-orange">
              <Navigation className="size-3.5" />
              Tu plan de vuelo
            </p>
            <Title
              level="h2"
              className="mt-4 text-4xl font-extrabold tracking-tight text-primary md:text-5xl"
            >
              Cuatro etapas hasta despegar
            </Title>
            <p className="mt-4 text-lg font-medium text-slate-500">
              Un recorrido claro, de la teoría a la certificación. Sabes siempre
              dónde estás y qué sigue.
            </p>
          </div>

          <div className="relative mt-16">
            {/* connecting flight path behind the waypoints (desktop) */}
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-accent/20 via-accent/40 to-brand-orange/60 lg:block" />

            <ol className="grid gap-10 lg:grid-cols-4 lg:gap-6">
              {route.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.stage} className="relative">
                    <div className="relative z-10 flex size-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                      <Icon className="size-6 text-accent" />
                      <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-semibold text-white">
                        {step.stage}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-bold tracking-tight text-primary">
                      {step.title}
                    </h3>
                    <p className="mt-2 font-medium leading-relaxed text-slate-500">
                      {step.description}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="bg-[#f7f9fb] py-24 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.24em] text-accent">
              Sobre Hope Aviation
            </p>
            <Title
              level="h2"
              className="mt-4 text-4xl font-extrabold tracking-tight text-primary md:text-5xl"
            >
              Educación aeronáutica de clase mundial, sin fronteras
            </Title>
            <p className="mt-6 text-lg font-medium leading-relaxed text-slate-500">
              Hope Aviation es un campus virtual de próxima generación. Nuestra
              misión es hacer que la formación profesional en aviación sea
              accesible, moderna y efectiva para todos — sin importar dónde
              estés.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {["Innovación", "Excelencia", "Compromiso"].map((value) => (
                <div key={value} className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-accent" />
                  <span className="text-sm font-bold text-primary">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="mt-10 h-13 px-8">
              <Link href="/campus">
                Comenzar ahora
                <ArrowRight className="ml-1 size-5" />
              </Link>
            </Button>
          </div>

          {/* Instrument-style credential card */}
          <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-white shadow-2xl shadow-primary/20 md:p-10">
            <div className="absolute inset-0 -z-0 bg-[radial-gradient(80%_60%_at_100%_0%,rgba(23,73,255,0.35),transparent_60%)]" />
            <div className="relative">
              <Gauge className="size-9 text-brand-orange" />
              <p className="mt-6 text-2xl font-bold leading-snug">
                &ldquo;La formación que antes exigía mudarte de ciudad, ahora
                cabe en tu pantalla.&rdquo;
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                {[
                  { v: "100%", k: "En línea" },
                  { v: "12+", k: "Programas" },
                  { v: "★ 4.9", k: "Valoración" },
                ].map((row) => (
                  <div key={row.k}>
                    <p className="text-2xl font-extrabold tracking-tight">
                      {row.v}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                      {row.k}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden bg-primary py-24 text-center text-white md:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_50%_0%,rgba(23,73,255,0.3),transparent_60%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(50%_80%_at_50%_120%,rgba(255,170,0,0.12),transparent)]" />
        <div className="mx-auto max-w-3xl px-6">
          <Plane className="mx-auto size-10 text-brand-orange" />
          <Title
            level="h2"
            className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl"
          >
            El próximo despegue es el tuyo
          </Title>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
            Únete a la nueva generación de profesionales de la aviación. Tu plan
            de vuelo comienza hoy.
          </p>
          <Button
            asChild
            size="lg"
            className="group mt-10 h-14 bg-white px-10 text-base text-primary hover:bg-white/90"
          >
            <Link href="/campus">
              Ingresar al campus
              <ArrowRight className="ml-1 size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-primary py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-12 md:flex-row md:items-start">
            <div className="max-w-xs">
              <img
                src="/logos/Hope Aviation White.webp"
                alt="Hope Aviation"
                className="h-10 w-auto"
              />
              <p className="mt-5 text-sm font-medium text-slate-400">
                Formando el futuro de la aviación global, un plan de vuelo a la
                vez.
              </p>
            </div>

            <div className="flex gap-14 text-sm">
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  Plataforma
                </span>
                <a href="#features" className="text-slate-300 hover:text-white">
                  Características
                </a>
                <a href="#ruta" className="text-slate-300 hover:text-white">
                  Ruta de vuelo
                </a>
                <Link href="/campus" className="text-slate-300 hover:text-white">
                  Campus
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  Compañía
                </span>
                <a href="#about" className="text-slate-300 hover:text-white">
                  Nosotros
                </a>
                <Link href="/campus" className="text-slate-300 hover:text-white">
                  Ingresar
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
              &copy; 2026 Hope Aviation
            </p>
            <p className="text-sm text-slate-500">
              Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
