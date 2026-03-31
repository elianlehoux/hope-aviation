"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Navbar = () => {
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
            href="/campus"
            className="flex items-center text-sm font-semibold text-slate-600 transition-colors hover:text-primary relative group"
          >
            Campus
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
          </Link>
          <Link
            href="/courses"
            className="flex items-center text-sm font-semibold text-slate-600 transition-colors hover:text-primary relative group"
          >
            Cursos
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
          </Link>
        </div>

        {/* Action Buttons Section */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" className="font-bold text-primary">
            Ingresar
          </Button>
          <Button size="sm" className="shadow-lg shadow-primary/20">
            Comenzar
          </Button>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
