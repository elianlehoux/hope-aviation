import { Suspense } from "react";
import { notFound } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseTree } from "@/lib/campus/manage";
import { CourseContentEditor } from "@/components/features/manage/course/CourseContentEditor";

export const metadata = { title: "Editor de curso" };

/** Contenido tab: course outline and the selected item's panel. */
export default function CourseContentPage({ params }: { params: Promise<{ courseId: string }> }) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ courseId: string }> }) {
  const courseId = parseUuidParam((await params).courseId);
  if (!courseId) notFound();
  const tree = await getCourseTree(courseId);
  if (!tree) notFound();
  return <CourseContentEditor tree={tree} />;
}

function ContentSkeleton() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]" aria-hidden>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-primary/5" />
        ))}
      </div>
      <div className="hidden h-96 animate-pulse rounded-2xl bg-primary/5 lg:block" />
    </div>
  );
}
