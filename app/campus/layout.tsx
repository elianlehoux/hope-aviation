import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCampusSession, filterNavLinks, type CampusNavLink } from "@/lib/campus/session";
import { LogoutButton } from "@/components/auth/logout-button";
import { CampusMobileNav } from "@/components/features/campus/CampusMobileNav";
import { CampusSidebar } from "@/components/features/campus/CampusSidebar";

/**
 * Campus layout — shell for all /campus/* routes.
 * Access is enforced globally via Supabase session refresh in `proxy.ts`.
 * 
 * Nav link labels use translation keys that are resolved in client components.
 * Links are filtered by role server-side; admin routes are also guarded in `admin/layout.tsx`.
 */
const NAV_LINKS: CampusNavLink[] = [
  { href: "/campus", labelKey: "campus.home" },
  { href: "/campus/certificates", labelKey: "campus.myCertificates" },
  { href: "/campus/admin/user-management", labelKey: "campus.userManagement", roles: ["admin"] },
  { href: "/campus/admin/users", labelKey: "campus.users", roles: ["admin"] },
  { href: "/campus/admin/roles", labelKey: "campus.roles", roles: ["admin"] },
  { href: "/campus/admin/courses", labelKey: "campus.courses", roles: ["admin", "instructor"] },
  { href: "/campus/admin/exams", labelKey: "campus.exams", roles: ["admin", "instructor"] },
  { href: "/campus/admin/newsletter", labelKey: "campus.newsletter", roles: ["admin"] },
];

export default function CampusLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Suspense fallback={<div className="sticky top-0 h-screen hidden xl:flex w-64 flex-col border-r border-border bg-card animate-pulse" />}>
        <CampusSidebarForUser />
      </Suspense>

      <div className="flex-1 flex flex-col">
        <Suspense fallback={<CampusHeaderFallback />}>
          <CampusHeader />
        </Suspense>

        <main className="flex-1 p-6 md:p-8">
          <Suspense
            fallback={
              <div className="text-sm text-muted-foreground">Loading…</div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

/** Must not render client hooks like `usePathname` — see Next.js cacheComponents + Suspense fallback rules. */
function CampusHeaderFallback() {
  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6">
      <MobileNavSlotSkeleton />
      <div className="ml-auto h-8 w-24 animate-pulse rounded-full bg-muted" />
    </header>
  );
}

function MobileNavSlotSkeleton() {
  return (
    <div className="xl:hidden flex items-center" aria-hidden>
      <div className="mr-3 h-10 w-10 animate-pulse rounded-md bg-muted" />
    </div>
  );
}

import { UserMenu } from "@/components/features/campus/UserMenu";
import { LanguageToggle } from "@/components/shared/language-toggle";

async function CampusSidebarForUser() {
  const { roles } = await getCampusSession();
  return <CampusSidebar navLinks={filterNavLinks(NAV_LINKS, roles)} />;
}

async function CampusHeader() {
  const { user, roles } = await getCampusSession();

  if (!user) {
    redirect("/auth/login?clear=1");
  }

  const navLinks = filterNavLinks(NAV_LINKS, roles);

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6">
      <div className="xl:hidden">
        <Suspense fallback={<MobileNavSlotSkeleton />}>
          <CampusMobileNav navLinks={navLinks} />
        </Suspense>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <LanguageToggle />
        <UserMenu user={user as any} />
      </div>
    </header>
  );
}
