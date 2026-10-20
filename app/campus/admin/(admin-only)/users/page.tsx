import UsersPanel from "@/components/features/admin/UsersPanel";

export const metadata = {
  title: "Users — Hope Aviation Admin",
  description:
    "Manage user accounts, role assignments, and account status for Hope Aviation.",
};

/**
 * Admin Users page — searchable user management with role assignment,
 * profile editing, and account activation controls.
 */
export default function AdminUsersPage() {
  return <UsersPanel />;
}
