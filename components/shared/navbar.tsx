"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { ArrowRight, Heart } from "lucide-react";

const Navbar = () => {
  const { user, loading } = useUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        {/* Logo Section */}
        <div className="flex-1">
          <Link href="/" className="group flex items-center w-fit">
            <img 
              src="/logos/Hope Black.svg" 
              alt="Hope Aviation" 
              className="h-20 w-auto drop-shadow-sm scale-[1.5] origin-left transition-transform duration-300 group-hover:scale-[1.55]" 
            />
          </Link>
        </div>

        {/* Navigation Links (Centered) */}
        <div className="hidden flex-1 justify-center gap-8 md:flex">
          <Link
            href="/courses"
            className="flex items-center text-sm font-semibold text-slate-600 transition-colors hover:text-primary relative group"
          >
            Cursos
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
          </Link>
          <Link
            href="/about"
            className="flex items-center text-sm font-semibold text-slate-600 transition-colors hover:text-primary relative group"
          >
             Nosotros
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
          </Link>
        </div>

        {/* Action Buttons Section */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden sm:flex font-bold text-primary hover:bg-accent/5 transition-colors">
            <Link href="/donate" className="flex items-center gap-2">
              <Heart className="size-4 text-accent fill-accent/10" />
              Donar
            </Link>
          </Button>
          
          <Button asChild size="sm" className="shadow-lg shadow-primary/20 font-bold px-6 group">
            <Link href={user ? "/campus" : "/auth/login"} className="flex items-center gap-1.5">
              {!loading && (user ? "Ir al Campus" : "Ingresar")}
              {loading && "Cargando..."}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
