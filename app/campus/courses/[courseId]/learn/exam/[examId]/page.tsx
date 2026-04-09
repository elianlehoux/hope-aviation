import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getCourseLearningData } from "@/actions/courses";
import { ExamViewClient } from "@/components/features/campus/learning/ExamViewClient";

interface ExamPageProps {
  params: Promise<{ courseId: string; examId: string }>;
}

/**
 * Server component for the exam taking page.
 * Includes module-lock gating: if the exam belongs to a locked module,
 * the student is redirected to the first class of the first unlocked module.
 */
export default async function ExamPage({ params }: ExamPageProps) {
  const { courseId: rawCourseId, examId: rawExamId } = await params;
  const courseId = parseUuidParam(rawCourseId);
  const examId = parseUuidParam(rawExamId);

  if (!courseId || !examId) return notFound();

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  // 1. Fetch full course learning data (includes exams and attempts)
  const course = await getCourseLearningData(courseId);
  if (!course) return notFound();

  // 2. Validate enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("status")
    .eq("user_id", session.user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment || (enrollment.status !== "active" && enrollment.status !== "completed")) {
    return notFound();
  }

  // 3. Find the specific exam and determine which module it belongs to
  let activeExam: any = null;
  let activeSubjectIndex = -1;
  course.subjects?.forEach((subject: any, sIdx: number) => {
    const found = subject.exams?.find((e: any) => e.id === examId);
    if (found) {
      activeExam = found;
      activeSubjectIndex = sIdx;
    }
  });

  if (!activeExam) return notFound();

  // 4. Module-lock check: if active module index > 0, verify previous module's exam is passed
  if (activeSubjectIndex > 0) {
    const prevSubject = course.subjects[activeSubjectIndex - 1];
    const prevExamPassed = !prevSubject.exams?.length || 
      prevSubject.exams.some((e: any) => e.exam_attempts?.some((a: any) => a.passed));

    if (!prevExamPassed) {
      const firstClass = course.subjects[0]?.classes?.[0];
      if (firstClass) {
        redirect(`/campus/courses/${courseId}/learn/${firstClass.id}`);
      }
      return notFound();
    }
  }

  // 5. Fetch the actual exam paper (questions + options)
  const { data: questionsRaw, error: qErr } = await supabase
    .from("questions")
    .select("id, exam_id, content, points, order_index, options(id, question_id, content)")
    .eq("exam_id", examId);

  if (qErr) {
    console.error("Error fetching exam paper:", qErr);
    return notFound();
  }

  // Sort questions and options
  const questions = (questionsRaw ?? []).sort((a: any, b: any) => {
    const ai = a.order_index ?? Number.MAX_SAFE_INTEGER;
    const bi = b.order_index ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return a.id.localeCompare(b.id);
  }).map((q: any) => ({
    ...q,
    options: (q.options ?? []).sort((a: any, b: any) => a.id.localeCompare(b.id)),
  }));

  // Create a flat list of ALL navigable items (classes + exams) for the sidebar navigation
  const flatItems: any[] = [];
  course.subjects?.forEach((subject: any) => {
    // Add classes
    subject.classes?.forEach((cls: any) => {
      flatItems.push({ ...cls, itemType: "class" });
    });
    // Add exams
    subject.exams?.forEach((exam: any) => {
      flatItems.push({ ...exam, itemType: "exam" });
    });
  });

  return (
    <ExamViewClient
      course={course}
      exam={activeExam}
      questions={questions}
      flatItems={flatItems}
      enrollmentStatus={enrollment.status}
    />
  );
}
