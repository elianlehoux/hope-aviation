import Link from "next/link";

/**
 * Admin area — platform-wide configuration and catalog.
 */
export default function AdminHomePage() {
  const links = [
    { href: "/campus/admin/users", label: "Users", note: "profiles, roles_users" },
    { href: "/campus/admin/roles", label: "Roles", note: "roles" },
    { href: "/campus/admin/courses", label: "Courses", note: "courses, subjects, classes" },
    { href: "/campus/admin/exams", label: "Exams", note: "exams, questions, options" },
    { href: "/campus/admin/enrollments", label: "Enrollments", note: "enrollments" },
    { href: "/campus/admin/exam-attempts", label: "Exam attempts", note: "exam_attempts" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Restrict these routes to users with the <code className="text-xs">admin</code> role via{" "}
          <code className="text-xs">roles_users</code> + middleware or server checks.
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
