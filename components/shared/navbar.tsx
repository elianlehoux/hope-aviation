"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/10 bg-paper/80 backdrop-blur-xl supports-[backdrop-filter]:bg-paper/60">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center">
          <img
            src="/logos/hope-logo.svg"
            alt="Hope Aviation"
            className="h-10 w-auto transition-opacity duration-300 group-hover:opacity-80"
          />
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 md:flex">
          {[
            { href: "/#cursos", label: "Cursos" },
            { href: "/#proyectos", label: "Proyectos" },
            { href: "/#ruta", label: "El recorrido" },
            { href: "/campus", label: "Campus" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative flex items-center text-sm font-medium text-primary/70 transition-colors hover:text-primary"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-brand-orange transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="rounded-full bg-brand-orange font-semibold text-primary shadow-lg shadow-brand-orange/20 hover:bg-brand-orange/90"
          >
            <Link href="/campus">Comenzar</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
