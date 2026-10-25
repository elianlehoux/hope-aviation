import { notFound, redirect } from "next/navigation";
import {
  completesCourse,
  getLearnerUser,
  neighbours,
  resumeItem,
  type CourseOutline,
} from "@/lib/campus/learning";
import { LessonView } from "@/components/features/campus/learn/LessonView";
import type { TranslatedText } from "@/types/database";

/** One lesson inside the classroom (learner, or staff preview without completion controls). */
export async function LessonScreen({
  outline,
  classId,
  preview,
}: {
  outline: CourseOutline;
  classId: string;
  preview: boolean;
}) {
  const { item, previous, next } = neighbours(outline, classId);
  if (!item || item.kind !== "class") notFound();
  if (item.locked) redirect(resumeItem(outline)?.href ?? `/campus/courses/${outline.courseId}`);

  const { supabase } = await getLearnerUser();
  const { data: lesson } = await supabase
    .from("classes")
    .select("id, title, description, video_url, resource_url, duration_minutes, content")
    .eq("id", classId)
    .maybeSingle();
  if (!lesson) notFound();

  const lessonModule = outline.modules[item.moduleIndex];
  const link = (i: typeof next) => (i ? { href: i.href, title: i.title, locked: i.locked, kind: i.kind } : null);

  return (
    <LessonView
      courseId={outline.courseId}
      lesson={{
        id: lesson.id,
        title: lesson.title as TranslatedText,
        description: lesson.description as TranslatedText | null,
        videoUrl: lesson.video_url,
        resourceUrl: lesson.resource_url,
        durationMinutes: lesson.duration_minutes,
        content: lesson.content as TranslatedText | null,
      }}
      module={{ index: lessonModule.index, title: lessonModule.title }}
      completed={item.completed}
      previous={link(previous)}
      next={link(next)}
      completesCourse={!preview && completesCourse(outline, classId)}
      canComplete={!preview && outline.canComplete}
      preview={preview}
    />
  );
}
