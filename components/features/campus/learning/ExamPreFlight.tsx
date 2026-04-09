"use client";

import { ClipboardCheck, Clock, RefreshCcw, HelpCircle, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ExamPreFlightProps {
  exam: any;
  questionCount: number;
  onStart: () => void;
}

export function ExamPreFlight({ exam, questionCount, onStart }: ExamPreFlightProps) {
  const lang = "en";
  const title = typeof exam.title === "string" ? exam.title : (exam.title?.[lang] || "Assessment");
  const description = typeof exam.description === "string" ? exam.description : (exam.description?.[lang] || "Please read the instructions carefully before starting.");
  
  const attempts = exam.exam_attempts || [];
  const finishedAttempts = attempts.filter((a: any) => a.finished_at).length;
  const attemptsRemaining = Math.max(0, exam.max_attempts - finishedAttempts);
  
  const isExhausted = attemptsRemaining <= 0;
  const lastScore = attempts.length > 0 ? attempts[0].score : null;
  const hasPassed = attempts.some((a: any) => a.passed);

  return (
    <div className="flex-1 flex flex-col items-center pt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-primary p-8 md:p-12 text-center space-y-4">
          <div className="mx-auto size-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <ClipboardCheck className="size-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {hasPassed && (
                <Badge className="bg-emerald-500 text-white border-none px-4 py-1 text-[10px] uppercase tracking-widest font-bold">
                  Passed
                </Badge>
              )}
              <Badge className="bg-white/10 text-white border-white/20 px-4 py-1 text-[10px] uppercase tracking-widest font-bold">
                {questionCount} Questions
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-12 space-y-10">
          {!hasPassed && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary tracking-tight">Instructions</h3>
              <p className="text-slate-500 leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {!hasPassed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem 
                icon={<Clock className="size-5 text-accent" />}
                label="Time Limit"
                value={exam.time_limit_minutes ? `${exam.time_limit_minutes} minutes` : "No limit"}
              />
              <InfoItem 
                icon={<RefreshCcw className="size-5 text-brand-orange" />}
                label="Attempts"
                value={`${finishedAttempts} of ${exam.max_attempts} used`}
                description={isExhausted ? "No attempts remaining" : `${attemptsRemaining} attempts left`}
              />
              <InfoItem 
                icon={<HelpCircle className="size-5 text-primary" />}
                label="Passing Score"
                value={`${exam.passing_score}%`}
              />
              <InfoItem 
                icon={<AlertTriangle className="size-5 text-rose-500" />}
                label="Proctoring"
                value="Once started, you cannot navigate away."
              />
            </div>
          )}

          <div className="pt-4 border-t border-slate-50 space-y-4">
            {hasPassed ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-4 text-emerald-600">
                <ClipboardCheck className="size-5 shrink-0" />
                <p className="text-sm font-bold">
                  You have successfully passed this exam and it cannot be retaken.
                </p>
              </div>
            ) : isExhausted ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-4 text-rose-600">
                <AlertTriangle className="size-5 shrink-0" />
                <p className="text-sm font-bold">
                  You have reached the maximum number of attempts for this exam.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  onClick={onStart}
                  className="w-full h-16 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/95 shadow-xl shadow-primary/10 group"
                >
                  Start Examination
                  <ArrowRight className="size-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  By clicking Start, you agree to follow the examination rules.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, description }: { icon: React.ReactNode, label: string, value: string, description?: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="space-y-0.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="text-sm font-bold text-primary">{value}</div>
        {description && <div className="text-[10px] font-medium text-slate-500 italic">{description}</div>}
      </div>
    </div>
  );
}
