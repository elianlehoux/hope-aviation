import { redirect } from "next/navigation";
import { getLearnerHome } from "@/lib/campus/home";
import { isCampusPreviewEnabled } from "@/lib/dev/campus-preview";
import { CampusDashboardContent } from "@/components/features/campus/CampusDashboardContent";

export async function CampusDashboard() {
  const home = await getLearnerHome();
  if (!home) {
    if (isCampusPreviewEnabled()) return null;
    redirect("/auth/login?clear=1");
  }
  return <CampusDashboardContent home={home} />;
}
