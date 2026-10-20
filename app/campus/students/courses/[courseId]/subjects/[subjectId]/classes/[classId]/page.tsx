import { redirect } from "next/navigation";

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ courseId: string; classId: string }>;
}) {
  const { courseId, classId } = await params;
  redirect(`/campus/courses/${courseId}/learn/${classId}`);
}
