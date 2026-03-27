type Props = { params: Promise<{ examId: string }> };

/**
 * Admin exam detail — same question model as professor editor.
 */
export default async function AdminExamPage({ params }: Props) {
  const { examId } = await params;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Exam (admin)</h1>
      <p className="font-mono text-xs text-muted-foreground">exam_id: {examId}</p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Full edit access to <code className="text-xs">exams</code>,{" "}
        <code className="text-xs">questions</code>, <code className="text-xs">options</code>. Use
        for support and content fixes.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Reuse professor exam editor component when ready.
      </div>
    </div>
  );
}
