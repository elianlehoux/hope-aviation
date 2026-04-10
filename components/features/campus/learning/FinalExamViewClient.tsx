"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LearnSidebar } from "@/components/features/campus/learning/LearnSidebar";
import { ExamPreFlight } from "@/components/features/campus/learning/ExamPreFlight";
import { ExamQuestionView } from "@/components/features/campus/learning/ExamQuestionView";
import { ExamResults } from "@/components/features/campus/learning/ExamResults";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";

interface FinalExamViewClientProps {
  course: any;
  flatItems: any[];
  enrollmentStatus: string;
}

type ExamState = "idle" | "active" | "finished";

export function FinalExamViewClient({
  course,
  flatItems,
  enrollmentStatus,
}: FinalExamViewClientProps) {
  const router = useRouter();
  const { t } = useTranslation();
  
  // If the user already passed, they can see the finished state directly.
  const [state, setState] = useState<ExamState>(
    enrollmentStatus === "completed" ? "finished" : "idle"
  );
  
  // Mock lastAttempt just for the UI so ExamResults can show Passed if already completed.
  const [lastAttempt, setLastAttempt] = useState<any>(
    enrollmentStatus === "completed" ? { score: course.final_exam_passing_score, passed: true } : null
  );

  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  // Calculate overall progress including exams
  const totalItems = flatItems.length;
  // Final exam adds 1 item to the progress denominator if it exists, let's include it.
  const hasFinalExam = (course.final_exam_question_count ?? 0) > 0;
  const progressTotalItems = totalItems + (hasFinalExam ? 1 : 0);

  const completedLessons = flatItems.filter(item => item.itemType === 'class' && item.lesson_progress?.[0]?.is_completed).length;
  const passedExams = flatItems.filter(item => item.itemType === 'exam' && item.exam_attempts?.some((a: any) => a.passed)).length;
  
  // If completed, then final exam is passed.
  const passedFinal = enrollmentStatus === "completed" ? 1 : 0;
  
  const progressPercentage = progressTotalItems > 0 ? ((completedLessons + passedExams + passedFinal) / progressTotalItems) * 100 : 0;

  // For final exam, previous item is the last item in the course. Next item is nothing (since it's final).
  const previousItem = flatItems[flatItems.length - 1];

  const handlePrevious = () => {
    if (previousItem) {
      const route = previousItem.itemType === "exam"
        ? `/campus/courses/${course.id}/learn/exam/${previousItem.id}`
        : `/campus/courses/${course.id}/learn/${previousItem.id}`;
      router.push(route);
    }
  };

  const handleStartExam = async () => {
    try {
      const res = await fetch(`/api/courses/${course.id}/final-exam/generate`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to generate exam");

      setExamData(data.data.exam);
      setQuestions(data.data.questions);
      setState("active");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleFinishExam = (attemptData: any) => {
    setLastAttempt(attemptData);
    setState("finished");

    if (attemptData?.passed) {
      router.refresh();
      toast.success(t("examResults.courseCompletedToast"));
    }
  };

  const handleRestart = () => {
    setState("idle");
    setLastAttempt(null);
    setExamData(null);
    setQuestions([]);
  };

  // Create a pseudo-exam object for ExamPreFlight based on course config
  const pseudoExamConfig = examData || {
    title: { en: "Final Test", es: "Examen Final" },
    description: { en: "This exam covers all modules.", es: "Este examen cubre todos los módulos." },
    passing_score: course.final_exam_passing_score,
    time_limit_minutes: course.final_exam_time_limit_minutes,
    max_attempts: 9999, // unlimited for UI
    exam_attempts: enrollmentStatus === "completed" ? [{ passed: true }] : []
  };

  const questionCount = examData?.question_count || course.final_exam_question_count;

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-8 min-h-[600px] flex flex-col">
          {state === "idle" && (
            <ExamPreFlight 
              exam={{...pseudoExamConfig, max_attempts: 9999}} // Overriding so it shows attempts info differently if we want, but currently it just shows large number
              questionCount={questionCount} 
              onStart={handleStartExam} 
            />
          )}
          
          {state === "active" && examData && (
            <ExamQuestionView 
              // We pass pseudoExamConfig for context (time limit etc), but questions handles the render
              exam={pseudoExamConfig}
              questions={questions} 
              onFinish={handleFinishExam} 
              submitUrl={`/api/courses/${course.id}/final-exam/submit`}
            />
          )}

          {state === "finished" && (
            <ExamResults 
              exam={pseudoExamConfig} 
              lastAttempt={lastAttempt} 
              onRetry={handleRestart} 
              isFinalExam={true} // new prop to handle "Course Completed" instead of "Next Module"
            />
          )}
        </div>

        {/* Sidebar Area */}
        <aside className="xl:col-span-4 self-start sticky top-28 h-[calc(100vh-8rem)] min-h-[500px]">
          <div className="h-full rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden">
            <LearnSidebar
              courseId={course.id}
              subjects={course.subjects}
              activeItemId="final-exam" // specific string
              activeType="exam"
              progressPercentage={progressPercentage}
              onPrevious={handlePrevious}
              onNext={() => {}} // Can't go next from final exam unless we want to redirect to dashboard
              hasPrevious={!!previousItem}
              hasNext={false}
              enrollmentStatus={enrollmentStatus} // pass enrollment status down
              finalExamConfig={{
                enabled: (course.final_exam_question_count ?? 0) > 0
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
