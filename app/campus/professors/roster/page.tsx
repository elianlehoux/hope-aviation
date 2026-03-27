/**
 * Enrollment overview — students per course.
 */
export default function ProfessorRosterPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Roster</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        For each allowed course, list <code className="text-xs">enrollments</code> joined with{" "}
        <code className="text-xs">profiles</code> (<code className="text-xs">first_name</code>,{" "}
        <code className="text-xs">last_name</code>, <code className="text-xs">email</code>). Show{" "}
        <code className="text-xs">enrollments.status</code>.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Filterable table by course here.
      </div>
    </div>
  );
}
