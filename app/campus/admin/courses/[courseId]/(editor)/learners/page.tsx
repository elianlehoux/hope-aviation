import { Suspense } from "react";
import { notFound } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { listCourseLearners, requireStaff } from "@/lib/campus/manage";
import { LearnerTable } from "@/components/features/manage/course/LearnerTable";

export const metadata = { title: "Alumnos del curso" };

/** Alumnos tab: enrolled learners with progress and last exam. */
export default function CourseLearnersPage({ params }: { params: Promise<{ courseId: string }> }) {
  return (
    <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-primary/5" aria-hidden />}>
      <Learners params={params} />
    </Suspense>
  );
}

async function Learners({ params }: { params: Promise<{ courseId: string }> }) {
  const courseId = parseUuidParam((await params).courseId);
  if (!courseId) notFound();
  const [{ isAdmin }, learners] = await Promise.all([requireStaff(), listCourseLearners(courseId)]);
  return <LearnerTable courseId={courseId} learners={learners} isAdmin={isAdmin} />;
}
