"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { enrollInCourse } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface EnrollmentActionProps {
  courseId: string;
  isEnrolled: boolean;
}

export function EnrollmentAction({ courseId, isEnrolled }: EnrollmentActionProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleEnroll = () => {
    startTransition(async () => {
      try {
        const res = await enrollInCourse(courseId);
        if (res.success) {
          toast.success("Enrolled successfully! Redirecting...");
          router.push(`/campus/courses/${courseId}/learn`);
          router.refresh();
        } else {
          toast.error(res.error || "Failed to enroll. Please try again.");
        }
      } catch (err) {
        toast.error("Internal connection error. Please try again.");
      }
    });
  };

  if (isEnrolled) {
    return (
      <Button asChild className="w-full md:w-auto h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 group">
        <Link href={`/campus/courses/${courseId}/learn`} className="flex items-center gap-3">
          Continue Learning
          <PlayCircle className="size-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleEnroll}
      disabled={isPending}
      className="w-full md:w-auto h-14 px-10 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-lg shadow-xl shadow-brand-orange/20 transition-all active:scale-95 group"
    >
      {isPending ? (
        <>
          <Loader2 className="size-5 animate-spin mr-2" />
          Processing...
        </>
      ) : (
        <>
          Enroll Now
          <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform ml-2" />
        </>
      )}
    </Button>
  );
}
