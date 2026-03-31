import { createClient } from "@/lib/supabase/server";
import { sortByOrderThenCreated } from "@/lib/api/academic-order";
import { requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import type { Class, Course, Subject } from "@/types/database";

type RouteContext = { params: Promise<{ courseId: string }> };

type SubjectRow = Subject & { classes: Class[] | null };

export async function GET(_request: Request, context: RouteContext) {
  const { courseId: rawId } = await context.params;
  const courseId = parseUuidParam(rawId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      subjects (
        *,
        classes (*)
      )
    `,
    )
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "Course not found.", 404);
  }

  const row = data as Course & {
    subjects: SubjectRow[] | null;
  };

  const { subjects: rawSubjects, ...course } = row;
  const subjectsList = rawSubjects ?? [];

  const subjects = sortByOrderThenCreated(subjectsList).map((s) => {
    const { classes: rawClasses, ...subject } = s;
    const classes = sortByOrderThenCreated(rawClasses ?? []);
    return { ...subject, classes };
  });

  return jsonOk({
    course,
    subjects,
  });
}
