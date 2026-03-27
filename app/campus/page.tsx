import Link from "next/link";

/**
 * Campus hub — links into role-oriented areas (students, professors, admin).
 * Fine-grained authorization by `roles` / `roles_users` can be added later.
 */
export default function CampusDashboardPage() {
  const areas = [
    {
      title: "Students",
      description:
        "Enrollments, courses, subjects, classes, exams, and personal progress (profiles, enrollments, lesson_progress, exam_attempts).",
      href: "/campus/students",
    },
    {
      title: "Professors",
      description:
        "Teaching workspace for course content, classes, exams, and rosters (courses, subjects, classes, exams, enrollments).",
      href: "/campus/professors",
    },
    {
      title: "Admin",
      description:
        "Platform management: users, roles, catalog, and assessments (profiles, roles, roles_users, courses, exams).",
      href: "/campus/admin",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campus</h1>
        <p className="mt-2 text-muted-foreground">
          Choose an area. Route groups mirror your PostgreSQL domain model.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
          >
            <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
              {item.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
