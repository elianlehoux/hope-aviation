import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampusDashboardContent } from "@/components/features/campus/CampusDashboardContent";
import {
  isCampusPreviewEnabled,
  parsePreviewRole,
  PREVIEW_COOKIE,
} from "@/lib/dev/campus-preview";

export async function CampusDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isCampusPreviewEnabled()) return null;
    redirect("/auth/login?clear=1");
  }

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

  const { data: roleRows } = await supabase
    .from("roles_users")
    .select("roles(slug)")
    .eq("user_id", user.id);

  const dbRoles = (roleRows || [])
    .map((r: { roles?: { slug?: string } | { slug?: string }[] | null }) => {
      const rel = r.roles;
      if (Array.isArray(rel)) return rel[0]?.slug;
      return rel?.slug;
    })
    .filter((s): s is string => Boolean(s));

  const cookieStore = await cookies();
  const previewRole = parsePreviewRole(cookieStore.get(PREVIEW_COOKIE)?.value);
  const roles =
    isCampusPreviewEnabled() && previewRole ? [previewRole] : dbRoles;

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      `
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
    `,
    )
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false });

  const enrichedEnrollments = (enrollments || []).map((enrollment) => {
    const course = enrollment.courses;
    let totalClasses = 0;
    let completedClasses = 0;

    course?.subjects?.forEach(
      (subject: { classes?: { lesson_progress?: { is_completed: boolean }[] }[] }) => {
        subject.classes?.forEach((cls) => {
          totalClasses++;
          if (cls.lesson_progress?.[0]?.is_completed) {
            completedClasses++;
          }
        });
      },
    );

    return {
      ...enrollment,
      progress: totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0,
      total_classes: totalClasses,
      completed_classes: completedClasses,
    };
  });

  const activeEnrollments = enrichedEnrollments.filter((e) => e.status === "active");
  const completedEnrollments = enrichedEnrollments.filter((e) => e.status === "completed");
  const enrolledCourseIds = enrollments?.map((e) => e.course_id) || [];

  const { data: catalogCourses } = await supabase
    .from("courses")
    .select("*, subjects(count)")
    .eq("status", "published")
    .not(
      "id",
      "in",
      `(${enrolledCourseIds.length > 0 ? enrolledCourseIds.join(",") : "00000000-0000-0000-0000-000000000000"})`,
    )
    .order("created_at", { ascending: false });

  const activeCoursesCount = activeEnrollments.length;
  const completedCoursesCount = completedEnrollments.length;
  const totalCompletedLessons = enrichedEnrollments.reduce(
    (acc, curr) => acc + curr.completed_classes,
    0,
  );

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
        averageProgress,
      }}
      profile={profile}
    />
  );
}
