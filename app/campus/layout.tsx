import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { CampusMobileNav } from "@/components/features/campus/CampusMobileNav";

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
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="hidden xl:flex w-64 flex-col border-r border-border bg-card">
        <div className="flex items-center px-6 h-20 border-b border-border">
          <Link href="/" className="group flex items-center w-fit">
            <img 
              src="/logos/Hope Black.svg" 
              alt="Hope Aviation" 
              className="h-20 w-auto drop-shadow-sm scale-[1.5] origin-left transition-transform duration-300 group-hover:scale-[1.55]" 
            />
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border px-6 py-4">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </aside>

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
      <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
        <span className="hidden sm:inline max-w-[200px] truncate text-xs">
          {user?.email ?? "Signed in"}
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}
