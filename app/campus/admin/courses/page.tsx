import { Suspense } from "react";
import { listManagedCourses } from "@/lib/campus/manage";
import { CourseList } from "@/components/features/manage/course/CourseList";

export const metadata = {
  title: "Cursos — Hope Aviation",
  description: "Course management for Hope Aviation staff.",
};

export default function AdminCoursesPage() {
  return (
    <Suspense fallback={<CourseListSkeleton />}>
      <Courses />
    </Suspense>
  );
}

async function Courses() {
  const courses = await listManagedCourses();
  return <CourseList courses={courses} />;
}

function CourseListSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8" aria-hidden>
      <div className="space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-primary/5" />
        <div className="h-9 w-48 animate-pulse rounded-lg bg-primary/5" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded bg-primary/5" />
      </div>
      <div className="h-9 w-80 max-w-full animate-pulse rounded-full bg-primary/5" />
      <div className="h-64 animate-pulse rounded-2xl bg-primary/5" />
    </div>
  );
}
