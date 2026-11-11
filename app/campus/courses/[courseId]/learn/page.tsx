import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseOutline, resumeItem } from "@/lib/campus/learning";

/**
 * Entry point: continue where the learner left off. `?preview=1` (staff, from the course
 * editor) opens the read-only preview classroom under `/learn/preview`.
 */
export default async function LearnIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ preview?: string | string[] }>;
}) {
  const courseId = parseUuidParam((await params).courseId);
  if (!courseId) notFound();

  if ((await searchParams).preview === "1") redirect(`/campus/courses/${courseId}/learn/preview`);

  const outline = await getCourseOutline(courseId);
  if (!outline) redirect(`/campus/courses/${courseId}`);

  const item = resumeItem(outline);
  if (!item) redirect(`/campus/courses/${courseId}`);
  redirect(item.href);
}
