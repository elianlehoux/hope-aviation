"use client";

import { useTranslation } from "@/lib/i18n/context";
import { CampusPageHeader } from "@/components/features/campus/ui/page-header";
import { CampusEmpty } from "@/components/features/campus/ui/surface";

export default function CertificatesPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <CampusPageHeader
        title={t("certificates.title")}
        description={t("certificates.description")}
      />
      <CampusEmpty title={t("certificates.comingSoon")} />
    </div>
  );
}
