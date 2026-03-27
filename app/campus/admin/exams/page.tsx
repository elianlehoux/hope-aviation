/**
 * All exams — cross-course management.
 */
export default function AdminExamsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        List every <code className="text-xs">exams</code> row with course/subject references.
        Drill into <code className="text-xs">/campus/admin/exams/[examId]</code> for question
        maintenance.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Global exam index here.
      </div>
    </div>
  );
}
