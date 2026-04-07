import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { CampusMobileNav } from "@/components/features/campus/CampusMobileNav";
import { CampusSidebar } from "@/components/features/campus/CampusSidebar";

/**
 * Campus layout — shell for all /campus/* routes.
 * Access is enforced globally via Supabase session refresh in `proxy.ts`.
 */
export default function CampusLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navLinks = [
    { href: "/campus", label: "Home" },
    { href: "/campus/courses", label: "My Learning" },
    { href: "/campus/admin/users", label: "Users" },
    { href: "/campus/admin/roles", label: "Roles" },
    { href: "/campus/admin/courses", label: "Courses" },
    { href: "/campus/admin/exams", label: "Exams" },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Suspense fallback={<div className="sticky top-0 h-screen hidden xl:flex w-64 flex-col border-r border-border bg-card animate-pulse" />}>
        <CampusSidebar navLinks={navLinks} />
      </Suspense>

      <div className="flex-1 flex flex-col">
        <Suspense fallback={<CampusHeaderFallback />}>
          <CampusHeader navLinks={navLinks} />
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

async function CampusHeader({ navLinks }: { navLinks: { href: string; label: string }[] }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6">
      <div className="xl:hidden">
        <Suspense fallback={<MobileNavSlotSkeleton />}>
          <CampusMobileNav navLinks={navLinks} />
        </Suspense>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <UserMenu user={user as any} />
      </div>
    </header>
  );
}
