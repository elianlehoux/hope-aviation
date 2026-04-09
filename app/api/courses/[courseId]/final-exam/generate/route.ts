import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { courseId: rawCourseId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;
  const userId = session.user.id;

  // Fetch course settings
  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("final_exam_question_count, final_exam_passing_score, final_exam_time_limit_minutes, title, description")
    .eq("id", courseId)
    .maybeSingle();

  if (courseErr) return responseFromPostgrestError(courseErr);
  if (!course) return jsonError("not_found", "Course not found.", 404);

  const targetCount = course.final_exam_question_count;
  if (!targetCount || targetCount <= 0) {
    return jsonError("validation_error", "This course does not have a final exam.", 400);
  }

  // Fetch enrollment
  const { data: enrollment, error: enrollmentErr } = await supabase
    .from("enrollments")
    .select("status")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (enrollmentErr) return responseFromPostgrestError(enrollmentErr);
  if (!enrollment || (enrollment.status !== "active" && enrollment.status !== "completed")) {
    return jsonError("unauthorized", "Not enrolled in this course.", 403);
  }

  // Fetch exams for the course to check if passed and to get question pool
  const { data: exams, error: examsErr } = await supabase
    .from("exams")
    .select("id, subject_id, exam_attempts(passed)")
    .eq("course_id", courseId);

  if (examsErr) return responseFromPostgrestError(examsErr);

  // Check if all module exams are passed
  for (const exam of (exams ?? [])) {
    const passed = exam.exam_attempts?.some((a: any) => a.passed);
    if (!passed) {
      return jsonError("unauthorized", "All module exams must be passed first.", 403);
    }
  }

  const examIds = (exams ?? []).map(e => e.id);
  if (examIds.length === 0) {
    return jsonError("validation_error", "No module exams found to pull questions from.", 400);
  }

  // Fetch questions and options
  const { data: questionsRaw, error: qErr } = await supabase
    .from("questions")
    .select("id, exam_id, content, points, options(id, question_id, content)")
    .in("exam_id", examIds);

  if (qErr) return responseFromPostgrestError(qErr);

  const questions = questionsRaw ?? [];

  // Group questions by exam (or subject)
  const byExam: Record<string, any[]> = {};
  for (const q of questions) {
    if (!byExam[q.exam_id]) byExam[q.exam_id] = [];
    byExam[q.exam_id].push(q);
  }

  const examIdsWithQuestions = Object.keys(byExam);
  const examCount = examIdsWithQuestions.length;
  
  if (examCount === 0 || questions.length === 0) {
     return jsonError("validation_error", "No questions available to generate exam.", 400);
  }

  // Distribution logic: take an equal amount from each module if possible
  const selectedQuestions: any[] = [];
  const baseQuota = Math.floor(targetCount / examCount);
  let remainder = targetCount % examCount;
  
  // Shuffle exams to distribute remainder randomly
  const shuffledExamIds = [...examIdsWithQuestions].sort(() => Math.random() - 0.5);

  for (const eId of shuffledExamIds) {
    const qList = [...byExam[eId]].sort(() => Math.random() - 0.5);
    let quota = baseQuota + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;

    // If this exam has fewer questions than quota, we take what we can and don't re-distribute 
    // for simplicity, or we could distribute to others. Let's just take Math.min.
    // If we want exact targetCount, we might fall short if modules don't have enough questions.
    // A robust way: put all needed quotas in a list. If one is short, spread its missing quota to others.
    
    const toTake = Math.min(quota, qList.length);
    selectedQuestions.push(...qList.slice(0, toTake));
  }

  // If we fell short (because some modules had fewer questions than their quota), 
  // we can backfill from remaining unused questions across all modules.
  if (selectedQuestions.length < targetCount) {
    const usedIds = new Set(selectedQuestions.map(q => q.id));
    const remainingQuestions = questions.filter(q => !usedIds.has(q.id)).sort(() => Math.random() - 0.5);
    const deficit = targetCount - selectedQuestions.length;
    selectedQuestions.push(...remainingQuestions.slice(0, deficit));
  }

  // Shuffle final list
  selectedQuestions.sort(() => Math.random() - 0.5);

  // Return the paper format
  return jsonOk({
    exam: {
      title: { en: "Final Examination", es: "Examen Final" },
      description: { en: "This exam covers all modules.", es: "Este examen cubre todos los módulos." },
      passing_score: course.final_exam_passing_score,
      time_limit_minutes: course.final_exam_time_limit_minutes,
      question_count: targetCount
    },
    questions: selectedQuestions.map(q => {
       // Optional: we can strip points or let them all be weighted equally for the final exam.
       // Let's keep original points.
       // Options are shuffled.
       return {
         ...q,
         options: (q.options ?? []).sort(() => Math.random() - 0.5)
       };
    }),
  });
}
