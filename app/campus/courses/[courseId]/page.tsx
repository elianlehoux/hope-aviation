import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getLearnerUser } from "@/lib/campus/learning";
import { CourseOverview, type CourseOverviewData } from "@/components/features/campus/courses/CourseOverview";

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const courseId = parseUuidParam((await params).courseId);
  if (!courseId) notFound();

  const { supabase, user } = await getLearnerUser();
  if (!user) redirect("/auth/login?clear=1");

  const [courseRes, enrollmentRes] = await Promise.all([
    supabase
      .from("courses")
      .select(
        `id, title, description, thumbnail_url, final_exam_question_count,
         subjects ( id, title, description, order_index,
           classes ( id, title, duration_minutes, video_url, has_content, order_index ),
           exams ( id, title, order_index ) )`,
      )
      .eq("id", courseId)
      .order("order_index", { referencedTable: "subjects" })
      .order("order_index", { referencedTable: "subjects.classes" })
      .order("order_index", { referencedTable: "subjects.exams" })
      .maybeSingle(),
    supabase.from("enrollments").select("status").eq("user_id", user.id).eq("course_id", courseId).maybeSingle(),
  ]);

  if (!courseRes.data) notFound();

  return (
    <CourseOverview
      course={courseRes.data as unknown as CourseOverviewData}
      enrollmentStatus={(enrollmentRes.data?.status as "active" | "completed" | "cancelled" | undefined) ?? null}
    />
  );
}
