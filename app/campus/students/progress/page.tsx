/**
 * Aggregated lesson completion for the current user.
 */
export default function StudentProgressPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Query <code className="text-xs">lesson_progress</code> for{" "}
        <code className="text-xs">user_id</code>, join <code className="text-xs">classes</code>{" "}
        and parent <code className="text-xs">subjects</code> /{" "}
        <code className="text-xs">courses</code> for labels from JSONB titles.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Progress bars or checklist UI here.
      </div>
    </div>
  );
}
