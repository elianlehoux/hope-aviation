import Link from "next/link";

/**
 * Campus Layout
 * Persistent shell for all /campus/* routes.
 * Includes a sidebar navigation and a top bar.
 */
export default function CampusLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navLinks = [
    { href: "/campus", label: "Dashboard" },
    { href: "/campus/courses", label: "Courses" },
    { href: "/campus/schedule", label: "Schedule" },
    { href: "/campus/grades", label: "Grades" },
    { href: "/campus/resources", label: "Resources" },
    { href: "/campus/community", label: "Community" },
    { href: "/campus/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <span className="text-lg font-bold tracking-tight">
            Hope Campus
          </span>
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

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6 py-4">
          <h2 className="text-sm font-semibold text-muted-foreground md:hidden">
            Hope Campus
          </h2>
          <div className="ml-auto text-sm text-muted-foreground">
            {/* Placeholder for user avatar / auth controls */}
            <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium">
              Student
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
