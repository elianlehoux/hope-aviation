import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseOutline, getLearnerUser } from "@/lib/campus/learning";
import { ClassroomFrame } from "@/components/features/campus/learn/ClassroomFrame";

/**
 * Classroom shell for a course. Loads the outline once (enrollment + progress) and keeps
 * it mounted while the learner moves between lessons and exams.
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

function ClassroomSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-paper">
      <div className="h-14 border-b border-primary/10" />
      <div className="mx-auto max-w-[46rem] space-y-4 px-5 pt-12">
        <div className="h-4 w-40 animate-pulse rounded bg-primary/10" />
        <div className="h-10 w-3/4 animate-pulse rounded-lg bg-primary/10" />
        <div className="h-64 animate-pulse rounded-2xl bg-primary/5" />
      </div>
    </div>
  );
}
