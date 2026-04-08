import { ChevronLeft, ChevronRight, CheckCircle2, Play, Lock, ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { getYoutubeId } from "@/lib/utils/youtube";

interface Class {
  id: string;
  title: any;
  duration_minutes?: number;
  video_url?: string;
  lesson_progress?: {
     is_completed: boolean;
  }[];
}

interface Subject {
  id: string;
  title: any;
  classes: Class[];
}

interface LearnSidebarProps {
  courseId: string;
  subjects: Subject[];
  activeClassId: string;
  progressPercentage: number;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function LearnSidebar({
  courseId,
  subjects,
  activeClassId,
  progressPercentage,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: LearnSidebarProps) {
  const lang = "en"; // To be connected with user prefs


  let globalClassIdx = 0;

  // Helper to extract YouTube ID and get thumbnail
  const getYTThumb = (url?: string) => {
    const videoId = getYoutubeId(url);
    if (!videoId) return "/images/placeholder-video.jpg";
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  return (

    <aside className="w-full h-full flex flex-col bg-white border-l border-slate-100 overflow-hidden">
      {/* Navigation Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="flex-1 h-10 rounded-xl gap-1.5 font-bold text-[11px] text-slate-500 hover:text-primary transition-all uppercase tracking-wider"
        >
          <ChevronLeft className="size-3.5" />
          Prev
        </Button>

        <Button 
          variant="default" 
          size="sm" 
          onClick={onNext}
          disabled={!hasNext}
          className="flex-1 h-10 rounded-xl gap-1.5 font-bold text-[11px] shadow-lg shadow-primary/10 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 uppercase tracking-wider"
        >
          {hasNext ? "Next" : "Finish"}
          <ChevronRight className="size-3.5" />
        </Button>
      </div>

      {/* Progress Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Course Progress</h3>
          <span className="text-xs font-bold text-primary">{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-1.5 bg-slate-100" />
      </div>

      {/* Curriculum List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-2">
        <Accordion type="multiple" defaultValue={subjects.map(s => s.id)} className="w-full space-y-4 relative">
          {/* Main Continuous Vertical Line Background */}
          <div className="absolute left-[30px] top-6 bottom-6 w-[1.5px] bg-slate-100 z-0" />

          {subjects.map((subject, sIdx) => {
            const subjectTitle = typeof subject.title === "string" ? subject.title : (subject.title?.[lang] || "Module");
            const isModuleStarted = subject.classes.some(c => c.lesson_progress?.[0]?.is_completed || c.id === activeClassId);

            return (
              <AccordionItem key={subject.id} value={subject.id} className="border-none relative">
                {/* Module Title with Dot and Line Start */}
                <AccordionTrigger className="hover:no-underline py-3 px-4 hover:bg-slate-50/50 rounded-xl transition-all group/trigger relative z-10">
                  <div className="flex items-center gap-4 text-left w-full">
                     {/* Module Dot */}
                     <div className="relative size-7 flex items-center justify-center shrink-0 z-20">
                        <div className={cn(
                           "size-2.5 rounded-full transition-all duration-500 shadow-sm ring-4 ring-white",
                           isModuleStarted ? "bg-accent shadow-accent/20" : "bg-slate-200"
                        )} />
                        {/* Connecting stem below module dot to bridge the gap with first lesson */}
                        <div className={cn(
                           "absolute top-1/2 left-1/2 -translate-x-1/2 w-[2px] h-[calc(50%+16px)] z-0 transition-colors duration-500",
                           isModuleStarted ? "bg-accent" : "bg-transparent"
                        )} />
                     </div>




                     <h4 className={cn(
                        "text-[11px] font-extrabold tracking-[0.12em] uppercase transition-colors",
                        isModuleStarted ? "text-primary" : "text-slate-400"
                     )}>
                        {subjectTitle}
                     </h4>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="pt-0 pb-2 px-0 space-y-0 relative overflow-visible">
                  {subject.classes.map((cls) => {
                    globalClassIdx++;
                    const currentIdx = globalClassIdx;
                    const classTitle = typeof cls.title === "string" ? cls.title : (cls.title?.[lang] || "Untitled");
                    const isActive = cls.id === activeClassId;
                    const isCompleted = cls.lesson_progress?.[0]?.is_completed;
                    
                    return (
                      <Link
                        key={cls.id}
                        href={`/campus/courses/${courseId}/learn/${cls.id}`}
                        className={cn(
                          "group relative flex items-center gap-4 py-3 px-4 transition-all z-10",
                          isActive && "bg-slate-50/50 rounded-2xl"
                        )}
                      >
                        {/* Vertical Progress Line Segments */}
                        <div className="absolute left-[29px] inset-y-0 w-[2px] flex flex-col z-0">
                          {/* Segment pointing to the dot (Blue if active OR completed) */}
                          <div className={cn(
                            "flex-1 transition-colors duration-500",
                            (isCompleted || isActive) ? "bg-accent" : "bg-transparent"
                          )} />
                          {/* Segment pointing away from the dot (Blue ONLY if completed AND NOT current focus) */}
                          <div className={cn(
                            "flex-1 transition-colors duration-500",
                            (isCompleted && !isActive) ? "bg-accent" : "bg-transparent"
                          )} />

                        </div>

                        {/* Numeric Indicator */}
                        <div className="relative size-7 shrink-0 flex items-center justify-center z-10">
                           <div className={cn(
                              "relative size-full rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 shadow-sm border-2 border-white",
                              isCompleted || isActive 
                                 ? "bg-accent text-white shadow-accent/20" 
                                 : "bg-slate-200 text-slate-500 group-hover:bg-slate-300"
                           )}>
                              {currentIdx}
                           </div>
                        </div>





                        {/* Thumbnail Wrap */}
                        <div className="relative size-14 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
                          <img 
                            src={getYTThumb(cls.video_url)} 
                            alt="" 
                            className={cn(
                               "size-full object-cover transition-opacity duration-300",
                               isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                            )}
                          />
                        </div>

                        {/* Text Metadata */}
                        <div className="min-w-0 flex-1">
                           <h5 className={cn(
                              "text-[12px] font-bold leading-snug transition-colors line-clamp-2",
                              isActive || isCompleted ? "text-primary" : "text-slate-500 group-hover:text-primary"
                           )}>
                              {classTitle}
                           </h5>
                           <div className="flex items-center gap-2 mt-1">
                              {isCompleted ? (
                                 <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-widest opacity-80">
                                    <CheckCircle2 className="size-2.5" /> 
                                    Completed
                                 </span>
                              ) : isActive ? (
                                 <span className="flex items-center gap-1.5 text-[9px] font-bold text-accent uppercase tracking-widest">
                                    <Play className="size-2.5 fill-accent" /> 
                                    Watching now
                                 </span>
                              ) : (
                                 <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Clock className="size-2.5" />
                                    {cls.duration_minutes || 0} min
                                 </span>
                              )}
                           </div>

                        </div>
                      </Link>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            );
          })}

        </Accordion>
      </div>
    </aside>
  );
}

