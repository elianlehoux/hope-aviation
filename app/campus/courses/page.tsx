import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getLearnerHome } from "@/lib/campus/home";
import { CoursesIndex } from "@/components/features/campus/courses/CoursesIndex";

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="mx-auto h-64 max-w-6xl animate-pulse rounded-2xl bg-primary/5" />}>
      <Courses />
    </Suspense>
  );
}

async function Courses() {
  const home = await getLearnerHome();
  if (!home) redirect("/auth/login?clear=1");
  return <CoursesIndex myCourses={home.myCourses} catalog={home.catalog} />;
}
