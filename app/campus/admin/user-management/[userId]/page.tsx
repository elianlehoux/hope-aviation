import UserAcademicDetail from "@/components/features/admin/UserAcademicDetail";
import { parseUuidParam } from "@/lib/api/params";
import { notFound } from "next/navigation";

interface UserPageProps {
  params: Promise<{ userId: string }>;
}

export const metadata = {
  title: "Student Progress — Hope Aviation",
};

/**
 * NEW: Dedicated student detail page for staff.
 * Shows academic progress, enrollments, and exam attempts.
 * Allows resetting attempts by deleting old records.
 */
export default async function StudentDetailPage({ params }: UserPageProps) {
  const { userId: rawId } = await params;
  const userId = parseUuidParam(rawId);

  if (!userId) return notFound();

  return <UserAcademicDetail userId={userId} />;
}
