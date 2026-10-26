import { Suspense } from "react";
import { notFound } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseTree } from "@/lib/campus/manage";
import { CourseSettingsForm } from "@/components/features/manage/course/CourseSettingsForm";

export const metadata = { title: "Ajustes del curso — Hope Aviation" };

/** Ajustes tab: title, description, cover and final exam. */
export default function CourseSettingsPage({ params }: { params: Promise<{ courseId: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-4xl animate-pulse rounded-2xl bg-primary/5" aria-hidden />}>
      <Settings params={params} />
    </Suspense>
  );
}

async function Settings({ params }: { params: Promise<{ courseId: string }> }) {
  const courseId = parseUuidParam((await params).courseId);
  if (!courseId) notFound();
  const tree = await getCourseTree(courseId);
  if (!tree) notFound();
  const { total_questions_count, ...course } = tree.course;
  return (
    <CourseSettingsForm
      key={course.updated_at ?? course.created_at}
      course={course}
      availableQuestions={total_questions_count}
    />
  );
}
