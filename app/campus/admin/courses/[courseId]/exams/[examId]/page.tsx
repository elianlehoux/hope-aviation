import { Suspense } from "react";
import { notFound } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getExamEditor } from "@/lib/campus/manage";
import { ExamEditor } from "@/components/features/manage/exam/ExamEditor";

export const metadata = { title: "Editor de examen" };

type Params = Promise<{ courseId: string; examId: string }>;

/** Exam editor (outside the course editor's tab layout). */
export default function ExamEditorPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ExamSkeleton />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: Params }) {
  const raw = await params;
  const courseId = parseUuidParam(raw.courseId);
  const examId = parseUuidParam(raw.examId);
  if (!courseId || !examId) notFound();
  const data = await getExamEditor(courseId, examId);
  if (!data) notFound();
  return <ExamEditor data={data} />;
}

function ExamSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8" aria-hidden>
      <div className="space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-primary/5" />
        <div className="h-10 w-2/3 animate-pulse rounded-lg bg-primary/5" />
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-primary/5" />
      <div className="h-48 animate-pulse rounded-2xl bg-primary/5" />
    </div>
  );
}
