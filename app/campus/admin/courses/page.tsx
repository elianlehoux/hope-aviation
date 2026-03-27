/**
 * Full course catalog — all statuses.
 */
export default function AdminCoursesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Admin view over <code className="text-xs">courses</code>. Create/edit JSONB translations,
        set <code className="text-xs">status</code>, manage nested{" "}
        <code className="text-xs">subjects</code> and <code className="text-xs">classes</code> from
        detail pages.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Link each row to <code className="text-xs">/campus/admin/courses/[courseId]</code>.
      </div>
    </div>
  );
}
