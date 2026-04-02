import { apiRoutes } from "@/lib/api/app-routes";

type Props = { params: Promise<{ examId: string }> };

/**
 * Instructor exam builder — questions and correct options.
 */
export default async function ProfessorExamPage({ params }: Props) {
  const { examId } = await params;
  const staffAttempts = apiRoutes.courseExamAttempts("[courseId]", examId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Edit exam</h1>
      <p className="font-mono text-xs text-muted-foreground">exam_id: {examId}</p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Edit <code className="text-xs">exams</code> settings and nested{" "}
        <code className="text-xs">questions</code> / <code className="text-xs">options</code> via
        the course/subject API routes. Mark <code className="text-xs">is_correct</code> on exactly
        one option per question (or adapt for multi-select later).
      </p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        <strong className="text-foreground">GET</strong> (all student attempts for this exam —
        admin or assigned instructor):{" "}
        <code className="text-xs break-all">{staffAttempts}</code>. Resolve{" "}
        <code className="text-xs">course_id</code> from the exam row or{" "}
        <code className="text-xs break-all">{apiRoutes.courseTree("[courseId]")}</code>.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Question bank UI here.
      </div>
    </div>
  );
}
