/**
 * Exams tied to courses/subjects the instructor owns.
 */
export default function ProfessorExamsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        List <code className="text-xs">exams</code> with <code className="text-xs">course_id</code> /{" "}
        <code className="text-xs">subject_id</code>. Editing affects{" "}
        <code className="text-xs">questions</code> and <code className="text-xs">options</code>.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Link to <code className="text-xs">/campus/professors/exams/[examId]</code>.
      </div>
    </div>
  );
}
