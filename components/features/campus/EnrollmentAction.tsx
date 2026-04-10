"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { enrollInCourse } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";

interface EnrollmentActionProps {
  courseId: string;
  isEnrolled: boolean;
}

export function EnrollmentAction({ courseId, isEnrolled }: EnrollmentActionProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useTranslation();

  const handleEnroll = () => {
    startTransition(async () => {
      try {
        const res = await enrollInCourse(courseId);
        if (res.success) {
          toast.success(t("enrollment.enrolledSuccess"));
          router.push(`/campus/courses/${courseId}/learn`);
          router.refresh();
        } else {
          toast.error(res.error || t("enrollment.enrollFailed"));
        }
      } catch (err) {
        toast.error(t("enrollment.connectionError"));
      }
    });
  };

  if (isEnrolled) {
    return (
      <Button asChild className="w-full md:w-auto h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 group">
        <Link href={`/campus/courses/${courseId}/learn`} className="flex items-center gap-3">
          {t("enrollment.continueLearning")}
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
          {t("enrollment.processing")}
        </>
      ) : (
        <>
          {t("enrollment.enrollNow")}
          <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform ml-2" />
        </>
      )}
    </Button>
  );
}
