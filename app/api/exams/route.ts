import { createClient } from "@/lib/supabase/server";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { jsonOk } from "@/lib/api/json";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";

/**
 * Global Admin Exams endpoint
 * Returns all exams with their corresponding course and subject relations.
 */
export async function GET() {
  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  // Enforce staff
  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) return staff.response;

  // Fetch all exams with course and subject details
  const { data, error } = await supabase
    .from("exams")
    .select(`
      *,
      course:courses(id, title, status),
      subject:subjects(id, title)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ exams: data ?? [] });
}
