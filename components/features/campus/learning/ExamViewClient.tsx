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
}

type ExamState = "idle" | "active" | "finished";

export function ExamViewClient({
  course,
  exam,
  questions,
  flatItems,
}: ExamViewClientProps) {
  const router = useRouter();
  const [state, setState] = useState<ExamState>("idle");
  const [lastAttempt, setLastAttempt] = useState<any>(null);

  // Calculate overall progress including exams
  const totalItems = flatItems.length;
  const completedLessons = flatItems.filter(item => item.itemType === 'class' && item.lesson_progress?.[0]?.is_completed).length;
  const passedExams = flatItems.filter(item => item.itemType === 'exam' && item.exam_attempts?.some((a: any) => a.passed)).length;
  
  const progressPercentage = totalItems > 0 ? ((completedLessons + passedExams) / totalItems) * 100 : 0;

  const currentIndex = flatItems.findIndex((c) => c?.id === exam.id);
  const nextItem = flatItems[currentIndex + 1];
  const previousItem = flatItems[currentIndex - 1];

  const handleNext = () => {
    if (nextItem) {
      const route = nextItem.itemType === "exam"
        ? `/campus/courses/${course.id}/learn/exam/${nextItem.id}`
        : `/campus/courses/${course.id}/learn/${nextItem.id}`;
      router.push(route);
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
            />
          )}
        </div>

        {/* Sidebar Area */}
        <aside className="xl:col-span-4 self-start">
          <div className="sticky top-28 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden">
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
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
