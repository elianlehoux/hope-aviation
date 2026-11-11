"use client";

import Link from "next/link";
import { Instagram, Mail } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { CopyrightYear } from "@/components/shared/copyright-year";

interface FooterProps {
  minimal?: boolean;
}

const footLink =
  "rounded-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

/**
 * Public footer on the ink band. Brochure tagline, three short link groups and
 * contact. `minimal` keeps only the bottom line for distraction-free pages.
 */
export function Footer({ minimal = false }: FooterProps) {
  const { lang } = useTranslation();
  const es = lang === "es";

  const bottom = (
    <div className="flex flex-col gap-3 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-x-1.5">
        {/* CopyrightYear renders its own <p>: "© YYYY Hope Aviation." */}
        <CopyrightYear />
        <p>{es ? "Proyecto humanitario sin fines de lucro." : "Non-profit humanitarian project."}</p>
      </div>
      <div className="flex gap-5">
        <Link href="/privacy" className={footLink}>
          {es ? "Privacidad" : "Privacy"}
        </Link>
        <Link href="/terms" className={footLink}>
          {es ? "Términos" : "Terms"}
        </Link>
      </div>
    </div>
  );

  if (minimal) {
    return <footer className="w-full bg-ink py-10 text-white"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{bottom}</div></footer>;
  }

  const groups = [
    {
      title: es ? "Aprender" : "Learn",
      links: [
        { href: "/campus", label: "Campus" },
        { href: "/#cursos", label: es ? "Cursos" : "Courses" },
        { href: "/#como-funciona", label: es ? "Cómo funciona" : "How it works" },
      ],
    },
    {
      title: es ? "Conocer" : "Explore",
      links: [
        { href: "/about", label: es ? "Nosotros" : "About us" },
        { href: "/directorio", label: es ? "Directorio de proyectos" : "Project directory" },
      ],
    },
    {
      title: es ? "Sumarse" : "Get involved",
      links: [
        { href: "/donate", label: es ? "Donar" : "Donate" },
        { href: "/get-involved/church", label: es ? "Tu iglesia" : "Your church" },
        { href: "/get-involved/project", label: es ? "Tu proyecto" : "Your project" },
        { href: "/get-involved/teach", label: es ? "Enseñar" : "Teach" },
        { href: "/get-involved/volunteer", label: es ? "Voluntariado" : "Volunteer" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-ink pb-10 pt-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/hope-logo.svg" alt="Hope Aviation" className="h-9 w-auto brightness-0 invert" />
            </Link>
            <p className="mt-8 max-w-sm font-display text-3xl font-light leading-[1.1] tracking-[-0.02em]">
              {es ? "Llevando esperanza donde los caminos no llegan." : "Bringing hope where roads can’t reach."}
            </p>
            <div className="mt-8 flex flex-col gap-3 text-sm">
              <a href="mailto:hope.aviation.uap@gmail.com" className={`inline-flex w-fit items-center gap-2 ${footLink}`}>
                <Mail className="size-4" aria-hidden="true" />
                hope.aviation.uap@gmail.com
              </a>
              <a
                href="https://instagram.com/hope.aviation"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex w-fit items-center gap-2 ${footLink}`}
              >
                <Instagram className="size-4" aria-hidden="true" />
                @hope.aviation
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
            {groups.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-semibold text-white">{group.title}</h2>
                <ul className="mt-4 flex flex-col gap-3 text-sm">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={footLink}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">{bottom}</div>
      </div>
    </footer>
  );
}
