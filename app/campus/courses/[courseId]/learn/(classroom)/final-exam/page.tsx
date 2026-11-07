import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseOutline } from "@/lib/campus/learning";
import { classroomTitle } from "@/lib/campus/page-titles";
import { FinalExamScreen } from "../../_views/exam-screens";

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }) {
  return classroomTitle((await params).courseId, "final-exam");
}

/** Course final exam; unlocked once every module is passed. */
export default async function FinalExamPage({ params }: { params: Promise<{ courseId: string }> }) {
  const courseId = parseUuidParam((await params).courseId);
  if (!courseId) notFound();

  const outline = await getCourseOutline(courseId);
  if (!outline) redirect(`/campus/courses/${courseId}`);

  return <FinalExamScreen outline={outline} preview={false} />;
}
