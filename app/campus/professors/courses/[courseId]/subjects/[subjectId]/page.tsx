type Props = {
  params: Promise<{ courseId: string; subjectId: string }>;
};

/**
 * Instructor subject editor — classes list.
 */
export default async function ProfessorSubjectPage({ params }: Props) {
  const { courseId, subjectId } = await params;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Edit subject</h1>
      <p className="font-mono text-xs text-muted-foreground">
        course_id: {courseId} · subject_id: {subjectId}
      </p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Maintain <code className="text-xs">subjects</code> JSONB fields and{" "}
        <code className="text-xs">order_index</code>. List/edit{" "}
        <code className="text-xs">classes</code> for this subject.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Reorder classes; open <code className="text-xs">.../classes/[classId]</code>.
      </div>
    </div>
  );
}
