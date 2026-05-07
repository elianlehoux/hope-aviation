import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseLearningData } from "@/actions/courses";
import { FinalExamViewClient } from "@/components/features/campus/learning/FinalExamViewClient";

export default async function FinalExamPage({
  params
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId: rawCourseId } = await params;
  const courseId = parseUuidParam(rawCourseId);
  
  if (!courseId) return notFound();

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) redirect("/");

  // 1. Fetch course data
  const course = await getCourseLearningData(courseId);
  if (!course) return notFound();

  // 2. Ensure final exam is enabled
  if (!course.final_exam_question_count || course.final_exam_question_count <= 0) {
    return notFound();
  }

  // 3. Check enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("status")
    .eq("user_id", session.user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment || (enrollment.status !== "active" && enrollment.status !== "completed")) {
    return notFound();
  }

  // 4. Ensure all module exams are passed before they can access this page
  // (We check this by looking at the exam attempts inside course data)
  const allModulesPassed = (course.subjects ?? []).every((s: any) => {
    if (!s.exams?.length) return true;
    return s.exams.some((e: any) => e.exam_attempts?.some((a: any) => a.passed));
  });

  if (!allModulesPassed) {
    const firstClass = course.subjects?.[0]?.classes?.[0];
    if (firstClass) {
      redirect(`/campus/courses/${courseId}/learn/${firstClass.id}`);
    }
    return notFound();
  }

  // Create flatItems for sidebar progress calculation
  const flatItems: any[] = [];
  course.subjects?.forEach((subject: any) => {
    subject.classes?.forEach((cls: any) => {
      flatItems.push({ ...cls, itemType: "class" });
    });
    subject.exams?.forEach((exam: any) => {
      flatItems.push({ ...exam, itemType: "exam" });
    });
  });

  return (
    <FinalExamViewClient 
       course={course}
       flatItems={flatItems}
       enrollmentStatus={enrollment.status}
    />
  );
}
