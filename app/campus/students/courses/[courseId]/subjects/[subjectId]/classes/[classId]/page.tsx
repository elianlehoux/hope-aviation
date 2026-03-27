type Props = {
  params: Promise<{
    courseId: string;
    subjectId: string;
    classId: string;
  }>;
};

/**
 * Single class (lesson) — update lesson_progress when completed.
 */
export default async function StudentClassPage({ params }: Props) {
  const { courseId, subjectId, classId } = await params;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Class</h1>
      <p className="font-mono text-xs text-muted-foreground">
        course · {courseId} · subject · {subjectId} · class · {classId}
      </p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Read <code className="text-xs">classes</code> by id. On completion, upsert{" "}
        <code className="text-xs">lesson_progress</code> (
        <code className="text-xs">user_id</code>, <code className="text-xs">class_id</code>
        , <code className="text-xs">is_completed</code>,{" "}
        <code className="text-xs">completed_at</code>).
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Embed player for <code className="text-xs">video_url</code> here.
      </div>
    </div>
  );
}
