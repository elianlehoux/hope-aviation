import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseOutline, resumeItem } from "@/lib/campus/learning";

/** Entry point: continue where the learner left off. */
export default async function LearnIndexPage({ params }: { params: Promise<{ courseId: string }> }) {
  const courseId = parseUuidParam((await params).courseId);
  if (!courseId) notFound();

  const outline = await getCourseOutline(courseId);
  if (!outline) redirect(`/campus/courses/${courseId}`);

  const item = resumeItem(outline);
  if (!item) redirect(`/campus/courses/${courseId}`);
  redirect(item.href);
}
