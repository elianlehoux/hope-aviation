"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LearnSidebar } from "@/components/features/campus/learning/LearnSidebar";
import { ExamPreFlight } from "./ExamPreFlight";
import { ExamQuestionView } from "./ExamQuestionView";
import { ExamResults } from "./ExamResults";

interface ExamViewClientProps {
  course: any;
  exam: any;
  questions: any[];
  flatItems: any[];
  enrollmentStatus?: string;
}

type ExamState = "idle" | "active" | "finished";

export function ExamViewClient({
  course,
  exam,
  questions,
  flatItems,
  enrollmentStatus,
}: ExamViewClientProps) {
  const router = useRouter();
  const [state, setState] = useState<ExamState>("idle");
  const [lastAttempt, setLastAttempt] = useState<any>(null);

  // Calculate overall progress including exams
  const totalItems = flatItems.length;
  const hasFinalExam = (course.final_exam_question_count ?? 0) > 0;
  const progressTotalItems = totalItems + (hasFinalExam ? 1 : 0);

  const completedLessons = flatItems.filter(item => item.itemType === 'class' && item.lesson_progress?.[0]?.is_completed).length;
  const passedExams = flatItems.filter(item => item.itemType === 'exam' && item.exam_attempts?.some((a: any) => a.passed)).length;
  const passedFinal = enrollmentStatus === "completed" ? 1 : 0;
  
  const progressPercentage = progressTotalItems > 0 ? ((completedLessons + passedExams + passedFinal) / progressTotalItems) * 100 : 0;

  const currentIndex = flatItems.findIndex((c) => c?.id === exam.id);
  const previousItem = flatItems[currentIndex - 1];

  let nextItem = flatItems[currentIndex + 1];
  if (!nextItem && hasFinalExam) {
     nextItem = { itemType: "final-exam", id: "final-exam" };
  }
  
  const getRoute = (item: any) => {
    if (!item) return undefined;
    if (item.itemType === "final-exam") return `/campus/courses/${course.id}/learn/final-exam`;
    if (item.itemType === "exam") return `/campus/courses/${course.id}/learn/exam/${item.id}`;
    return `/campus/courses/${course.id}/learn/${item.id}`;
  };

  const nextItemUrl = getRoute(nextItem);

  const handleNext = () => {
    if (nextItemUrl) {
      router.push(nextItemUrl);
    }
  };

  const handlePrevious = () => {
    if (previousItem) {
      const route = previousItem.itemType === "exam"
        ? `/campus/courses/${course.id}/learn/exam/${previousItem.id}`
        : `/campus/courses/${course.id}/learn/${previousItem.id}`;
      router.push(route);
    }
  };

  const isPassed = exam.exam_attempts?.some((a: any) => a.passed) || lastAttempt?.passed;

  const handleStartExam = () => {
    setState("active");
  };

  const handleFinishExam = (attemptData: any) => {
    setLastAttempt(attemptData);
    setState("finished");

    // If the student passed, the API already auto-completed the module.
    // Refresh the page data so the sidebar reflects the new completion state.
    if (attemptData?.passed) {
      router.refresh();
    }
  };

  const handleRestart = () => {
    setState("idle");
    setLastAttempt(null);
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-8 min-h-[600px] flex flex-col">
          {state === "idle" && (
            <ExamPreFlight 
              exam={exam} 
              questionCount={questions.length} 
              onStart={handleStartExam} 
            />
          )}
          
          {state === "active" && (
            <ExamQuestionView 
              exam={exam} 
              questions={questions} 
              onFinish={handleFinishExam} 
            />
          )}

          {state === "finished" && (
            <ExamResults 
              exam={exam} 
              lastAttempt={lastAttempt} 
              onRetry={handleRestart} 
              nextItemUrl={nextItemUrl}
            />
          )}
        </div>

        {/* Sidebar Area */}
        <aside className="xl:col-span-4 self-start sticky top-28 h-[calc(100vh-8rem)] min-h-[500px]">
          <div className="h-full rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden">
            <LearnSidebar
              courseId={course.id}
              subjects={course.subjects}
              activeItemId={exam.id}
              activeType="exam"
              progressPercentage={progressPercentage}
              onPrevious={handlePrevious}
              onNext={handleNext}
              hasPrevious={!!previousItem}
              hasNext={!!nextItem && isPassed}
              onNextFromSidebar={handleNext}
              enrollmentStatus={enrollmentStatus}
              finalExamConfig={{ enabled: (course.final_exam_question_count ?? 0) > 0 }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
