import { redirect } from "next/navigation";

export default function ProfessorsCoursesRedirect() {
  redirect("/campus/admin/courses");
}
