import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getPreviewOutline } from "@/lib/campus/learning";

/** Preview entry: open the first item of the course. */
export default async function PreviewIndexPage({ params }: { params: Promise<{ courseId: string }> }) {
  const courseId = parseUuidParam((await params).courseId);
  if (!courseId) notFound();

  const outline = await getPreviewOutline(courseId);
  if (!outline) redirect(`/campus/courses/${courseId}`);

  const first = outline.items[0];
  if (!first) redirect(`/campus/admin/courses/${courseId}`);
  redirect(first.href);
}
