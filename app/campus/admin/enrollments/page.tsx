/**
 * Enrollment records — audit and support.
 */
export default function AdminEnrollmentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Enrollments</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        View <code className="text-xs">enrollments</code>: <code className="text-xs">user_id</code>,{" "}
        <code className="text-xs">course_id</code>, <code className="text-xs">enrolled_at</code>,{" "}
        <code className="text-xs">status</code>. Support bulk status updates if your product rules
        allow it.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Data grid with filters here.
      </div>
    </div>
  );
}
