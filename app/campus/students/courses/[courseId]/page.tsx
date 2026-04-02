import { apiRoutes } from "@/lib/api/app-routes";

type Props = { params: Promise<{ courseId: string }> };

/**
 * Course detail for a learner — subjects list and enrollment status.
 */
export default async function StudentCourseDetailPage({ params }: Props) {
  const { courseId } = await params;
  const progress = apiRoutes.courseProgress(courseId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Course</h1>
      <p className="font-mono text-xs text-muted-foreground">course_id: {courseId}</p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Load <code className="text-xs">courses</code> by id, verify an{" "}
        <code className="text-xs">enrollments</code> row exists for this user, then list{" "}
        <code className="text-xs">subjects</code> ordered by{" "}
        <code className="text-xs">order_index</code>.
      </p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Aggregated progress: <code className="text-xs break-all">{progress}</code>.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Link each subject to{" "}
        <code className="text-xs">
          /campus/students/courses/[courseId]/subjects/[subjectId]
        </code>
        .
      </div>
    </div>
  );
}
