import { createClient } from "@/lib/supabase/server";
import { CoursesGallery, type CourseData } from "@/components/features/landing/CoursesGallery";
import type { TranslatedText } from "@/types/database";

type CourseRow = {
  id: string;
  title: TranslatedText;
  description: TranslatedText | null;
  thumbnail_url: string | null;
  status: string;
  subjects: { classes: { id: string }[] | null }[] | null;
};

/**
 * Server wrapper that loads up to three published courses with the visitor's
 * session. RLS only exposes courses to signed-in users, so anonymous visitors
 * get an empty list and the gallery shows the training areas instead.
 * Must be rendered inside <Suspense> (reads cookies).
 */
export async function FeaturedCourses() {
  let courses: CourseData[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail_url, status, subjects ( classes ( id ) )")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(3);

    courses = ((data ?? []) as unknown as CourseRow[]).map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      thumbnail_url: c.thumbnail_url,
      status: c.status,
      moduleCount: c.subjects?.length ?? 0,
      lessonCount: (c.subjects ?? []).reduce((n, s) => n + (s.classes?.length ?? 0), 0),
    }));
  } catch {
    // The landing must render even if Supabase is unreachable.
    courses = [];
  }

  return <CoursesGallery courses={courses} />;
}
