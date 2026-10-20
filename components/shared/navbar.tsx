"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useTranslation } from "@/lib/i18n/context";
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

export function Navbar() {
  const pathname = usePathname();
  const { t, lang } = useTranslation();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    { href: "/#cursos", label: t("navbar.courses") },
    { href: "/directorio", label: t("navbar.directory") },
    { href: "/about", label: t("navbar.about") },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/10 bg-paper/80 backdrop-blur-xl supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center">
          <img
            src="/logos/hope-logo.svg"
            alt="Hope Aviation"
            className="h-9 w-auto transition-opacity duration-300 group-hover:opacity-80"
          />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-primary/70 transition-colors hover:text-primary"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-brand-orange transition-all group-hover:w-full" />
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary/70 outline-none transition-colors hover:text-primary"
              >
                {t("navbar.getInvolved")}
                <ChevronDown className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {involved.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>{lang === "es" ? item.es : item.en}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageToggle className="text-primary/70 hover:text-primary hover:bg-primary/5" />
          </div>
          <Button
            asChild
            size="sm"
            className="rounded-full bg-brand-orange font-semibold text-primary shadow-lg shadow-brand-orange/20 hover:bg-brand-orange/90"
          >
            <Link href="/campus">{t("navbar.start")}</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-primary">
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="rounded-b-3xl bg-paper p-6">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col gap-4 pt-8">
                {links.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href} className="text-lg font-semibold text-primary">
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                {involved.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link href={item.href} className="text-base text-primary/70">
                      {lang === "es" ? item.es : item.en}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
