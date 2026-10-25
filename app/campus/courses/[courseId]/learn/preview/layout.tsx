import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getLearnerUser, getPreviewOutline } from "@/lib/campus/learning";
import { ClassroomFrame } from "@/components/features/campus/learn/ClassroomFrame";
import { ClassroomSkeleton } from "../_views/classroom-skeleton";

/**
 * Staff preview of the classroom: same screens as the learner, everything unlocked, no
 * progress and nothing recorded. Non-staff are sent to the course page.
 */
export default function PreviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  return (
    <Suspense fallback={<ClassroomSkeleton />}>
      <PreviewClassroom params={params}>{children}</PreviewClassroom>
    </Suspense>
  );
}

async function PreviewClassroom({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const courseId = parseUuidParam((await params).courseId);
  if (!courseId) notFound();

  const { user } = await getLearnerUser();
  if (!user) redirect("/auth/login?clear=1");

  const outline = await getPreviewOutline(courseId);
  if (!outline) redirect(`/campus/courses/${courseId}`);

  return <ClassroomFrame outline={outline}>{children}</ClassroomFrame>;
}
