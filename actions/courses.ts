"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Enrolls the current authenticated user into a specific course.
 */
export async function enrollInCourse(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  // Double-check if the course exists and is published
  const { data: course } = await supabase
    .from("courses")
    .select("status")
    .eq("id", courseId)
    .single();

  if (!course || course.status !== "published") {
    return { success: false, error: "Course not available for enrollment." };
  }

  // Attempt to enroll
  const { error } = await supabase.from("enrollments").insert({
    user_id: user.id,
    course_id: courseId,
    status: "active",
  });

  if (error) {
    // Check for unique constraint (already enrolled)
    if (error.code === "23505") {
      return { success: true };
    }
    return { success: false, error: error.message };
  }

  // Revalidate to update the "My Learning" dashboard and the current page
  revalidatePath("/campus/courses");
  revalidatePath(`/campus/courses/${courseId}`);

  return { success: true };
}
