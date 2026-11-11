"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { CampusSurface } from "@/components/features/campus/ui/surface";

export function ProfileCompletionBanner() {
  const { t } = useTranslation();

  return (
    <CampusSurface className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-display text-lg font-bold text-primary">{t("profileBanner.title")}</h3>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-primary/65">
          {t("profileBanner.description")}
        </p>
      </div>
      <Button asChild>
        <Link href="/campus/profile">
          {t("profileBanner.finishSetup")}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </CampusSurface>
  );
}
