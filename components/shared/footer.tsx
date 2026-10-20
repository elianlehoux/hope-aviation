"use client";

import Link from "next/link";
import Image from "next/image";
import { T } from "@/lib/i18n/context";
import { Instagram } from "lucide-react";
import { CopyrightYear } from "@/components/shared/copyright-year";
import { NewsletterForm } from "@/components/features/landing/NewsletterForm";

interface FooterProps {
  minimal?: boolean;
}

/**
 * Footer — Premium Apple-style dark footer aligned with DESIGN.md and GEMINI.md.
 * Supports a `minimal` mode for specific content or distraction-free pages.
 */
export function Footer({ minimal = false }: FooterProps) {
  if (minimal) {
    return (
      <footer className="w-full bg-[#0B0F15] border-t border-white/5 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 font-bold text-[10px] uppercase tracking-[0.25em] text-center md:text-left">
          <div className="flex items-center gap-1.5 justify-center md:justify-start">
            <CopyrightYear />
            <span>•</span>
            <T k="landing.footerRightsReserved" />
          </div>
          <p>
            <T k="landing.footerDesigned" />
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-[#0B0F15] border-t border-white/5 pt-20 pb-12 px-6 md:px-8 lg:px-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_bottom_right,rgba(23,73,255,0.04),transparent_70%)] pointer-events-none z-0" />
      
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 items-start">
          {/* Column 1: Brand & Social */}
          <div className="flex flex-col items-start gap-5">
            <Link href="/" className="group flex items-center">
              <Image
                src="/logos/Hope Black.svg"
                alt="Hope Aviation"
                width={120}
                height={40}
                className="h-10 scale-[2.1] origin-left brightness-0 invert transition-all duration-500 group-hover:scale-[2.15]"
                style={{ width: "auto" }}
                priority
              />
            </Link>
            <p className="text-slate-400 font-medium text-sm leading-relaxed mt-2 max-w-xs">
              <T k="landing.footerTagline" />
            </p>
            <div className="flex items-center gap-3 mt-1">
              <a
                href="https://instagram.com/hope.aviation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-all duration-300 p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-full hover:scale-110 flex items-center justify-center size-10"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Features */}
          <div className="flex flex-col items-start">
            <h4 className="font-bold text-white text-xs uppercase tracking-[0.2em] mb-6">
              <T k="landing.footerFeatures" />
            </h4>
            <div className="flex flex-col gap-3.5 font-semibold text-slate-400 text-sm">
              <Link
                href="/#cursos"
                className="hover:text-accent hover:translate-x-1 transition-all duration-300 inline-block w-fit"
              >
                <T k="navbar.courses" />
              </Link>
              <Link
                href="/about"
                className="hover:text-accent hover:translate-x-1 transition-all duration-300 inline-block w-fit"
              >
                <T k="navbar.about" />
              </Link>
              <Link
                href="/campus"
                className="hover:text-accent hover:translate-x-1 transition-all duration-300 inline-block w-fit"
              >
                <T k="landing.enterCampus" />
              </Link>
              <Link
                href="/get-involved/support"
                className="hover:text-accent hover:translate-x-1 transition-all duration-300 inline-block w-fit"
              >
                <T k="navbar.donate" />
              </Link>
            </div>
          </div>

          {/* Column 3: Legal */}
          <div className="flex flex-col items-start">
            <h4 className="font-bold text-white text-xs uppercase tracking-[0.2em] mb-6">
              Legal
            </h4>
            <div className="flex flex-col gap-3.5 font-semibold text-slate-400 text-sm">
              <Link
                href="/privacy"
                className="hover:text-accent hover:translate-x-1 transition-all duration-300 inline-block w-fit"
              >
                <T k="landing.footerPrivacy" />
              </Link>
              <Link
                href="/terms"
                className="hover:text-accent hover:translate-x-1 transition-all duration-300 inline-block w-fit"
              >
                <T k="landing.footerTerms" />
              </Link>
              <a
                href="mailto:hope.aviation.uap@gmail.com"
                className="hover:text-accent hover:translate-x-1 transition-all duration-300 inline-block w-fit"
              >
                <T k="landing.footerContact" />
              </a>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col items-start">
            <h4 className="font-bold text-white text-xs uppercase tracking-[0.2em] mb-6">
              <T k="landing.newsletterTitle" />
            </h4>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
              <T k="landing.newsletterDesc" />
            </p>
            <div className="w-full">
              <NewsletterForm />
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 font-bold text-[10px] uppercase tracking-[0.25em] text-center md:text-left">
          <div className="flex items-center gap-1.5 justify-center md:justify-start">
            <CopyrightYear />
            <span>•</span>
            <T k="landing.footerRightsReserved" />
          </div>
          <p>
            <T k="landing.footerDesigned" />
          </p>
        </div>
      </div>
    </footer>
  );
}
