"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowRight, ChevronRight, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";

interface ExamQuestionViewProps {
  exam: any;
  questions: any[];
  onFinish: (attempt: any) => void;
  submitUrl?: string;
}

export function ExamQuestionView({ exam, questions, onFinish, submitUrl }: ExamQuestionViewProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    exam.time_limit_minutes ? exam.time_limit_minutes * 60 : null
  );

  const { t, lang } = useTranslation();
  const currentQuestion = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

  // Handle Finish/Submit
  const handleSubmit = useCallback(async (finalAnswers?: Record<string, string>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const submissionAnswers = finalAnswers || answers;
    
    // Ensure all questions have an answer (even if empty/null, though UI prevents it)
    // The backend requires an answer for every question
    const completeAnswers: Record<string, string> = { ...submissionAnswers };

    try {
      const url = submitUrl || `/api/exams/${exam.id}/attempts`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: completeAnswers }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to submit exam");
      }

      onFinish(json.data);
    } catch (error: any) {
      toast.error(error.message);
      setIsSubmitting(false);
    }
  }, [exam.id, answers, questions, onFinish, isSubmitting, submitUrl]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      toast.warning(t("examQuestion.timeUp"));
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  const handleSelectOption = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedOptionId = answers[currentQuestion?.id];

  if (!questions.length) {
    return (
      <div className="rounded-3xl border border-dashed border-primary/15 bg-white p-10 text-center text-sm text-slate-500">
        Este examen todavía no tiene preguntas.
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="flex-1 flex flex-col space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">{t("examQuestion.progress")}</span>
             <span className="text-xs font-bold text-slate-400">{t("examQuestion.question")} {currentIdx + 1} {t("examQuestion.questionOf")} {questions.length}</span>
          </div>
          <Progress value={progress} className="h-1.5 w-48 md:w-64 bg-slate-100" />
        </div>

        {timeLeft !== null && (
          <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl border font-bold h-fit transition-colors",
            timeLeft < 60 ? "bg-rose-50 border-rose-100 text-rose-600 animate-pulse" : "bg-slate-50 border-slate-100 text-primary"
          )}>
            <Clock className="size-5" />
            <span className="tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Question Canvas */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-10 shadow-2xl shadow-primary/5 space-y-8">
        <div className="space-y-6">
           <h2 className="text-lg md:text-2xl font-bold text-primary leading-tight tracking-tight">
             {typeof currentQuestion.content === "string" ? currentQuestion.content : (currentQuestion.content?.[lang] || t("examQuestion.untitledQuestion"))}
           </h2>

           <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option: any, oIdx: number) => {
                const isSelected = selectedOptionId === option.id;
                const optionContent = typeof option.content === "string" ? option.content : (option.content?.[lang] || "Option text missing");
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-300 group",
                      isSelected 
                        ? "bg-primary/5 border-primary shadow-sm shadow-primary/5" 
                        : "bg-white border-slate-50 hover:border-slate-200 hover:bg-slate-50/50"
                    )}
                  >
                    <div className={cn(
                      "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected ? "bg-primary border-primary" : "border-slate-200 group-hover:border-slate-300"
                    )}>
                      {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                    </div>
                    <span className={cn(
                      "text-sm font-bold transition-colors leading-tight",
                      isSelected ? "text-primary" : "text-slate-600 group-hover:text-primary"
                    )}>
                      {optionContent}
                    </span>
                  </button>
                );
              })}
           </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">
             {t("examQuestion.selectCorrectOption")}
           </p>
           
           <Button
             disabled={!selectedOptionId || isSubmitting}
             onClick={handleNext}
             className="ms-auto h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/95 shadow-md shadow-primary/10 group transition-all active:scale-95"
           >
             {isSubmitting ? t("examQuestion.submitting") : currentIdx < questions.length - 1 ? t("examQuestion.nextQuestion") : t("examQuestion.finishSubmit")}
             <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
           </Button>
        </div>
      </div>
    </div>
  );
}
