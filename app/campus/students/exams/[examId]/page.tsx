type Props = { params: Promise<{ examId: string }> };

/**
 * Exam attempt flow — questions, options, then insert exam_attempts.
 */
export default async function StudentExamPage({ params }: Props) {
  const { examId } = await params;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Exam</h1>
      <p className="font-mono text-xs text-muted-foreground">exam_id: {examId}</p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Load <code className="text-xs">questions</code> and nested{" "}
        <code className="text-xs">options</code> (localized <code className="text-xs">content</code>{" "}
        JSONB). On submit, insert <code className="text-xs">exam_attempts</code> with{" "}
        <code className="text-xs">score</code>, <code className="text-xs">passed</code>,{" "}
        timestamps.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Question UI and timer go here.
      </div>
    </div>
  );
}
