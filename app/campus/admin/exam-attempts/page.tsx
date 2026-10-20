import { redirect } from "next/navigation";

export default function AdminExamAttemptsRedirect() {
  redirect("/campus/admin/user-management");
}
