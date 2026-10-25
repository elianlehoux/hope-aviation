import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getPreviewOutline } from "@/lib/campus/learning";
import { FinalExamScreen } from "../../_views/exam-screens";

export default async function PreviewFinalExamPage({ params }: { params: Promise<{ courseId: string }> }) {
  const courseId = parseUuidParam((await params).courseId);
  if (!courseId) notFound();

  const outline = await getPreviewOutline(courseId);
  if (!outline) redirect(`/campus/courses/${courseId}`);

  return <FinalExamScreen outline={outline} preview />;
}
