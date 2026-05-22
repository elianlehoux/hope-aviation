import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { CampusDashboardContent } from "@/components/features/campus/CampusDashboardContent";

/**
 * Campus Dashboard — Unified Home page for course tracking, catalog exploration,
 * and quick-access hubs for staff/admin.
 */
export default async function CampusDashboardPage() {
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
  if (!user) {
    redirect("/auth/login?clear=1");
  }

  // 1. Profile completion check
  let showBanner = false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, birth_date, country_code")
    .eq("id", user.id)
    .single();
  
  if (profile) {
    const isComplete = 
      profile.first_name && 
      profile.last_name && 
      profile.birth_date && 
      profile.country_code;

    showBanner = !isComplete;
  }

  // 2. Fetch User Roles
  const { data: roleRows } = await supabase
    .from("roles_users")
    .select("roles(slug)")
    .eq("user_id", user.id);
  
  const roles = (roleRows || [])
    .map((r: any) => r.roles?.slug)
    .filter((s): s is string => Boolean(s));

  // 3. Fetch Active & Completed Enrollments with full class structure for progress calculation
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
    .eq("user_id", user.id)
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

  // 4. Fetch Course Catalog (excluding currently enrolled courses)
  const enrolledCourseIds = enrollments?.map(e => e.course_id) || [];
  
  const { data: catalogCourses } = await supabase
    .from("courses")
    .select("*, subjects(count)")
    .eq("status", "published")
    .not("id", "in", `(${enrolledCourseIds.length > 0 ? enrolledCourseIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
    .order("created_at", { ascending: false });

  // 5. Calculate statistics for the dashboard
  const activeCoursesCount = activeEnrollments.length;
  const completedCoursesCount = completedEnrollments.length;
  
  // Total completed lessons
  const totalCompletedLessons = enrichedEnrollments.reduce((acc, curr) => acc + curr.completed_classes, 0);

  // Average progress across active courses
  let averageProgress = 0;
  if (activeCoursesCount > 0) {
    const totalProgress = activeEnrollments.reduce((acc, curr) => acc + curr.progress, 0);
    averageProgress = Math.round(totalProgress / activeCoursesCount);
  }

  return (
    <CampusDashboardContent 
      showBanner={showBanner}
      activeEnrollments={activeEnrollments}
      completedEnrollments={completedEnrollments}
      catalogCourses={catalogCourses || []}
      roles={roles}
      stats={{
        activeCoursesCount,
        completedCoursesCount,
        totalCompletedLessons,
        averageProgress
      }}
      profile={profile}
    />
  );
}
