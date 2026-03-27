type Props = { params: Promise<{ courseId: string }> };

/**
 * Instructor course editor shell — subjects tree.
 */
export default async function ProfessorCourseDetailPage({ params }: Props) {
  const { courseId } = await params;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Edit course</h1>
      <p className="font-mono text-xs text-muted-foreground">course_id: {courseId}</p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Update <code className="text-xs">courses.title</code> /{" "}
        <code className="text-xs">description</code> JSONB, <code className="text-xs">thumbnail_url</code>,{" "}
        <code className="text-xs">status</code>. Manage child{" "}
        <code className="text-xs">subjects</code> below.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        CRUD subjects; link to{" "}
        <code className="text-xs">.../subjects/[subjectId]</code>.
      </div>
    </div>
  );
}
