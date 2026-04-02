import { apiRoutes } from "@/lib/api/app-routes";

/**
 * Enrollment records — audit and support.
 */
export default function AdminEnrollmentsPage() {
  const patch = apiRoutes.enrollmentById("[enrollmentId]");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Enrollments</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        List <code className="text-xs break-all">{apiRoutes.enrollments()}</code> or{" "}
        <code className="text-xs break-all">{apiRoutes.courseEnrollments("[courseId]")}</code>.
        Status updates: <strong className="text-foreground">PATCH</strong>{" "}
        <code className="text-xs break-all">{patch}</code> with{" "}
        <code className="text-xs">{"{ status }"}</code> — owner, admin, or course instructor (when
        RLS allows).
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Data grid with filters here.
      </div>
    </div>
  );
}
