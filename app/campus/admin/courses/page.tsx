import CoursesPanel from "@/components/features/admin/CoursesPanel";

export const metadata = {
  title: "Cursos — Hope Aviation Admin",
  description: "Manage platform courses globally for Hope Aviation.",
};

/**
 * Full course catalog — all statuses.
 */
export default function AdminCoursesPage() {
  return <CoursesPanel />;
}
