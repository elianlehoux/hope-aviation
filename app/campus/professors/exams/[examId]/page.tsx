type Props = { params: Promise<{ examId: string }> };

/**
 * Instructor exam builder — questions and correct options.
 */
export default async function ProfessorExamPage({ params }: Props) {
  const { examId } = await params;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Edit exam</h1>
      <p className="font-mono text-xs text-muted-foreground">exam_id: {examId}</p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Edit <code className="text-xs">exams</code> settings and nested{" "}
        <code className="text-xs">questions</code> / <code className="text-xs">options</code>.{" "}
        Mark <code className="text-xs">is_correct</code> on exactly one option per question (or
        adapt for multi-select later).
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Question bank UI here.
      </div>
    </div>
  );
}
