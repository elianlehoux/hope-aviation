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

/**
 * Fetches all data needed for the learning interface, including exams and progress.
 */
export async function getCourseLearningData(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Fetch course with subjects, classes, and exams
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select(`
      *,
      subjects (
        *,
        classes (
          *,
          lesson_progress!left (
            is_completed
          )
        ),
        exams (
          *,
          exam_attempts!left (
            id,
            score,
            passed,
            started_at,
            finished_at
          )
        )
      )
    `)
    .eq("id", courseId)
    .order("order_index", { foreignTable: "subjects" })
    .order("order_index", { foreignTable: "subjects.classes" })
    .order("order_index", { foreignTable: "subjects.exams" })
    .maybeSingle();

  if (courseError || !course) {
    if (courseError) console.error("Error fetching learning data:", courseError);
    return null;
  }

  return course;
}

/**
 * Toggles the completion status of a lesson for the current user.
 */
export async function toggleLessonCompletion(courseId: string, classId: string, isCompleted: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("lesson_progress")
    .upsert({
      user_id: user.id,
      class_id: classId,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null
    }, { onConflict: "user_id,class_id" });

  if (error) {
    console.error("Error toggling lesson completion:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/campus/courses/${courseId}/learn`);
  return { success: true };
}

/**
 * Marks all classes in a module (subject) as completed for the current user.
 * Called automatically when a student passes a module exam so they receive
 * full credit for the module even if they skipped individual lessons.
 */
export async function markModuleCompleted(courseId: string, subjectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Fetch all class IDs in this subject
  const { data: classes, error: fetchError } = await supabase
    .from("classes")
    .select("id")
    .eq("subject_id", subjectId);

  if (fetchError || !classes?.length) {
    console.error("Error fetching classes for module completion:", fetchError);
    return { success: false, error: fetchError?.message || "No classes found" };
  }

  // Bulk upsert completion records for every class in the module
  const now = new Date().toISOString();
  const records = classes.map((cls) => ({
    user_id: user.id,
    class_id: cls.id,
    is_completed: true,
    completed_at: now,
  }));

  const { error: upsertError } = await supabase
    .from("lesson_progress")
    .upsert(records, { onConflict: "user_id,class_id" });

  if (upsertError) {
    console.error("Error bulk-completing module:", upsertError);
    return { success: false, error: upsertError.message };
  }

  revalidatePath(`/campus/courses/${courseId}/learn`);
  return { success: true };
}

