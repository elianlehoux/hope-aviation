import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseOutline } from "@/lib/campus/learning";
import { classroomTitle } from "@/lib/campus/page-titles";
import { LessonScreen } from "../../_views/lesson-screen";

export async function generateMetadata({ params }: { params: Promise<{ courseId: string; classId: string }> }) {
  const { courseId, classId } = await params;
  return classroomTitle(courseId, classId);
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; classId: string }>;
}) {
  const { courseId: rawCourseId, classId: rawClassId } = await params;
  const courseId = parseUuidParam(rawCourseId);
  const classId = parseUuidParam(rawClassId);
  if (!courseId || !classId) notFound();

  const outline = await getCourseOutline(courseId);
  if (!outline) redirect(`/campus/courses/${courseId}`);

  return <LessonScreen outline={outline} classId={classId} preview={false} />;
}
