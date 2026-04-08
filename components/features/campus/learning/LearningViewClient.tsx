"use client";

import { useRouter } from "next/navigation";
import { LearnSidebar } from "@/components/features/campus/learning/LearnSidebar";
import { YouTubePlayer } from "@/components/features/campus/learning/YouTubePlayer";
import { ResourceList } from "@/components/features/campus/learning/ResourceList";
import { toggleLessonCompletion } from "@/actions/courses";
import { toast } from "sonner";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight, GraduationCap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


interface LearningViewClientProps {
  course: any;
  activeClass: any;
  flatClasses: any[];
}

export function LearningViewClient({
  course,
  activeClass,
  flatClasses,
}: LearningViewClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!activeClass || !course) return null;

  const currentIndex = flatClasses.findIndex((c) => c?.id === activeClass.id);
  const nextClass = flatClasses[currentIndex + 1];
  const previousClass = flatClasses[currentIndex - 1];

  const lang = "en";
  const courseTitle = typeof course.title === "string" ? course.title : (course.title?.[lang] || "Untitled Course");
  const classTitle = typeof activeClass.title === "string" ? activeClass.title : (activeClass.title?.[lang] || "Untitled Class");

  const totalClasses = Math.max(flatClasses.length, 1);
  const completedCount = flatClasses.filter(c => c?.lesson_progress?.[0]?.is_completed).length;
  const progressPercentage = (completedCount / totalClasses) * 100;


  const handleNext = () => {
    startTransition(async () => {
      // Automatically mark current as completed when clicking next
      await toggleLessonCompletion(course.id, activeClass.id, true);
      
      if (nextClass) {
        toast.info("Saving progress and moving to next class...", { duration: 2000 });
        router.push(`/campus/courses/${course.id}/learn/${nextClass.id}`);
      } else {
        toast.success("Congratulations! You've reached the end of the course.");
      }
    });
  };

  const handleToggleManual = () => {
    const isCompleted = activeClass.lesson_progress?.[0]?.is_completed;
    startTransition(async () => {
      const res = await toggleLessonCompletion(course.id, activeClass.id, !isCompleted);
      if (res.success) {
        toast.success(!isCompleted ? "Marked as completed!" : "Lesson marked as incomplete.");
      }
    });
  };

  const handlePrevious = () => {
    if (previousClass) {
      router.push(`/campus/courses/${course.id}/learn/${previousClass.id}`);
    }
  };

  const handleAutoAdvance = () => {
    startTransition(async () => {
      // Mark current as completed
      await toggleLessonCompletion(course.id, activeClass.id, true);
      
      // Auto-advance if there's a next class
      if (nextClass) {
        toast.info("Lesson completed! Advancing to next...", { duration: 3000 });
        handleNext();
      } else {
        toast.success("Course completed! Well done.");
      }
    });
  };

  const isCompleted = activeClass.lesson_progress?.[0]?.is_completed;

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-8">
           {/* Mini Title / Header Section */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
             <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary">
               {classTitle}
             </h1>
           </div>



           {/* Video Player */}
           <YouTubePlayer 
              videoId={activeClass.video_url || ""} 
              onEnded={handleAutoAdvance}
           />

           {/* Resources & Info Wrap - Vertical Stack */}
           <div className="flex flex-col gap-12 pt-8">
              {/* Resources Section */}
              <div className="space-y-4">
                 <ResourceList resourceUrl={activeClass.resource_url} />
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                 <div className="flex items-center px-1">
                    <h3 className="text-lg font-bold text-primary tracking-tight">About this lesson</h3>
                 </div>
                 <p className="text-sm text-slate-500 leading-relaxed bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    {typeof activeClass.description === "string" 
                       ? activeClass.description 
                       : (activeClass.description?.[lang] || "No additional description for this lesson.")}
                 </p>
              </div>
           </div>


        </div>


        {/* Sidebar Area */}
        <aside className="xl:col-span-4 self-start">
          <div className="sticky top-28 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden">
            <LearnSidebar
              courseId={course.id}
              subjects={course.subjects}
              activeClassId={activeClass.id}
              progressPercentage={progressPercentage}
              onPrevious={handlePrevious}
              onNext={handleNext}
              hasPrevious={!!previousClass}
              hasNext={!!nextClass}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}


