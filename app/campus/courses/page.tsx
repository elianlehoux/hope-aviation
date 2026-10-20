import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { StudentCourseCard } from "@/components/features/campus/StudentCourseCard";
import { T } from "@/lib/i18n/context";

export const instant = false;

export default async function StudentCoursesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch Active & Completed Enrollments with full class structure for progress calculation
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *, 
      courses (
        *, 
        subjects (
          classes (
            id,
            lesson_progress!left (
              is_completed
            )
          )
        )
      )
    `)
    .eq("user_id", user?.id)
    .order("enrolled_at", { ascending: false });

  // Map enrollments to calculate real-time progress
  const enrichedEnrollments = (enrollments || []).map(enrollment => {
    const course = enrollment.courses;
    let totalClasses = 0;
    let completedClasses = 0;

    course?.subjects?.forEach((subject: any) => {
      subject.classes?.forEach((cls: any) => {
        totalClasses++;
        if (cls.lesson_progress?.[0]?.is_completed) {
          completedClasses++;
        }
      });
    });

    return {
      ...enrollment,
      progress: totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0,
      total_classes: totalClasses,
      completed_classes: completedClasses
    };
  });

  const activeEnrollments = enrichedEnrollments.filter(e => e.status === "active");
  const completedEnrollments = enrichedEnrollments.filter(e => e.status === "completed");
  
  // 2. Fetch Catalog (Published) - simplified for available classes
  const enrolledCourseIds = enrollments?.map(e => e.course_id) || [];
  
  const { data: catalogCourses } = await supabase
    .from("courses")
    .select("*, subjects(count)")
    .eq("status", "published")
    .not("id", "in", `(${enrolledCourseIds.length > 0 ? enrolledCourseIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
    .order("created_at", { ascending: false });


  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-16">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-primary md:text-[2rem]">
          <T k="studentCourses.myAcademy" />
        </h1>
        <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-primary/60">
          <T k="studentCourses.myAcademyDesc" />
        </p>
      </div>

      {/* Active Courses Section */}
      {activeEnrollments.length > 0 && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="font-display text-2xl font-bold tracking-tight text-primary">
            <T k="studentCourses.continueLearning" />
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeEnrollments.map((e) => (
              <StudentCourseCard 
                key={e.id} 
                course={e.courses} 
                enrollment={e} 
                variant="active" 
              />
            ))}
          </div>
        </section>
      )}

      {/* Catalog Section */}
      <section className="space-y-5">
        <h2 className="font-display text-2xl font-bold tracking-tight text-primary">
          <T k="studentCourses.exploreCatalog" />
        </h2>
        {catalogCourses && catalogCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {catalogCourses.slice(0, 6).map((course) => (
              <StudentCourseCard key={course.id} course={course} variant="available" />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-primary/10 bg-white px-6 py-12 text-center text-sm text-primary/50">
            <T k="studentCourses.emptyCatalog" />
          </p>
        )}
      </section>

      {/* Completed Section */}
      {completedEnrollments.length > 0 && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="font-display text-2xl font-bold tracking-tight text-primary">
            <T k="studentCourses.certificationsTitle" />
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-80 hover:opacity-100 transition-opacity">
            {completedEnrollments.map((e) => (
              <StudentCourseCard 
                key={e.id} 
                course={e.courses} 
                enrollment={e} 
                variant="completed" 
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
