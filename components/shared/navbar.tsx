"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold">Hope Aviation</span>
          </Link>
          <div className="hidden gap-6 md:flex">
            <Link
              href="/campus"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Campus
            </Link>
            <Link
              href="/courses"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Cursos
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            Iniciar Sesión
          </Button>
          <Button size="sm">Empezar</Button>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
