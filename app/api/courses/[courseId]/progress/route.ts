import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSession } from "@/lib/api/auth";
import {
  hasActiveEnrollment,
  hasEnrollmentInCourse,
  isCourseInstructor,
} from "@/lib/api/guards";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { z } from "zod";

type RouteContext = { params: Promise<{ courseId: string }> };

const querySchema = z.object({
  user_id: z.string().uuid().optional(),
});

type ClassRow = {
  id: string;
  subject_id: string;
  title: unknown;
  description: unknown;
  video_url: string | null;
  resource_url: string | null;
  duration_minutes: number | null;
  order_index: number | null;
  created_at: string;
};

type SubjectWithClasses = {
  id: string;
  order_index: number | null;
  classes: ClassRow[] | null;
};

export async function GET(request: Request, context: RouteContext) {
  const { courseId: rawCourseId } = await context.params;
  const courseId = parseUuidParam(rawCourseId);
  if (!courseId) {
    return jsonError("validation_error", "Invalid course id.", 400);
  }

  const url = new URL(request.url);
  const qParsed = querySchema.safeParse({
    user_id: url.searchParams.get("user_id") ?? undefined,
  });
  if (!qParsed.success) {
    return jsonError("validation_error", "Invalid query parameters.", 400);
  }

  const requestedUserId = qParsed.data.user_id;

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const callerId = session.user.id;

  let targetUserId: string;

  if (requestedUserId === undefined) {
    const staff =
      (await isCourseInstructor(supabase, callerId, courseId)) ||
      (await requireAdmin(supabase, callerId)).ok;
    if (staff) {
      return jsonError(
        "forbidden",
        "Query parameter user_id is required to view a learner's course progress.",
        403,
      );
    }
    targetUserId = callerId;
    const active = await hasActiveEnrollment(supabase, targetUserId, courseId);
    if (!active) {
      return jsonError(
        "forbidden",
        "Active enrollment in this course is required to view progress.",
        403,
      );
    }
  } else if (requestedUserId === callerId) {
    targetUserId = callerId;
    const active = await hasActiveEnrollment(supabase, targetUserId, courseId);
    if (!active) {
      return jsonError(
        "forbidden",
        "Active enrollment in this course is required to view progress.",
        403,
      );
    }
  } else {
    const instructorHere = await isCourseInstructor(
      supabase,
      callerId,
      courseId,
    );
    const admin = await requireAdmin(supabase, callerId);
    if (!instructorHere && !admin.ok) {
      return jsonError(
        "forbidden",
        "You do not have permission to view this user's progress.",
        403,
      );
    }
    const enrolled = await hasEnrollmentInCourse(
      supabase,
      requestedUserId,
      courseId,
    );
    if (!enrolled) {
      return jsonError(
        "forbidden",
        "That user is not enrolled in this course.",
        403,
      );
    }
    targetUserId = requestedUserId;
  }

  const { data: subjects, error: subErr } = await supabase
    .from("subjects")
    .select(
      "id, order_index, classes (id, subject_id, title, description, video_url, resource_url, duration_minutes, order_index, created_at)",
    )
    .eq("course_id", courseId)
    .order("order_index", { ascending: true, nullsFirst: false });

  if (subErr) {
    return responseFromPostgrestError(subErr);
  }

  const list = (subjects ?? []) as SubjectWithClasses[];
  const flatClasses: ClassRow[] = [];
  for (const s of list.sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
  )) {
    const cls = s.classes ?? [];
    const sorted = [...cls].sort(
      (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
    );
    flatClasses.push(...sorted);
  }

  const classIds = flatClasses.map((c) => c.id);

  const progressByClass = new Map<
    string,
    { is_completed: boolean; completed_at: string | null }
  >();

  if (classIds.length > 0) {
    const { data: progressRows, error: progErr } = await supabase
      .from("lesson_progress")
      .select("class_id, is_completed, completed_at")
      .eq("user_id", targetUserId)
      .in("class_id", classIds);

    if (progErr) {
      return responseFromPostgrestError(progErr);
    }

    for (const row of progressRows ?? []) {
      progressByClass.set(row.class_id, {
        is_completed: row.is_completed,
        completed_at: row.completed_at,
      });
    }
  }

  let completedCount = 0;
  const classesOut = flatClasses.map((c) => {
    const p = progressByClass.get(c.id);
    const isCompleted = p?.is_completed ?? false;
    if (isCompleted) completedCount += 1;
    return {
      id: c.id,
      subject_id: c.subject_id,
      title: c.title,
      description: c.description,
      video_url: c.video_url,
      resource_url: c.resource_url,
      duration_minutes: c.duration_minutes,
      order_index: c.order_index,
      created_at: c.created_at,
      is_completed: isCompleted,
      completed_at: p?.completed_at ?? null,
    };
  });

  return jsonOk({
    course_id: courseId,
    user_id: targetUserId,
    classes: classesOut,
    completed_count: completedCount,
    total_classes: flatClasses.length,
  });
}
