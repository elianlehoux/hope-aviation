import { apiRoutes } from "@/lib/api/app-routes";

/**
 * Exams available to the student (by enrolled courses / subjects).
 */
export default function StudentExamsPage() {
  const example = apiRoutes.examAttempts("[examId]");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        After navigation to an exam, load limits and history with{" "}
        <code className="text-xs break-all">{example}</code> (returns{" "}
        <code className="text-xs">max_attempts</code>,{" "}
        <code className="text-xs">finished_attempt_count</code>, and attempts).
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Link rows to <code className="text-xs">/campus/students/exams/[examId]</code>.
      </div>
    </div>
  );
}
