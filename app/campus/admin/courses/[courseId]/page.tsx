type Props = { params: Promise<{ courseId: string }> };

/**
 * Admin course detail — structure and metadata.
 */
export default async function AdminCourseDetailPage({ params }: Props) {
  const { courseId } = await params;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Course (admin)</h1>
      <p className="font-mono text-xs text-muted-foreground">course_id: {courseId}</p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Same entities as professor flow, without ownership filter. Optionally embed subject/class
        trees or deep-link to mirrored paths under{" "}
        <code className="text-xs">/campus/professors/...</code> for shared editors.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Subject list + audit fields (<code className="text-xs">created_at</code>,{" "}
        <code className="text-xs">updated_at</code>) here.
      </div>
    </div>
  );
}
