import { apiRoutes } from "@/lib/api/app-routes";

type Props = { params: Promise<{ examId: string }> };

/**
 * Exam attempt flow — paper + history + submit via HTTP API.
 */
export default async function StudentExamPage({ params }: Props) {
  const { examId } = await params;
  const paper = apiRoutes.examPaper(examId);
  const attempts = apiRoutes.examAttempts(examId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Exam</h1>
      <p className="font-mono text-xs text-muted-foreground">exam_id: {examId}</p>
      <ul className="text-sm text-muted-foreground max-w-2xl list-disc pl-5 space-y-2">
        <li>
          <strong className="text-foreground">GET</strong>{" "}
          <code className="text-xs break-all">{paper}</code> — questions and options (student-safe).
        </li>
        <li>
          <strong className="text-foreground">GET</strong>{" "}
          <code className="text-xs break-all">{attempts}</code> — own attempts,{" "}
          <code className="text-xs">max_attempts</code>, <code className="text-xs">finished_attempt_count</code>.
        </li>
        <li>
          <strong className="text-foreground">POST</strong>{" "}
          <code className="text-xs break-all">{attempts}</code> — body{" "}
          <code className="text-xs">{"{ answers: Record<questionId, optionId> }"}</code>; response{" "}
          <code className="text-xs">{"{ data: { attempt, score, passed } }"}</code>.
        </li>
      </ul>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Question UI and timer go here.
      </div>
    </div>
  );
}
