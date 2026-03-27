import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

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
    { href: "/campus", label: "Dashboard" },
    { href: "/campus/students", label: "Students" },
    { href: "/campus/professors", label: "Professors" },
    { href: "/campus/admin", label: "Admin" },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <span className="text-lg font-bold tracking-tight">Hope Campus</span>
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

function CampusHeaderFallback() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6 py-4">
      <h2 className="text-sm font-semibold text-muted-foreground md:hidden">
        Hope Campus
      </h2>
      <div className="ml-auto h-8 w-24 animate-pulse rounded-full bg-muted" />
    </header>
  );
}

async function CampusHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6 py-4">
      <h2 className="text-sm font-semibold text-muted-foreground md:hidden">
        Hope Campus
      </h2>
      <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
        <span className="hidden sm:inline max-w-[200px] truncate text-xs">
          {user?.email ?? "Signed in"}
        </span>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
