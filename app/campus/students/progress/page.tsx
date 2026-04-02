import { apiRoutes } from "@/lib/api/app-routes";

/**
 * Course-scoped progress is aggregated on the backend (one round-trip per course).
 */
export default function StudentProgressPage() {
  const exampleCourseId = ":courseId";
  const aggregate = apiRoutes.courseProgress(exampleCourseId);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Replace <code className="text-xs">{exampleCourseId}</code> with a real course id (e.g. from
        the URL on <code className="text-xs">/campus/students/courses/[courseId]</code>).
      </p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        <strong className="text-foreground">GET</strong>{" "}
        <code className="text-xs break-all">{aggregate}</code> — response includes{" "}
        <code className="text-xs">classes[]</code> with <code className="text-xs">is_completed</code>
        , <code className="text-xs">completed_count</code>,{" "}
        <code className="text-xs">total_classes</code>. Per-class updates still use{" "}
        <code className="text-xs break-all">
          {apiRoutes.classProgress("[courseId]", "[subjectId]", "[classId]")}
        </code>
        .
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Prefer embedding this view under a course route so <code className="text-xs">courseId</code>{" "}
        is always in scope.
      </div>
    </div>
  );
}
