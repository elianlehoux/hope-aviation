import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseLearningData } from "@/actions/courses";
import { LearningViewClient } from "@/components/features/campus/learning/LearningViewClient";

/**
 * Main viewing page for a specific class in a course.
 * Includes module-lock gating: if the class belongs to a locked module,
 * the student is redirected to the first class of the first unlocked module.
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
  if (!session.ok) redirect("/");

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

  if (!enrollment || (enrollment.status !== "active" && enrollment.status !== "completed")) {
    return notFound();
  }

  // 3. Find the active class and build a flat list of ALL navigable items (classes + exams)
  let activeClass = null;
  let activeSubjectIndex = -1;
  const flatItems: any[] = [];
  
  course.subjects?.forEach((subject: any, sIdx: number) => {
    // 3.1. Add classes
    subject.classes?.forEach((cls: any) => {
      const item = { ...cls, itemType: "class" };
      flatItems.push(item);
      if (cls.id === classId) {
        activeClass = item;
        activeSubjectIndex = sIdx;
      }
    });

    // 3.2. Add exams
    subject.exams?.forEach((exam: any) => {
      flatItems.push({ ...exam, itemType: "exam" });
    });
  });

  if (!activeClass) return notFound();

  // 4. Module-lock check: if active module index > 0, verify previous module's exam is passed
  if (activeSubjectIndex > 0) {
    const prevSubject = course.subjects[activeSubjectIndex - 1];
    const prevExamPassed = !prevSubject.exams?.length ||
      prevSubject.exams.every((e: any) => e.exam_attempts?.some((a: any) => a.passed));

    if (!prevExamPassed) {
      // Redirect to the first class of the first unlocked module
      const firstClass = course.subjects[0]?.classes?.[0];
      if (firstClass) {
        redirect(`/campus/courses/${courseId}/learn/${firstClass.id}`);
      }
      return notFound();
    }
  }

  return (
    <LearningViewClient 
       course={course}
       activeClass={activeClass}
       flatItems={flatItems}
       enrollmentStatus={enrollment.status}
    />
  );
}
