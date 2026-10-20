import { redirect } from "next/navigation";

export default function ProfessorsHomeRedirect() {
  redirect("/campus/admin/courses");
}
