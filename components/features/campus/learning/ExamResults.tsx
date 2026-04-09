"use client";

import { CheckCircle2, XCircle, RefreshCcw, ArrowLeft, ArrowRight, Trophy, Target, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ExamResultsProps {
  exam: any;
  lastAttempt: any;
  onRetry: () => void;
  isFinalExam?: boolean;
  nextItemUrl?: string;
}

export function ExamResults({ exam, lastAttempt, onRetry, isFinalExam, nextItemUrl }: ExamResultsProps) {
  const lang = "en";
  const { score, passed, attempt } = lastAttempt;
  const isPassed = passed;

  const attempts = exam?.exam_attempts || [];
  // Include the current attempt in the count if it's not already in the list
  const isCurrentAttemptInList = attempts.some((a: any) => a.id === attempt?.id);
  const totalFinishedCount = attempts.filter((a: any) => a.finished_at).length + (isCurrentAttemptInList ? 0 : 1);

  const maxAttempts = exam?.max_attempts || 0;
  const attemptsRemaining = Math.max(0, maxAttempts - totalFinishedCount);

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-700">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden">
        {/* Result Header */}
        <div className={cn(
          "p-12 text-center space-y-6 transition-colors duration-1000",
          isPassed ? "bg-emerald-500" : "bg-brand-orange"
        )}>
          <div className="mx-auto size-24 rounded-full bg-white flex items-center justify-center shadow-2xl animate-bounce-subtle">
            {isPassed ? (
              <Trophy className="size-12 text-emerald-500" />
            ) : (
              <AlertCircle className="size-12 text-brand-orange" />
            )}
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              {isPassed ? (isFinalExam ? "Course Completed! 🎓" : "Congratulations!") : "Keep Practicing!"}
            </h2>
            <p className="text-white/80 font-medium">
              {isPassed
                ? (isFinalExam ? "You have successfully passed the final examination." : "You have successfully passed this examination.")
                : "You did not reach the passing score this time."}
            </p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="p-8 md:p-12 space-y-12">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center space-y-1">
              <div className="text-5xl font-black text-primary tracking-tighter">
                {Math.round(score || 0)}%
              </div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Score</label>
            </div>
            <div className="text-center space-y-1 border-l border-slate-100">
              <div className="text-5xl font-black text-slate-300 tracking-tighter">
                {exam?.passing_score || 70}%
              </div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passing Score</label>
            </div>
          </div>

          {/* Attempts remaining - Simplified (Only show if failed and NOT final exam) */}
          {(!isPassed && !isFinalExam) && (
            <div className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-50 border border-slate-100/50 w-fit mx-auto">
              <RefreshCcw className="size-4 text-brand-orange" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attempts Left:</span>
              <span className={cn(
                "text-sm font-bold",
                attemptsRemaining === 0 ? "text-brand-orange" : "text-primary"
              )}>
                {attemptsRemaining}
              </span>
            </div>
          )}

          <div className="pt-8 border-t border-slate-50 space-y-4">
            {(!isPassed && (attemptsRemaining > 0 || isFinalExam)) ? (
              <Button
                onClick={onRetry}
                className="w-full h-16 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/95 shadow-xl shadow-primary/10 group"
              >
                <RefreshCcw className="size-5 mr-2 transition-transform group-hover:rotate-180 duration-500" />
                Try Again
              </Button>
            ) : (isPassed && isFinalExam) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/campus" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-16 rounded-2xl text-lg font-bold border-2 border-primary/10 text-primary hover:bg-slate-50 shadow-sm"
                  >
                    <ArrowLeft className="size-5 mr-2" />
                    Back to Campus
                  </Button>
                </Link>
                <Link href="/campus/certificates" className="block">
                  <Button
                    className="w-full h-16 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/95 shadow-xl shadow-primary/10 group"
                  >
                    Generate Certificate
                    <ArrowRight className="size-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href={nextItemUrl || `/campus/courses/${exam.course_id}`} className="block">
                <Button
                  className="w-full h-16 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/95 shadow-xl shadow-primary/10 group"
                >
                  {nextItemUrl ? (
                    <>
                      Continue
                      <ArrowRight className="size-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="size-5 mr-2 transition-transform group-hover:-translate-x-1" />
                      Back to Course
                    </>
                  )}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
