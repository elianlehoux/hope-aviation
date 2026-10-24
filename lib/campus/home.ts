import { cache } from "react";
import { getLearnerUser } from "@/lib/campus/learning";
import type { TranslatedText } from "@/types/database";

export type CourseSummary = {
  id: string;
  title: TranslatedText;
  description: TranslatedText | null;
  thumbnailUrl: string | null;
  moduleCount: number;
  lessonCount: number;
};

export type MyCourse = CourseSummary & {
  status: "active" | "completed";
  progress: number;
  completedLessons: number;
  enrolledAt: string;
};

export type LearnerHome = {
  firstName: string;
  profileComplete: boolean;
  roles: string[];
  myCourses: MyCourse[];
  catalog: CourseSummary[];
};

type CourseRow = {
  id: string;
  title: TranslatedText;
  description: TranslatedText | null;
  thumbnail_url: string | null;
  subjects: { classes: { id: string; lesson_progress?: { is_completed: boolean }[] }[] }[];
};

function summarize(course: CourseRow): CourseSummary {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnailUrl: course.thumbnail_url,
    moduleCount: course.subjects?.length ?? 0,
    lessonCount: (course.subjects ?? []).reduce((n, s) => n + (s.classes?.length ?? 0), 0),
  };
}

/**
 * Everything the campus home and "Courses" page need, in three parallel queries.
 * Progress rows are filtered to the current user (staff can read other learners' rows).
 */
export const getLearnerHome = cache(async (): Promise<LearnerHome | null> => {
  const { supabase, user } = await getLearnerUser();
  if (!user) return null;

  const [profileRes, rolesRes, enrollmentsRes, catalogRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, last_name, birth_date, country_code")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("roles_users").select("roles(slug)").eq("user_id", user.id),
    supabase
      .from("enrollments")
      .select(
        `course_id, status, enrolled_at,
         courses ( id, title, description, thumbnail_url,
           subjects ( classes ( id, lesson_progress ( is_completed ) ) ) )`,
      )
      .eq("user_id", user.id)
      .in("status", ["active", "completed"])
      .eq("courses.subjects.classes.lesson_progress.user_id", user.id)
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("courses")
      .select("id, title, description, thumbnail_url, subjects ( classes ( id ) )")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const roles = (rolesRes.data ?? [])
    .map((r) => {
      const rel = r.roles as { slug?: string } | { slug?: string }[] | null;
      return Array.isArray(rel) ? rel[0]?.slug : rel?.slug;
    })
    .filter((s): s is string => Boolean(s));

  const myCourses: MyCourse[] = (enrollmentsRes.data ?? [])
    .filter((e) => e.courses)
    .map((e) => {
      const course = e.courses as unknown as CourseRow;
      const summary = summarize(course);
      const completedLessons = (course.subjects ?? []).reduce(
        (n, s) => n + (s.classes ?? []).filter((c) => c.lesson_progress?.some((p) => p.is_completed)).length,
        0,
      );
      const status = e.status as "active" | "completed";
      return {
        ...summary,
        status,
        enrolledAt: e.enrolled_at,
        completedLessons,
        progress:
          status === "completed"
            ? 100
            : summary.lessonCount
              ? Math.round((completedLessons / summary.lessonCount) * 100)
              : 0,
      };
    });

  const enrolled = new Set(myCourses.map((c) => c.id));
  const catalog = ((catalogRes.data ?? []) as unknown as CourseRow[])
    .filter((c) => !enrolled.has(c.id))
    .map(summarize);

  return {
    firstName: profile?.first_name?.trim() || user.email?.split("@")[0] || "",
    profileComplete: Boolean(
      profile?.first_name && profile?.last_name && profile?.birth_date && profile?.country_code,
    ),
    roles,
    myCourses,
    catalog,
  };
});
