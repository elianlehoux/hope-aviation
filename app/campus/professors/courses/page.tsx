/**
 * Courses the instructor manages (placeholder until instructor–course relation exists).
 */
export default function ProfessorCoursesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        List <code className="text-xs">courses</code> the user may edit. If all instructors
        see all draft/published courses, gate by RLS or a future{" "}
        <code className="text-xs">course_instructors</code> table.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Table with status (<code className="text-xs">draft | published | archived</code>) and
        localized titles.
      </div>
    </div>
  );
}
