import { Metadata } from "next";
import { ProfileForm } from "@/components/features/campus/ProfileForm";
import { Title } from "@/components/ui/title";

export const metadata: Metadata = {
  title: "My Profile | Hope Aviation",
  description: "Manage your personal information and preferences.",
};

export default function ProfilePage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Title level="h3" as="h1">
          My Profile
        </Title>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Personalize your account and manage your contact details.
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
