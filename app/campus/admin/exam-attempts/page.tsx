/**
 * Exam attempts — grading audit trail.
 */
export default function AdminExamAttemptsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Exam attempts</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Inspect <code className="text-xs">exam_attempts</code>: scores,{" "}
        <code className="text-xs">passed</code>, <code className="text-xs">started_at</code> /{" "}
        <code className="text-xs">finished_at</code>. Join <code className="text-xs">profiles</code> and{" "}
        <code className="text-xs">exams</code> for reporting.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Read-only report table here.
      </div>
    </div>
  );
}
