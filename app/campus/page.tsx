import Link from "next/link";

/**
 * Campus Dashboard — Main hub after entering the virtual campus.
 * Shows a welcome message and quick-access cards to key sections.
 */
export default function CampusDashboardPage() {
  const quickLinks = [
    {
      title: "My Courses",
      description: "Continue where you left off or explore new modules.",
      href: "/campus/courses",
    },
    {
      title: "Schedule",
      description: "View upcoming classes, exams, and live sessions.",
      href: "/campus/schedule",
    },
    {
      title: "Grades",
      description: "Track your performance across all enrolled courses.",
      href: "/campus/grades",
    },
    {
      title: "Resources",
      description: "Access study materials, manuals, and reference docs.",
      href: "/campus/resources",
    },
    {
      title: "Community",
      description: "Join discussions with fellow students and instructors.",
      href: "/campus/community",
    },
    {
      title: "Settings",
      description: "Manage your profile, preferences, and notifications.",
      href: "/campus/settings",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to your Campus
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pick up where you left off or explore what&apos;s new.
        </p>
      </div>

      {/* Quick-Access Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
          >
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
