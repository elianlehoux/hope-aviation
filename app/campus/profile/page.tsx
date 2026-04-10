"use client";

import { Metadata } from "next";
import { ProfileForm } from "@/components/features/campus/ProfileForm";
import { Title } from "@/components/ui/title";
import { useTranslation } from "@/lib/i18n/context";

export default function ProfilePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Title level="h3" as="h1">
          {t("profile.pageTitle")}
        </Title>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          {t("profile.pageDescription")}
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
