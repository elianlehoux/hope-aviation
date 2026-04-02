import { apiRoutes } from "@/lib/api/app-routes";

/**
 * Exam attempts — grading audit trail (admin uses the same course-scoped API as instructors).
 */
export default function AdminExamAttemptsPage() {
  const path = apiRoutes.courseExamAttempts("[courseId]", "[examId]");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Exam attempts</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        <strong className="text-foreground">GET</strong>{" "}
        <code className="text-xs break-all">{path}</code> — returns{" "}
        <code className="text-xs">{"{ data: { attempts } }"}</code> with student{" "}
        <code className="text-xs">profiles</code> embedded when RLS allows. Learners use{" "}
        <code className="text-xs break-all">{apiRoutes.examAttempts("[examId]")}</code> for their own
        rows only.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Read-only report table here.
      </div>
    </div>
  );
}
