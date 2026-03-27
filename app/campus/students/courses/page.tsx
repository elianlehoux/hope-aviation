/**
 * Lists courses the signed-in user is enrolled in.
 * Data: enrollments joined with courses (title JSONB, status, thumbnail_url).
 */
export default function StudentCoursesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">My courses</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Fetch rows from <code className="text-xs">enrollments</code> where{" "}
        <code className="text-xs">user_id</code> matches the current profile, join{" "}
        <code className="text-xs">courses</code>. Display localized{" "}
        <code className="text-xs">title</code>/<code className="text-xs">description</code>{" "}
        JSONB for the active locale.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No data wired yet — replace with a server component + Supabase query.
      </div>
    </div>
  );
}
