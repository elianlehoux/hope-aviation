"use client";

import * as React from "react";
import Link from "next/link";
import { Play, CheckCircle2, ChevronRight, Clock, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

interface StudentCourseCardProps {
  course: {
    id: string;
    title: any;
    description?: any;
    thumbnail_url?: string;
    subjects?: any[] | { count: number };
  };
  enrollment?: {
    status: "active" | "completed";
    progress?: number; // Calculated elsewhere or 0
    enrolled_at: string;
  };
  variant?: "active" | "completed" | "available";
}

export function StudentCourseCard({ course, enrollment, variant = "available" }: StudentCourseCardProps) {
  const { t, lang } = useTranslation();
  const title = typeof course.title === "string" ? course.title : (course.title?.[lang] || t("courseCard.untitledCourse"));
  const description = typeof course.description === "string" ? course.description : (course.description?.[lang] || "");
  
  const isCompleted = variant === "completed";
  const isActive = variant === "active";
  const isAvailable = variant === "available";

  // Mock progress for now if not provided
  const progress = enrollment?.progress ?? (isCompleted ? 100 : 0);

  const getModuleCount = () => {
    if (!course.subjects) return 0;
    if (Array.isArray(course.subjects)) {
      // Handle the case where Supabase returns [{ count: N }] for the catalog query
      if (course.subjects.length === 1 && typeof (course.subjects[0] as any).count === 'number') {
        return (course.subjects[0] as any).count;
      }
      return course.subjects.length;
    }
    if (typeof course.subjects === 'object') {
      return (course.subjects as any).count || 0;
    }
    return 0;
  };

  const moduleCount = getModuleCount();

  return (
    <Card className="group relative flex flex-col h-full bg-white border-slate-100 shadow-xs hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-700">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail_url || "/images/placeholder-course.jpg"}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          {isActive && (
            <Badge className="bg-brand-orange text-white border-none shadow-lg animate-pulse">
              <Clock className="size-3 mr-1.5" />
              {t("courseCard.inProgress")}
            </Badge>
          )}
          {isCompleted && (
            <Badge className="bg-emerald-500 text-white border-none shadow-lg">
              <CheckCircle2 className="size-3 mr-1.5" />
              {t("courseCard.completed")}
            </Badge>
          )}
        </div>

        {/* Floating Action Button for active/completed */}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
            <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
              {isActive ? (
                <Play className="size-8 text-white fill-white ml-1" />
              ) : (
                <CheckCircle2 className="size-8 text-white" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-400">
            <BookOpen className="size-3" />
            {moduleCount} {t("courseCard.modules")}
          </div>
          <h3 className="text-xl font-bold tracking-tight text-primary leading-tight group-hover:text-accent transition-colors">
            {title}
          </h3>
        </div>

        <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed flex-1">
          {description}
        </p>

        {/* Progress Section */}
        {!isAvailable && (
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end text-xs font-bold text-slate-500">
              <span>{t("courseCard.yourProgress")}</span>
              <span className={cn(isCompleted ? "text-emerald-600" : "text-brand-orange")}>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-50" />
          </div>
        )}

        {/* Footer Action */}
        <div className="pt-4 border-t border-slate-50">
          <Link
            href={isActive ? `/campus/courses/${course.id}/learn` : `/campus/courses/${course.id}`}
            className="flex items-center justify-between w-full group/btn"
          >
            <span className="text-sm font-bold text-primary group-hover/btn:translate-x-2 transition-transform duration-300">
              {isActive ? t("courseCard.continueLearning") : isCompleted ? t("courseCard.reviewContent") : t("courseCard.exploreCourse")}
            </span>
            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-white transition-all duration-300">
              <ChevronRight className="size-4" />
            </div>
          </Link>
        </div>
      </div>
    </Card>
  );
}
