import { Suspense } from "react";
import { notFound } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseTree } from "@/lib/campus/manage";
import { publishChecklist } from "@/lib/campus/publish-checklist";
import { CourseEditorHeader } from "@/components/features/manage/course/CourseEditorHeader";

/**
 * Course editor shell (Contenido · Ajustes · Alumnos). The lesson text editor and the
 * exam editor live outside this route group so they render without the tab header.
 */
export default function CourseEditorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  return (
    <div className="mx-auto max-w-7xl pb-16">
      <Suspense fallback={<HeaderSkeleton />}>
        <Header params={params} />
      </Suspense>
      <div className="mt-6 md:mt-8">{children}</div>
    </div>
  );
}

async function Header({ params }: { params: Promise<{ courseId: string }> }) {
  const courseId = parseUuidParam((await params).courseId);
  if (!courseId) notFound();
  const tree = await getCourseTree(courseId);
  if (!tree) notFound();
  return (
    <CourseEditorHeader
      courseId={courseId}
      title={tree.course.title}
      status={tree.course.status}
      issues={publishChecklist(tree, tree.course.final_exam_question_count)}
    />
  );
}

function HeaderSkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      <div className="h-4 w-20 animate-pulse rounded bg-primary/5" />
      <div className="space-y-2">
        <div className="h-5 w-24 animate-pulse rounded-full bg-primary/5" />
        <div className="h-10 w-2/3 animate-pulse rounded-lg bg-primary/5" />
      </div>
      <div className="h-11 border-b border-primary/10" />
    </div>
  );
}
