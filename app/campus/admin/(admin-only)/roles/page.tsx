import RolesPanel from "@/components/features/admin/RolesPanel";

export const metadata = {
  title: "Roles — Hope Aviation Admin",
  description: "Manage platform roles and permissions for Hope Aviation.",
};

/**
 * Admin Roles page — CRUD for role definitions used across
 * the platform (admin, instructor, student, and custom roles).
 */
export default function AdminRolesPage() {
  return <RolesPanel />;
}
