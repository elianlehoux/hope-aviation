import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseOutline } from "@/lib/campus/learning";
import { ModuleExamScreen } from "../../../_views/exam-screens";

/** Module exam: intro, one question per screen, review and result (see ExamRunner). */
export default async function ExamPage({ params }: { params: Promise<{ courseId: string; examId: string }> }) {
  const { courseId: rawCourseId, examId: rawExamId } = await params;
  const courseId = parseUuidParam(rawCourseId);
  const examId = parseUuidParam(rawExamId);
  if (!courseId || !examId) notFound();

  const outline = await getCourseOutline(courseId);
  if (!outline) redirect(`/campus/courses/${courseId}`);

  return <ModuleExamScreen outline={outline} examId={examId} preview={false} />;
}
