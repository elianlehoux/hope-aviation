import { redirect } from "next/navigation";

export default async function StudentsCourseRedirect({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  redirect(`/campus/courses/${courseId}`);
}
