"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { ArrowRight, Heart, ChevronDown } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageToggle } from "@/components/shared/language-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, loading } = useUser();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      // Trigger change when the navbar (top:0) hits the next section
      // Since Hero is h-screen, the next section starts at window.innerHeight
      setIsScrolled(window.scrollY >= window.innerHeight - 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 z-50 w-full transition-all duration-300 border-b ${
        isScrolled 
          ? "bg-white/80 backdrop-blur-xl border-slate-100 py-1" 
          : "bg-transparent border-transparent py-2"
      }`}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        {/* Logo Section */}
        <div className="flex-1">
          <Link href="/" className="group flex items-center w-fit">
            <img 
              src="/logos/Hope Black.svg" 
              alt="Hope Aviation" 
              className={`h-16 w-auto drop-shadow-sm scale-[2.1] origin-left transition-all duration-300 group-hover:scale-[2.15] ${
                isScrolled ? "" : "brightness-0 invert"
              }`} 
            />
          </Link>
        </div>

        {/* Navigation Links (Centered) */}
        <div className="hidden flex-1 justify-center gap-8 md:flex">
          <Link
            href="/courses"
            className={`flex items-center text-sm font-semibold transition-colors relative group ${
              isScrolled ? "text-slate-600 hover:text-primary" : "text-white/80 hover:text-white"
            }`}
          >
            {t("navbar.courses")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
          </Link>
          <Link
            href="/#about"
            className={`flex items-center text-sm font-semibold transition-colors relative group ${
              isScrolled ? "text-slate-600 hover:text-primary" : "text-white/80 hover:text-white"
            }`}
          >
             {t("navbar.about")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
          </Link>

          {/* Get Involved Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger 
              className={`flex items-center text-sm font-semibold transition-colors relative group outline-none ${
                isScrolled ? "text-slate-600 hover:text-primary" : "text-white/80 hover:text-white"
              }`}
            >
              Get involved
              <ChevronDown className="ml-1 size-4 transition-transform group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="center" 
              className={`w-56 border border-white/10 ${
                isScrolled ? "bg-white text-slate-900" : "bg-black/90 text-white"
              }`}
            >
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent/10">
                <Link href="/get-involved/church">Connect your church</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent/10">
                <Link href="/get-involved/project">Connect your project</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent/10">
                <Link href="/get-involved/teach">Teach</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent/10">
                <Link href="/get-involved/volunteer">Volunteer</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className={isScrolled ? "bg-slate-100" : "bg-white/10"} />
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent/10">
                <Link href="/get-involved/support">Support us</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Action Buttons Section */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <LanguageToggle 
            className={isScrolled ? "text-slate-500 hover:text-primary hover:bg-slate-50" : "text-white/80 hover:text-white hover:bg-white/10"} 
          />
          
          <Button 
            asChild 
            variant="ghost" 
            size="sm" 
            className={`hidden sm:flex font-bold transition-colors ${
              isScrolled ? "text-primary hover:bg-accent/5" : "text-white hover:bg-white/10"
            }`}
          >
            <Link href="/donate" className="flex items-center gap-2">
              <Heart className="size-4 text-accent fill-accent/10" />
              {t("navbar.donate")}
            </Link>
          </Button>

          <Button asChild size="sm" className="hidden sm:flex shadow-lg shadow-accent/20 font-bold px-6 group bg-accent hover:bg-accent/90 border-none text-white">
            <Link href={user ? "/campus" : "/auth/login"} className="flex items-center gap-1.5">
              Learn
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
