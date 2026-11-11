import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getPreviewOutline } from "@/lib/campus/learning";
import { ModuleExamScreen } from "../../../_views/exam-screens";

export default async function PreviewExamPage({
  params,
}: {
  params: Promise<{ courseId: string; examId: string }>;
}) {
  const { courseId: rawCourseId, examId: rawExamId } = await params;
  const courseId = parseUuidParam(rawCourseId);
  const examId = parseUuidParam(rawExamId);
  if (!courseId || !examId) notFound();

  const outline = await getPreviewOutline(courseId);
  if (!outline) redirect(`/campus/courses/${courseId}`);

  return <ModuleExamScreen outline={outline} examId={examId} preview />;
}
