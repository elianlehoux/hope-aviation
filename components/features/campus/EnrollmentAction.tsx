"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { enrollInCourse } from "@/actions/courses";
import { useTranslation } from "@/lib/i18n/context";

export function EnrollmentAction({ courseId, isEnrolled }: { courseId: string; isEnrolled: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useTranslation();

  if (isEnrolled) {
    return (
      <Button asChild size="lg">
        <Link href={`/campus/courses/${courseId}/learn`}>
          {t("enrollment.continueLearning")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Button>
    );
  }

  const enroll = () =>
    startTransition(async () => {
      const res = await enrollInCourse(courseId);
      if (!res.success) {
        toast.error(res.error || t("enrollment.enrollFailed"));
        return;
      }
      toast.success(t("enrollment.enrolledSuccess"));
      router.push(`/campus/courses/${courseId}/learn`);
    });

  return (
    <Button size="lg" onClick={enroll} disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {pending ? t("enrollment.processing") : t("enrollment.enrollNow")}
      {!pending ? <ArrowRight className="size-4" aria-hidden /> : null}
    </Button>
  );
}
