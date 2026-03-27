import Link from "next/link";

/**
 * Student area home — maps to learner-facing data: enrollments, progress, attempts.
 */
export default function StudentsHomePage() {
  const links = [
    { href: "/campus/students/courses", label: "My courses", note: "enrollments → courses" },
    { href: "/campus/students/progress", label: "Progress", note: "lesson_progress" },
    { href: "/campus/students/exams", label: "Exams", note: "exams, exam_attempts" },
    { href: "/campus/students/profile", label: "Profile", note: "profiles" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Students</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          UI for the <code className="text-xs">student</code> role: learning paths and
          evaluation.
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
