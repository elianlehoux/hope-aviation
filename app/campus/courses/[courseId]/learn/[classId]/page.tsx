import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { notFound } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseLearningData } from "@/actions/courses";
import { LearningViewClient } from "@/components/features/campus/learning/LearningViewClient";

/**
 * Main viewing page for a specific class in a course.
 */
export default async function LearnClassPage({
  params
}: {
  params: Promise<{ courseId: string; classId: string }>
}) {
  const { courseId: rawCourseId, classId: rawClassId } = await params;
  const courseId = parseUuidParam(rawCourseId);
  const classId = parseUuidParam(rawClassId);
  
  if (!courseId || !classId) return notFound();

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  // 1. Fetch all data for this learning session
  const course = await getCourseLearningData(courseId);
  
  if (!course) return notFound();

  // 2. Validate enrollment (must be active)
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("status")
    .eq("user_id", session.user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment || enrollment.status !== "active") {
    // Student not enrolled or enrollment inactive
    return notFound();
  }

  // 3. Find the active class in the subjects
  let activeClass = null;
  const flatClasses: any[] = [];
  
  course.subjects?.forEach((subject: any) => {
    subject.classes?.forEach((cls: any) => {
      flatClasses.push(cls);
      if (cls.id === classId) {
        activeClass = cls;
      }
    });
  });

  if (!activeClass) return notFound();

  return (
    <LearningViewClient 
       course={course}
       activeClass={activeClass}
       flatClasses={flatClasses}
    />
  );
}
