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
    { href: "/campus/admin/users", label: "Users" },
    { href: "/campus/admin/roles", label: "Roles" },
    { href: "/campus/admin/courses", label: "Courses" },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <CampusSidebar navLinks={navLinks} />

      <div className="flex-1 flex flex-col">
        <Suspense fallback={<CampusHeaderFallback navLinks={navLinks} />}>
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

function CampusHeaderFallback({ navLinks }: { navLinks: { href: string; label: string }[] }) {
  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6">
      <div className="xl:hidden">
        <CampusMobileNav navLinks={navLinks} />
      </div>
      <div className="ml-auto h-8 w-24 animate-pulse rounded-full bg-muted" />
    </header>
  );
}

async function CampusHeader({ navLinks }: { navLinks: { href: string; label: string }[] }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6">
      <div className="xl:hidden">
        <CampusMobileNav navLinks={navLinks} />
      </div>
      <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
        <span className="hidden sm:inline max-w-[200px] truncate text-xs">
          {user?.email ?? "Signed in"}
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}
