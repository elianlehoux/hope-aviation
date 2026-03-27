type Props = {
  params: Promise<{
    courseId: string;
    subjectId: string;
    classId: string;
  }>;
};

/**
 * Instructor class (lesson) editor.
 */
export default async function ProfessorClassPage({ params }: Props) {
  const { courseId, subjectId, classId } = await params;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Edit class</h1>
      <p className="font-mono text-xs text-muted-foreground">
        course · {courseId} · subject · {subjectId} · class · {classId}
      </p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Update <code className="text-xs">classes</code>: localized title/description,{" "}
        <code className="text-xs">video_url</code>, <code className="text-xs">resource_url</code>,{" "}
        <code className="text-xs">duration_minutes</code>, <code className="text-xs">order_index</code>.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Media URL fields and preview here.
      </div>
    </div>
  );
}
