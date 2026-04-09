import { CheckCircle2, Play, Lock, ChevronDown, Clock, ClipboardCheck, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
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

interface Exam {
  id: string;
  title: any;
  time_limit_minutes?: number;
  max_attempts: number;
  exam_attempts?: {
    score: number;
    passed: boolean;
  }[];
}

interface Subject {
  id: string;
  title: any;
  classes: Class[];
  exams: Exam[];
}

interface LearnSidebarProps {
  courseId: string;
  subjects: Subject[];
  activeItemId: string;
  activeType: "class" | "exam";
  progressPercentage: number;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  /** The ID of the class immediately after the current one (for "next" behavior on sidebar click) */
  nextClassId?: string;
  /** Callback to trigger "next class" flow (marks current complete + navigates) */
  onNextFromSidebar?: () => void;
}

// Helper: check if a module's exam has been passed
function isModuleExamPassed(subject: Subject): boolean {
  if (!subject.exams?.length) return true; // No exam = considered passed for gating purposes
  return subject.exams.some((e) =>
    e.exam_attempts?.some((a) => a.passed)
  );
}

export function LearnSidebar({
  courseId,
  subjects,
  activeItemId,
  activeType,
  progressPercentage,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  nextClassId,
  onNextFromSidebar,
}: LearnSidebarProps) {
  const lang = "en";

  let globalClassIdx = 0;

  // Helper to extract YouTube ID and get thumbnail
  const getYTThumb = (url?: string) => {
    const videoId = getYoutubeId(url);
    if (!videoId) return "/images/placeholder-video.jpg";
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  // Build a flat ordered list of class completion states per module for line-gap logic
  const buildCompletionMap = (subject: Subject): boolean[] => {
    return subject.classes.map(
      (c) => !!c.lesson_progress?.[0]?.is_completed
    );
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
            const completionMap = buildCompletionMap(subject);
            const examPassed = isModuleExamPassed(subject);

            // Module locking: Module 0 always unlocked. Module N unlocked if Module N-1 exam passed.
            const isModuleLocked = sIdx > 0 && !isModuleExamPassed(subjects[sIdx - 1]);

            // Module dot: accent if exam passed OR at least one completed/active item
            const isModuleStarted = !isModuleLocked && (
              examPassed ||
              subject.classes.some(c => c.lesson_progress?.[0]?.is_completed || (activeType === "class" && c.id === activeItemId)) || 
              subject.exams.some(e => (e.exam_attempts?.length ?? 0) > 0 || (activeType === "exam" && e.id === activeItemId))
            );

            return (
              <AccordionItem key={subject.id} value={subject.id} className="border-none relative">
                {/* Module Title with Dot */}
                <AccordionTrigger className="hover:no-underline py-3 px-4 hover:bg-slate-50/50 rounded-xl transition-all group/trigger relative z-10">
                  <div className="flex items-center gap-4 text-left w-full">
                     {/* Module Dot */}
                     <div className="relative size-7 flex items-center justify-center shrink-0 z-20">
                        {/* Connecting line ABOVE module dot (connects to previous module's exam) */}
                        {sIdx > 0 && (
                           <div className={cn(
                              "absolute bottom-1/2 left-1/2 -translate-x-1/2 w-[2px] h-[calc(100%+40px)] z-0 transition-colors duration-500",
                              (isModuleExamPassed(subjects[sIdx - 1]) && isModuleStarted) ? "bg-accent" : "bg-transparent"
                           )} />
                        )}

                        <div className={cn(
                           "size-2.5 rounded-full transition-all duration-500 shadow-sm ring-4 ring-white relative z-10",
                           isModuleLocked ? "bg-slate-300" :
                           isModuleStarted ? "bg-accent shadow-accent/20" : "bg-slate-200"
                        )} />
                        {/* Connecting stem below module dot — only if module is started and not locked */}
                        <div className={cn(
                           "absolute top-1/2 left-1/2 -translate-x-1/2 w-[2px] h-[calc(50%+16px)] z-0 transition-colors duration-500",
                           (!isModuleLocked && isModuleStarted && (completionMap[0] || (activeType === "class" && subject.classes[0]?.id === activeItemId))) ? "bg-accent" : "bg-transparent"
                        )} />
                     </div>

                     {/* Module Title + Lock */}
                     <div className="flex items-center gap-2">
                        <h4 className={cn(
                           "text-[11px] font-extrabold tracking-[0.12em] uppercase transition-colors",
                           isModuleLocked ? "text-slate-300" :
                           isModuleStarted ? "text-primary" : "text-slate-400"
                        )}>
                           {subjectTitle}
                        </h4>
                        {isModuleLocked && (
                          <Lock className="size-3 text-slate-300" />
                        )}
                     </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="pt-0 pb-2 px-0 space-y-0 relative overflow-visible">
                  {subject.classes.map((cls, cIdx) => {
                    globalClassIdx++;
                    const currentIdx = globalClassIdx;
                    const classTitle = typeof cls.title === "string" ? cls.title : (cls.title?.[lang] || "Untitled");
                    const isActive = activeType === "class" && cls.id === activeItemId;
                    const isCompleted = !!cls.lesson_progress?.[0]?.is_completed;

                    // Platzi-style line logic:
                    // The segment A -> B is filled IF A is completed AND (B is completed OR B is active).
                    // Top half of this item connects to the previous item.
                    const prevCompleted = cIdx === 0 ? isModuleStarted : completionMap[cIdx - 1];
                    const lineAboveFilled = prevCompleted && (isCompleted || isActive);
                    
                    // Bottom half of this item connects to the next item (class or first exam).
                    const isLastClass = cIdx === subject.classes.length - 1;
                    const nextClassCompleted = !isLastClass ? completionMap[cIdx + 1] : false;
                    const nextClassActive = !isLastClass ? (activeType === "class" && subject.classes[cIdx + 1].id === activeItemId) : false;
                    
                    const firstExamPassed = isLastClass && subject.exams.length > 0 ? (subject.exams[0].exam_attempts?.some((a: any) => a.passed)) : false;
                    const firstExamActive = isLastClass && subject.exams.length > 0 ? (activeType === "exam" && subject.exams[0].id === activeItemId) : false;

                    const lineBelowFilled = isCompleted && (nextClassCompleted || nextClassActive || firstExamPassed || firstExamActive);

                    // Is this click the "next class" shortcut?
                    const isNextClass = cls.id === nextClassId;

                    const handleClick = (e: React.MouseEvent) => {
                      if (isModuleLocked) {
                        e.preventDefault();
                        return;
                      }
                      if (isNextClass && onNextFromSidebar) {
                        e.preventDefault();
                        onNextFromSidebar();
                      }
                    };
                    
                    return (
                      <Link
                        key={cls.id}
                        href={isModuleLocked ? "#" : `/campus/courses/${courseId}/learn/${cls.id}`}
                        onClick={handleClick}
                        aria-disabled={isModuleLocked}
                        className={cn(
                          "group relative flex items-center gap-4 py-3 px-4 transition-all z-10",
                          isActive && "bg-slate-50/50 rounded-2xl",
                          isModuleLocked && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        {/* Vertical Progress Line Segments */}
                        <div className="absolute left-[29px] inset-y-0 w-[2px] flex flex-col z-0">
                          <div className={cn(
                            "flex-1 transition-colors duration-500",
                            lineAboveFilled ? "bg-accent" : "bg-transparent"
                          )} />
                          <div className={cn(
                            "flex-1 transition-colors duration-500",
                            lineBelowFilled ? "bg-accent" : "bg-transparent"
                          )} />
                        </div>

                        {/* Numeric Indicator */}
                        <div className="relative size-7 shrink-0 flex items-center justify-center z-10">
                           <div className={cn(
                              "relative size-full rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 shadow-sm border-2 border-white",
                              isModuleLocked ? "bg-slate-200 text-slate-400" :
                              isCompleted || isActive 
                                 ? "bg-accent text-white shadow-accent/20" 
                                 : "bg-slate-200 text-slate-500 group-hover:bg-slate-300"
                           )}>
                              {isModuleLocked ? <Lock className="size-2.5" /> : currentIdx}
                           </div>
                        </div>

                        {/* Thumbnail Wrap */}
                        <div className="relative size-14 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
                          <img 
                            src={getYTThumb(cls.video_url)} 
                            alt="" 
                            className={cn(
                               "size-full object-cover transition-opacity duration-300",
                               isModuleLocked ? "opacity-30 grayscale" :
                               isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                            )}
                          />
                        </div>

                        {/* Text Metadata */}
                        <div className="min-w-0 flex-1">
                           <h5 className={cn(
                              "text-[12px] font-bold leading-snug transition-colors line-clamp-2",
                              isModuleLocked ? "text-slate-400" :
                              isActive || isCompleted ? "text-primary" : "text-slate-500 group-hover:text-primary"
                           )}>
                              {classTitle}
                           </h5>
                           <div className="flex items-center gap-2 mt-1">
                              {isModuleLocked ? (
                                 <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Lock className="size-2.5" /> Locked
                                 </span>
                              ) : isCompleted ? (
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

                  {/* Exams Section */}
                  {subject.exams.map((exam) => {
                    const examTitle = typeof exam.title === "string" ? exam.title : (exam.title?.[lang] || "Assessment");
                    const isActive = activeType === "exam" && exam.id === activeItemId;
                    const attempts = exam.exam_attempts || [];
                    const bestAttempt = attempts.length > 0 ? [...attempts].sort((a, b) => b.score - a.score)[0] : null;
                    const isPassed = bestAttempt?.passed || false;
                    const isAttempted = attempts.length > 0;

                    // Line above exam: filled only if the last class in this module is completed
                    // and this exam is active or passed.
                    const lastClassCompleted = completionMap.length > 0 ? completionMap[completionMap.length - 1] : isModuleStarted;
                    const lineAboveExamFilled = (isPassed || isActive) && lastClassCompleted;

                    const handleExamClick = (e: React.MouseEvent) => {
                      if (isModuleLocked) {
                        e.preventDefault();
                        return;
                      }
                    };
                    
                    return (
                      <Link
                        key={exam.id}
                        href={isModuleLocked ? "#" : `/campus/courses/${courseId}/learn/exam/${exam.id}`}
                        onClick={handleExamClick}
                        aria-disabled={isModuleLocked}
                        className={cn(
                          "group relative flex items-center gap-4 py-3 px-4 transition-all z-10",
                          isActive && "bg-slate-50/50 rounded-2xl",
                          isModuleLocked && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        {/* Vertical Progress Line Segments */}
                        <div className="absolute left-[29px] inset-y-0 w-[2px] flex flex-col z-0">
                          <div className={cn(
                            "flex-1 transition-colors duration-500",
                            lineAboveExamFilled ? "bg-accent" : "bg-transparent"
                          )} />
                          <div className={cn(
                            "flex-1 transition-colors duration-500",
                            (() => {
                              if (!isPassed || sIdx >= subjects.length - 1) return false;
                              const nextSubject = subjects[sIdx + 1];
                              const nextFirstClass = nextSubject.classes[0];
                              if (!nextFirstClass) return false;
                              const nextStarted = nextFirstClass.lesson_progress?.[0]?.is_completed || (activeType === 'class' && nextFirstClass.id === activeItemId);
                              return nextStarted;
                            })() ? "bg-accent" : "bg-transparent"
                          )} />
                        </div>

                        {/* Exam Icon Indicator */}
                        <div className="relative size-7 shrink-0 flex items-center justify-center z-10">
                           <div className={cn(
                              "relative size-full rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 shadow-sm border-2 border-white",
                              isModuleLocked ? "bg-slate-200 text-slate-400" :
                              isPassed || isActive 
                                 ? "bg-accent text-white shadow-accent/20" 
                                 : "bg-amber-100 text-amber-600 group-hover:bg-amber-200"
                           )}>
                              {isModuleLocked ? <Lock className="size-2.5" /> : <ClipboardCheck className="size-3.5" />}
                           </div>
                        </div>
                        {/* The second icon was removed to simplify the UI as requested user */}

                        {/* Text Metadata */}
                        <div className="min-w-0 flex-1">
                           <h5 className={cn(
                              "text-[12px] font-bold leading-snug transition-colors line-clamp-2",
                              isModuleLocked ? "text-slate-400" :
                              isActive || isPassed ? "text-primary" : "text-slate-500 group-hover:text-primary"
                           )}>
                              {examTitle}
                           </h5>
                           {(isModuleLocked || isPassed || isActive || isAttempted) && (
                             <div className="flex items-center gap-2 mt-1">
                                {isModuleLocked ? (
                                   <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                      <Lock className="size-2.5" /> Locked
                                   </span>
                                ) : isPassed ? (
                                   <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-widest opacity-80">
                                      <CheckCircle2 className="size-2.5" /> 
                                      Passed ({Math.round(bestAttempt?.score || 0)}%)
                                   </span>
                                ) : isActive ? (
                                   <span className="flex items-center gap-1.5 text-[9px] font-bold text-accent uppercase tracking-widest">
                                      <Play className="size-2.5 fill-accent" /> 
                                      Taking now
                                   </span>
                                ) : isAttempted ? (
                                   <span className="flex items-center gap-1.5 text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                                      <AlertCircle className="size-2.5" />
                                      Failed ({bestAttempt?.score}%)
                                   </span>
                                ) : null}
                             </div>
                           )}
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
