/**
 * Exams available to the student (by enrolled courses / subjects).
 */
export default function StudentExamsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        List <code className="text-xs">exams</code> the user may access (via{" "}
        <code className="text-xs">course_id</code> / enrollment). Show{" "}
        <code className="text-xs">passing_score</code>,{" "}
        <code className="text-xs">time_limit_minutes</code>,{" "}
        <code className="text-xs">max_attempts</code> and compare with existing{" "}
        <code className="text-xs">exam_attempts</code>.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Link rows to <code className="text-xs">/campus/students/exams/[examId]</code>.
      </div>
    </div>
  );
}
