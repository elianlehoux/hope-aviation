import { NewsletterAdminPanel } from "@/components/features/admin/NewsletterAdminPanel";

export const metadata = {
  title: "Boletín — Hope Aviation",
  description: "Manage subscribers and dispatch updates.",
};

/**
 * Admin newsletter page: subscriber stats and email dispatch.
 */
export default function AdminNewsletterPage() {
  return <NewsletterAdminPanel />;
}
