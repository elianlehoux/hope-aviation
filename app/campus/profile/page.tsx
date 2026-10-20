"use client";

import { ProfileForm } from "@/components/features/campus/ProfileForm";
import { CampusPageHeader } from "@/components/features/campus/ui/page-header";
import { useTranslation } from "@/lib/i18n/context";

export default function ProfilePage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <CampusPageHeader
        title={t("profile.pageTitle")}
        description={t("profile.pageDescription")}
      />
      <ProfileForm />
    </div>
  );
}
