"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 sm:px-8 lg:pt-12">
      {state === "idle" && (
        <ExamPreFlight exam={{ ...pseudoExamConfig, max_attempts: 9999 }} questionCount={questionCount} onStart={handleStartExam} />
      )}
      {state === "active" && examData && (
        <ExamQuestionView
          exam={pseudoExamConfig}
          questions={questions}
          onFinish={handleFinishExam}
          submitUrl={`/api/courses/${course.id}/final-exam/submit`}
        />
      )}
      {state === "finished" && (
        <ExamResults exam={pseudoExamConfig} lastAttempt={lastAttempt} onRetry={handleRestart} isFinalExam />
      )}
    </div>
  );
}
