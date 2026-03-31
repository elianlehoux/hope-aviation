import { createClient } from "@/lib/supabase/server";
import { sortByOrderThenCreated } from "@/lib/api/academic-order";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { subjectCreateSchema } from "@/lib/validation/academic";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { courseId: rawCourseId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("course_id", courseId);

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ subjects: sortByOrderThenCreated(data ?? []) });
}

export async function POST(request: Request, context: RouteContext) {
  const { courseId: rawCourseId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) return staff.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = subjectCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid subject payload.", 400);
  }

  const p = parsed.data;

  const { data, error } = await supabase
    .from("subjects")
    .insert({
      course_id: courseId,
      title: p.title,
      description: p.description ?? null,
      order_index: p.order_index ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ subject: data }, 201);
}
