import { redirect } from "next/navigation";

export default function AdminEnrollmentsRedirect() {
  redirect("/campus/admin/user-management");
}
