import UserManagementPanel from "@/components/features/admin/UserManagementPanel";

export const metadata = {
  title: "User Management — Hope Aviation",
  description: "Monitor student progress and manage academic history.",
};

/**
 * Dedicated User Management page.
 * Isolated from core user/role administration.
 * Accessible to admins and instructors.
 */
export default function UserManagementPage() {
  return <UserManagementPanel />;
}
