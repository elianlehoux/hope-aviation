import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseOutline, getLearnerUser, neighbours, resumeItem } from "@/lib/campus/learning";
import { LessonView } from "@/components/features/campus/learn/LessonView";
import type { TranslatedText } from "@/types/database";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; classId: string }>;
}) {
  const { courseId: rawCourseId, classId: rawClassId } = await params;
  const courseId = parseUuidParam(rawCourseId);
  const classId = parseUuidParam(rawClassId);
  if (!courseId || !classId) notFound();

  const outline = await getCourseOutline(courseId);
  if (!outline) redirect(`/campus/courses/${courseId}`);

  const { item, previous, next } = neighbours(outline, classId);
  if (!item || item.kind !== "class") notFound();
  if (item.locked) redirect(resumeItem(outline)?.href ?? `/campus/courses/${courseId}`);

  const { supabase } = await getLearnerUser();
  const { data: lesson } = await supabase
    .from("classes")
    .select("id, title, description, video_url, resource_url, duration_minutes, content")
    .eq("id", classId)
    .maybeSingle();
  if (!lesson) notFound();

  const module = outline.modules[item.moduleIndex];
  const link = (i: typeof next) =>
    i ? { href: i.href, title: i.title, locked: i.locked, kind: i.kind } : null;

  return (
    <LessonView
      courseId={courseId}
      lesson={{
        id: lesson.id,
        title: lesson.title as TranslatedText,
        description: lesson.description as TranslatedText | null,
        videoUrl: lesson.video_url,
        resourceUrl: lesson.resource_url,
        durationMinutes: lesson.duration_minutes,
        content: lesson.content as TranslatedText | null,
      }}
      module={{ index: module.index, title: module.title }}
      completed={item.completed}
      previous={link(previous)}
      next={link(next)}
    />
  );
}
