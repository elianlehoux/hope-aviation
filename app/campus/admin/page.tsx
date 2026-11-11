import { redirect } from "next/navigation";

export default function AdminHomePage() {
  redirect("/campus/admin/courses");
}
