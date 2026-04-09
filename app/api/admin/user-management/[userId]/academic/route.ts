import { createClient } from "@/lib/supabase/server";
import { requireStaff, requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";

type RouteContext = { params: Promise<{ userId: string }> };

/**
 * NEW: API to fetch comprehensive academic details for a specific student.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { userId: rawId } = await context.params;
  const userId = parseUuidParam(rawId);
  if (!userId) {
    return jsonError("validation_error", "Invalid user id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  // New page is for staff (admins + instructors)
  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) return staff.response;

  // 1. Fetch Basic Profile (Confirm user exists)
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, avatar_url, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (pErr) return responseFromPostgrestError(pErr);
  if (!profile) return jsonError("not_found", "User not found.", 404);

  // 2. Fetch Enrollments with Course titles
  const { data: enrollments, error: eErr } = await supabase
    .from("enrollments")
    .select(`
      id,
      status,
      enrolled_at,
      courses (
        id,
        title,
        thumbnail_url
      )
    `)
    .eq("user_id", userId);

  if (eErr) return responseFromPostgrestError(eErr);

  // 3. Fetch Exam Attempts with Exam and Subject details
  const { data: attempts, error: aErr } = await supabase
    .from("exam_attempts")
    .select(`
      id,
      score,
      passed,
      finished_at,
      exam_id,
      exams (
        id,
        title,
        max_attempts,
        passing_score,
        subjects (
          id,
          title,
          courses (
            id,
            title
          )
        )
      )
    `)
    .eq("user_id", userId)
    .order("finished_at", { ascending: false });

  if (aErr) return responseFromPostgrestError(aErr);

  // 4. Fetch Progress Summary (Completed classes count per course)
  // We'll fetch all lesson progress rows for this user
  const { data: progress, error: progErr } = await supabase
    .from("lesson_progress")
    .select(`
      is_completed,
      classes (
        subject_id,
        subjects (
          course_id
        )
      )
    `)
    .eq("user_id", userId)
    .eq("is_completed", true);

  if (progErr) return responseFromPostgrestError(progErr);

  return jsonOk({ 
    user: profile,
    enrollments: enrollments || [],
    attempts: attempts || [],
    completedLessons: progress || []
  });
}
