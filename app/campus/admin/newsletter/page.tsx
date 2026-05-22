import { NewsletterAdminPanel } from "@/components/features/admin/NewsletterAdminPanel";

export const metadata = {
  title: "Newsletter — Hope Aviation Admin",
  description: "Manage subscribers and dispatch updates.",
};

/**
 * Admin Newsletter page — dashboard and email dispatch controls.
 */
export default function AdminNewsletterPage() {
  return <NewsletterAdminPanel />;
}
