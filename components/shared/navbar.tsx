"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";

const involved = [
  { href: "/get-involved/church", es: "Tu iglesia", en: "Your church" },
  { href: "/get-involved/project", es: "Tu proyecto", en: "Your project" },
  { href: "/get-involved/teach", es: "Enseñar", en: "Teach" },
  { href: "/get-involved/volunteer", es: "Voluntariado", en: "Volunteer" },
  { href: "/get-involved/support", es: "Apoyar", en: "Give" },
];

/**
 * Public site navigation.
 * `overlay` pages (photo hero) get a transparent bar with the white logo that
 * turns solid after scrolling; every other page gets the solid bar directly.
 * No usePathname here: links inside the drawer close it via SheetClose.
 */
export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    if (!overlay) return;
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Tuck the bar away while reading down the page; any scroll up brings it back.
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 480);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const clear = overlay && !scrolled;

  const links = [
    { href: "/#cursos", label: es ? "Cursos" : "Courses" },
    { href: "/#como-funciona", label: es ? "Cómo funciona" : "How it works" },
    { href: "/directorio", label: es ? "Directorio" : "Directory" },
    { href: "/about", label: es ? "Nosotros" : "About" },
  ];

  const linkClass = cn(
    "rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
    clear
      ? "text-white/85 hover:bg-white/10 hover:text-white focus-visible:outline-white"
      : "text-primary/75 hover:bg-primary/5 hover:text-primary focus-visible:outline-accent",
  );

  return (
    <header
      className={cn(
        "z-50 w-full transition-[background-color,border-color,box-shadow,transform] duration-300 focus-within:translate-y-0 motion-reduce:transition-none",
        overlay ? "fixed inset-x-0 top-0" : "sticky top-0",
        hidden && !open && "-translate-y-full",
        clear
          ? "border-b border-transparent bg-transparent"
          : "border-b border-primary/10 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75",
      )}
    >
      <nav
        aria-label={es ? "Principal" : "Main"}
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:h-20 lg:px-8"
      >
        <Link
          href="/"
          className={cn(
            "flex shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4",
            clear ? "focus-visible:outline-white" : "focus-visible:outline-accent",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/hope-logo.svg"
            alt="Hope Aviation"
            className={cn("h-8 w-auto transition-[filter] duration-300 md:h-9", clear && "brightness-0 invert")}
          />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={cn(linkClass, "inline-flex items-center gap-1")}>
                {es ? "Sumate" : "Get involved"}
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-52 rounded-[12px]">
              {involved.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>{es ? item.es : item.en}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/donate" className={linkClass}>
            {es ? "Donar" : "Donate"}
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:block">
            <LanguageToggle
              className={clear ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-primary/70 hover:bg-primary/5 hover:text-primary"}
            />
          </div>
          <Button
            asChild
            className={cn(
              "h-10 bg-accent px-5 font-semibold text-white hover:bg-accent-hover active:bg-accent-pressed",
              clear && "focus-visible:ring-white",
            )}
          >
            <Link href="/campus">Campus</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={es ? "Abrir menú" : "Open menu"}
                className={cn("lg:hidden", clear ? "text-white hover:bg-white/10 hover:text-white" : "text-primary")}
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-full flex-col overflow-y-auto bg-paper p-6 sm:max-w-sm">
              <SheetTitle className="sr-only">{es ? "Menú" : "Menu"}</SheetTitle>
              <nav aria-label={es ? "Menú móvil" : "Mobile menu"} className="flex flex-1 flex-col pt-10">
                <ul className="flex flex-col">
                  {links.map((link) => (
                    <li key={link.href}>
                      <SheetClose asChild>
                        <Link
                          href={link.href}
                          className="block rounded-md py-3 font-display text-3xl font-light tracking-tight text-primary focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    </li>
                  ))}
                </ul>

                <p className="mt-8 text-sm font-semibold text-primary/65">{es ? "Sumate" : "Get involved"}</p>
                <ul className="mt-2 flex flex-col">
                  {involved.map((item) => (
                    <li key={item.href}>
                      <SheetClose asChild>
                        <Link
                          href={item.href}
                          className="block rounded-md py-2 text-lg text-primary/80 hover:text-primary focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          {es ? item.es : item.en}
                        </Link>
                      </SheetClose>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-col gap-3 pt-10">
                  <SheetClose asChild>
                    <Button asChild size="lg" className="h-12 bg-accent text-white hover:bg-accent-hover">
                      <Link href="/campus">{es ? "Entrar al campus" : "Go to campus"}</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild size="lg" variant="outline" className="h-12 border-primary/25 hover:bg-paper-deep">
                      <Link href="/donate">{es ? "Donar" : "Donate"}</Link>
                    </Button>
                  </SheetClose>
                  <div className="flex items-center justify-between pt-2 text-sm text-primary/65">
                    <span>{es ? "Idioma: español" : "Language: English"}</span>
                    <LanguageToggle className="text-primary/70 hover:bg-primary/5 hover:text-primary" />
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
