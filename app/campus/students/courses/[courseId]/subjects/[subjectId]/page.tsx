type Props = {
  params: Promise<{ courseId: string; subjectId: string }>;
};

/**
 * Subject view — list classes (video lessons, resources).
 */
export default async function StudentSubjectPage({ params }: Props) {
  const { courseId, subjectId } = await params;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Subject</h1>
      <p className="font-mono text-xs text-muted-foreground">
        course_id: {courseId} · subject_id: {subjectId}
      </p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Query <code className="text-xs">classes</code> for this{" "}
        <code className="text-xs">subject_id</code>. Show{" "}
        <code className="text-xs">video_url</code>,{" "}
        <code className="text-xs">resource_url</code>,{" "}
        <code className="text-xs">duration_minutes</code>.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Each class links to{" "}
        <code className="text-xs">.../classes/[classId]</code>.
      </div>
    </div>
  );
}
