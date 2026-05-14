"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { ArrowRight, HandHeart, ChevronDown, Menu, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageToggle } from "@/components/shared/language-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

const Navbar = () => {
  const { user, loading } = useUser();
  const { t, lang, setLang } = useTranslation();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const [isScrolled, setIsScrolled] = React.useState(!isHomePage);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isHidden, setIsHidden] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Close the menus automatically when the route changes and clean up Radix UI body locks
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    // Bulletproof cleanup for Radix UI modal/sheet orphaned body locks on route change
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    document.body.removeAttribute("data-scroll-locked");
  }, [pathname]);

  // Also clean up on browser back/forward navigation (popstate),
  // which may not trigger a pathname change in Next.js after a 404
  React.useEffect(() => {
    const handlePopState = () => {
      setIsMobileMenuOpen(false);
      setIsDropdownOpen(false);
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
      document.body.removeAttribute("data-scroll-locked");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  };

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      if (!isHomePage) {
        setIsScrolled(true);
        setIsHidden(window.scrollY >= 400); // Hide after scrolling 400px on internal pages
      } else {
        setIsScrolled(window.scrollY > 20);
        setIsHidden(window.scrollY >= window.innerHeight - 80);
      }
    };
    
    // Check initial scroll position once mounted
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Use the SSR-safe state until the component has mounted on the client
  const activeIsScrolled = mounted ? isScrolled : !isHomePage;
  const activeIsHidden = mounted ? isHidden : false;

  return (
    <nav
      suppressHydrationWarning
      className={`fixed top-0 z-50 w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-b ${
        activeIsHidden ? "-translate-y-full" : "translate-y-0"
      } ${
        activeIsScrolled
          ? "bg-[#00263E]/90 backdrop-blur-xl border-white/10 py-1"
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
              className={`h-16 w-auto drop-shadow-sm scale-[2.1] origin-left transition-all duration-300 group-hover:scale-[2.15] brightness-0 invert`}
            />
          </Link>
        </div>

        {/* Navigation Links (Centered) */}
        <div className="hidden flex-1 justify-center gap-8 md:flex">
          <Link
            href="/courses"
            className={`flex items-center text-sm font-semibold transition-colors relative group text-white/80 hover:text-white`}
          >
            {t("navbar.courses")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
          </Link>
          <Link
            href="/about"
            className={`flex items-center text-sm font-semibold transition-colors relative group text-white/80 hover:text-white`}
          >
            {t("navbar.about")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
          </Link>

          {/* Get Involved Dropdown */}
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <DropdownMenu modal={false} open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center text-sm font-semibold transition-colors relative group outline-none cursor-pointer text-white/80 hover:text-white`}
                >
                  Get involved
                  <ChevronDown className="ml-1 size-4 transition-transform group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`w-56 border border-white/10 bg-[#00263E] text-white`}
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
                <DropdownMenuSeparator className={activeIsScrolled ? "bg-slate-100" : "bg-white/10"} />
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent/10">
                  <Link href="/get-involved/support">Support us</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="flex-1 flex items-center justify-end gap-3">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">


            <Button
              asChild
              variant="ghost"
              size="sm"
              className={`font-bold transition-colors text-white hover:bg-white/10`}
            >
              <Link href="/donate" className="flex items-center gap-2">
                <HandHeart className="size-4 text-accent fill-accent/10" />
                {t("navbar.donate")}
              </Link>
            </Button>

            <Button asChild size="sm" className="shadow-lg shadow-accent/20 font-bold px-6 group bg-accent hover:bg-accent/90 border-none text-white">
              <Link href={user ? "/campus" : "/auth/login"} className="flex items-center gap-1.5">
                Learn
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <LanguageToggle
              className="text-white/80 hover:text-white hover:bg-white/10"
            />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white"
                >
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" showCloseButton={false} className="max-h-[50vh] overflow-y-auto bg-white p-0 flex flex-col rounded-b-[32px] border-none shadow-2xl">
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>

                {/* Mobile Menu Header (mimics Navbar) */}
                <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8 shrink-0">
                  <div className="flex-1">
                    <img
                      src="/logos/Hope Black.svg"
                      alt="Hope Aviation"
                      className="h-16 w-auto drop-shadow-sm scale-[2.1] origin-left"
                    />
                  </div>
                  <div className="flex-1 flex justify-end">
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="text-slate-900">
                        <X className="size-6" />
                      </Button>
                    </SheetClose>
                  </div>
                </div>

                {/* Mobile Menu Links */}
                <div className="flex flex-col gap-4 px-6 pb-6">
                  <Link href="/courses" className="flex items-center text-lg font-bold text-slate-800 hover:text-accent p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  {t("navbar.courses")}
                </Link>
                <Link href="/about" className="flex items-center text-lg font-bold text-slate-800 hover:text-accent p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  {t("navbar.about")}
                </Link>

                <div className="h-px bg-slate-100 my-1 w-full" />

                <div className="px-2 text-xs font-black text-slate-400 uppercase tracking-widest mt-2 mb-1">
                  Get involved
                </div>
                <Link href="/get-involved/church" className="flex items-center text-base font-semibold text-slate-600 hover:text-accent p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  Connect your church
                </Link>
                <Link href="/get-involved/project" className="flex items-center text-base font-semibold text-slate-600 hover:text-accent p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  Connect your project
                </Link>
                <Link href="/get-involved/teach" className="flex items-center text-base font-semibold text-slate-600 hover:text-accent p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  Teach
                </Link>
                <Link href="/get-involved/volunteer" className="flex items-center text-base font-semibold text-slate-600 hover:text-accent p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  Volunteer
                </Link>
                <Link href="/get-involved/support" className="flex items-center text-base font-semibold text-slate-600 hover:text-accent p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  Support us
                </Link>

                <div className="h-px bg-slate-100 my-1 w-full" />


                <button
                  onClick={() => setLang(lang === "en" ? "es" : "en")}
                  className="flex items-center justify-between text-base font-bold text-slate-500 p-2 rounded-lg hover:bg-slate-50 transition-colors w-full text-left"
                >
                  {lang === "en" ? "Español" : "English"}
                  <span className="text-xs font-black bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    {lang === "en" ? "ES" : "EN"}
                  </span>
                </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
