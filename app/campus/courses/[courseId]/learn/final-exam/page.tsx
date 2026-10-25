import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseOutline } from "@/lib/campus/learning";
import { FinalExamScreen } from "../_views/exam-screens";

/** Course final exam; unlocked once every module is passed. */
export default async function FinalExamPage({ params }: { params: Promise<{ courseId: string }> }) {
  const courseId = parseUuidParam((await params).courseId);
  if (!courseId) notFound();

  const outline = await getCourseOutline(courseId);
  if (!outline) redirect(`/campus/courses/${courseId}`);

  return <FinalExamScreen outline={outline} preview={false} />;
}
