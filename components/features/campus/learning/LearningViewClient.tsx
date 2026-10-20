"use client";

import { useRouter } from "next/navigation";
import { LearnSidebar } from "@/components/features/campus/learning/LearnSidebar";
import { YouTubePlayer } from "@/components/features/campus/learning/YouTubePlayer";
import { ResourceList } from "@/components/features/campus/learning/ResourceList";
import { toggleLessonCompletion } from "@/actions/courses";
import { toast } from "sonner";
import { useCallback, useTransition } from "react";
import { getYoutubeId } from "@/lib/utils/youtube";
import { ChevronLeft, ChevronRight, GraduationCap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";


interface LearningViewClientProps {
  course: any;
  activeClass: any;
  flatItems: any[];
  enrollmentStatus?: string;
}

export function LearningViewClient({
  course,
  activeClass,
  flatItems,
  enrollmentStatus,
}: LearningViewClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!activeClass || !course) return null;

  const currentIndex = flatItems.findIndex((c) => c?.id === activeClass.id);
  let nextItem = flatItems[currentIndex + 1];
  const previousItem = flatItems[currentIndex - 1];

  const hasFinalExam = (course.final_exam_question_count ?? 0) > 0;

  if (!nextItem && hasFinalExam) {
    nextItem = { itemType: "final-exam", id: "final-exam" };
  }

  const { t, lang } = useTranslation();
  const courseTitle = typeof course.title === "string" ? course.title : (course.title?.[lang] || t("courseCard.untitledCourse"));
  const classTitle = typeof activeClass.title === "string" ? activeClass.title : (activeClass.title?.[lang] || "Untitled Class");

  // Calculate overall progress including exams
  const totalItems = flatItems.length;
  const progressTotalItems = totalItems + (hasFinalExam ? 1 : 0);

  const completedLessons = flatItems.filter(item => item.itemType === 'class' && item.lesson_progress?.[0]?.is_completed).length;
  const passedExams = flatItems.filter(item => item.itemType === 'exam' && item.exam_attempts?.some((a: any) => a.passed)).length;
  const passedFinal = enrollmentStatus === "completed" ? 1 : 0;
  
  const progressPercentage = progressTotalItems > 0 ? ((completedLessons + passedExams + passedFinal) / progressTotalItems) * 100 : 0;

  const handleNext = () => {
    startTransition(async () => {
      // Automatically mark current as completed when clicking next
      await toggleLessonCompletion(course.id, activeClass.id, true);
      
      if (nextItem) {
        toast.info(t("learning.savingProgress"), { duration: 2000 });
        
        let route = "";
        if (nextItem.itemType === "final-exam") {
           route = `/campus/courses/${course.id}/learn/final-exam`;
        } else if (nextItem.itemType === "exam") {
           route = `/campus/courses/${course.id}/learn/exam/${nextItem.id}`;
        } else {
           route = `/campus/courses/${course.id}/learn/${nextItem.id}`;
        }
        
        router.push(route);
      } else {
        toast.success(t("learning.endOfCourse"));
      }
    });
  };

  const handleToggleManual = () => {
    const isCompleted = activeClass.lesson_progress?.[0]?.is_completed;
    startTransition(async () => {
      const res = await toggleLessonCompletion(course.id, activeClass.id, !isCompleted);
      if (res.success) {
        toast.success(!isCompleted ? t("learning.markedCompleted") : t("learning.markedIncomplete"));
      }
    });
  };

  const handlePrevious = () => {
    if (previousItem) {
      const route = previousItem.itemType === "exam"
        ? `/campus/courses/${course.id}/learn/exam/${previousItem.id}`
        : `/campus/courses/${course.id}/learn/${previousItem.id}`;
      router.push(route);
    }
  };

  const handleAutoAdvance = useCallback(() => {
    startTransition(async () => {
      await toggleLessonCompletion(course.id, activeClass.id, true);
      if (nextItem) {
        toast.info(t("learning.lessonCompleted"), { duration: 3000 });
        handleNext();
      } else {
        toast.success(t("learning.courseCompleted"));
      }
    });
  }, [course.id, activeClass.id, nextItem, t]);

  const isCompleted = activeClass.lesson_progress?.[0]?.is_completed;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-8">
           {/* Mini Title / Header Section */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
             <h1 className="font-display text-2xl font-bold tracking-tight text-primary md:text-3xl">
               {classTitle}
             </h1>
           </div>



           {getYoutubeId(activeClass.video_url) ? (
             <YouTubePlayer
               videoId={activeClass.video_url}
               onEnded={handleAutoAdvance}
             />
           ) : (
             <div className="flex aspect-video items-center justify-center rounded-2xl border border-primary/10 bg-primary text-white">
               <p className="max-w-sm px-6 text-center text-sm text-white/70">
                 Esta clase no tiene video. Leé la descripción y los recursos, y marcá como completada cuando termines.
               </p>
             </div>
           )}

           {/* Resources & Info Wrap - Vertical Stack */}
           <div className="flex flex-col gap-12 pt-8">
              {/* Resources Section */}
              <div className="space-y-4">
                 <ResourceList resourceUrl={activeClass.resource_url} />
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                 <div className="flex items-center px-1">
                    <h3 className="text-lg font-bold text-primary tracking-tight">{t("learning.aboutThisLesson")}</h3>
                 </div>
                 <p className="rounded-2xl border border-primary/10 bg-white p-6 text-sm leading-relaxed text-primary/70">
                    {typeof activeClass.description === "string" 
                       ? activeClass.description 
                       : (activeClass.description?.[lang] || t("learning.noDescription"))}
                 </p>
              </div>
           </div>


        </div>


        {/* Sidebar Area */}
        <aside className="xl:col-span-4 self-start sticky top-28 h-[calc(100vh-8rem)] min-h-[500px]">
          <div className="h-full rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden">
            <LearnSidebar
              courseId={course.id}
              subjects={course.subjects}
              activeItemId={activeClass.id}
              activeType="class"
              progressPercentage={progressPercentage}
              onPrevious={handlePrevious}
              onNext={handleNext}
              hasPrevious={!!previousItem}
              hasNext={!!nextItem}
              nextClassId={nextItem?.itemType === 'class' ? nextItem.id : undefined}
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


