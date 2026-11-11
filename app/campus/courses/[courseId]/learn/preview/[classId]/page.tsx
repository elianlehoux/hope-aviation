import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getPreviewOutline } from "@/lib/campus/learning";
import { LessonScreen } from "../../_views/lesson-screen";

export default async function PreviewLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; classId: string }>;
}) {
  const { courseId: rawCourseId, classId: rawClassId } = await params;
  const courseId = parseUuidParam(rawCourseId);
  const classId = parseUuidParam(rawClassId);
  if (!courseId || !classId) notFound();

  const outline = await getPreviewOutline(courseId);
  if (!outline) redirect(`/campus/courses/${courseId}`);

  return <LessonScreen outline={outline} classId={classId} preview />;
}
