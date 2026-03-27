import Link from "next/link";

/**
 * Professor (instructor) area — content and roster management.
 */
export default function ProfessorsHomePage() {
  const links = [
    { href: "/campus/professors/courses", label: "Courses", note: "courses, subjects, classes" },
    { href: "/campus/professors/exams", label: "Exams", note: "exams, questions, options" },
    { href: "/campus/professors/roster", label: "Roster", note: "enrollments → profiles" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Professors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          UI for the <code className="text-xs">instructor</code> role. When you add an
          instructor–course link in the schema, filter lists by that mapping.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex flex-col rounded-lg border border-border bg-card px-4 py-3 hover:bg-accent/50 transition-colors"
            >
              <span className="font-medium">{l.label}</span>
              <span className="text-xs text-muted-foreground">{l.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
