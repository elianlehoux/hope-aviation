"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, Video, FileText, Clock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Class {
  id: string;
  title: any;
  duration_minutes?: number;
  video_url?: string;
  resource_url?: string;
}

interface Subject {
  id: string;
  title: any;
  description?: any;
  classes: Class[];
}

interface CourseCurriculumProps {
  subjects: Subject[];
}

export function CourseCurriculum({ subjects }: CourseCurriculumProps) {
  const lang = "en"; // Default to English for now

  if (!subjects?.length) {
    return (
      <div className="py-12 text-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50">
        <p className="text-slate-400 font-medium italic">Curriculum details coming soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-3 px-1">
        <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
          <BookOpen className="size-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-primary">Course Content</h2>
      </div>

      <Accordion type="multiple" defaultValue={[subjects[0]?.id]} className="w-full space-y-4">
        {subjects.map((subject, index) => {
          const subjectTitle = typeof subject.title === "string" ? subject.title : (subject.title?.[lang] || "Untitled Module");
          
          return (
            <AccordionItem 
              key={subject.id} 
              value={subject.id} 
              className="bg-white border border-slate-100 rounded-2xl px-6 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5 transition-all duration-300"
            >
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xs font-bold text-slate-400 border border-slate-100">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4 className="text-lg font-bold tracking-tight text-primary leading-tight">
                      {subjectTitle}
                    </h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                      {subject.classes?.length || 0} Lessons • {subject.classes?.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0) || 0} Minutes
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 border-t border-slate-50 pt-4">
                <div className="space-y-2">
                  {subject.classes?.length > 0 ? (
                    subject.classes.map((cls) => {
                      const classTitle = typeof cls.title === "string" ? cls.title : (cls.title?.[lang] || "Untitled Lesson");
                      return (
                        <div 
                          key={cls.id} 
                          className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                        >
                          <div className="flex items-center gap-4">
                            <div className="size-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                              {cls.video_url ? <PlayCircle className="size-4" /> : <FileText className="size-4" />}
                            </div>
                            <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">
                              {classTitle}
                            </span>
                          </div>
                          {cls.duration_minutes && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-50">
                              <Clock className="size-3" />
                              {cls.duration_minutes}m
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="px-4 py-2 text-xs text-slate-400 italic">No lessons in this module yet.</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
