/**
 * Courses Page — Lists available and enrolled courses.
 */
export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
        <p className="mt-1 text-muted-foreground">
          Browse, enroll, and continue your aviation training modules.
        </p>
      </div>

      {/* Placeholder — will be replaced with real course cards */}
      <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
        <p className="text-sm">Course catalogue coming soon.</p>
      </div>
    </div>
  );
}
