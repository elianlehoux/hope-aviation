import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseOutline, getLearnerUser } from "@/lib/campus/learning";
import { ClassroomFrame } from "@/components/features/campus/learn/ClassroomFrame";
import { ClassroomSkeleton } from "../_views/classroom-skeleton";

/**
 * Classroom shell for a course. Loads the outline once (enrollment + progress) and keeps
 * it mounted while the learner moves between lessons and exams.
 *
 * Route layout: `(classroom)` holds the learner pages; the staff preview lives in the
 * sibling `preview/` segment with its own layout (layouts cannot read searchParams, so
 * `/learn?preview=1` redirects there from `learn/page.tsx`).
 */
export default function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  return (
    <Suspense fallback={<ClassroomSkeleton />}>
      <Classroom params={params}>{children}</Classroom>
    </Suspense>
  );
}

async function Classroom({
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

  const outline = await getCourseOutline(courseId);
  if (!outline) redirect(`/campus/courses/${courseId}`);

  return <ClassroomFrame outline={outline}>{children}</ClassroomFrame>;
}
