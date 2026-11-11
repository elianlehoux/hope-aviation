import { createClient } from "@/lib/supabase/server";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { fetchCourseSubjectExamChain } from "@/lib/api/guards";
import { questionBatchCreateSchema } from "@/lib/validation/exams";

type RouteContext = {
  params: Promise<{ courseId: string; subjectId: string; examId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const {
    courseId: rawCourseId,
    subjectId: rawSubjectId,
    examId: rawExamId,
  } = await context.params;
  
  const courseId = parseUuidParam(rawCourseId);
  const subjectId = parseUuidParam(rawSubjectId);
  const examId = parseUuidParam(rawExamId);
  
  if (!courseId || !subjectId || !examId) {
    return jsonError("validation_error", "Invalid id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) return staff.response;

  const chain = await fetchCourseSubjectExamChain(
    supabase,
    courseId,
    subjectId,
    examId,
  );
  
  if (!chain.ok) {
    return responseFromPostgrestError(chain.postgrestError);
  }
  if (!chain.subjectOk) {
    return jsonError("not_found", "Subject not found.", 404);
  }
  if (!chain.examOk) {
    return jsonError("not_found", "Exam not found.", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = questionBatchCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid question batch payload.", 400);
  }

  const { questions } = parsed.data;

  // Get current max order_index to append correctly
  const { data: currentQuestions } = await supabase
    .from("questions")
    .select("order_index")
    .eq("exam_id", examId)
    .order("order_index", { ascending: false })
    .limit(1);

  const startOrder = (currentQuestions?.[0]?.order_index ?? -1) + 1;

  // Insert questions
  const questionsToInsert = questions.map((q, i) => ({
    exam_id: examId,
    content: q.content,
    points: q.points,
    order_index: startOrder + i,
  }));

  const { data: insertedQuestions, error: qError } = await supabase
    .from("questions")
    .insert(questionsToInsert)
    .select("id, content, order_index");

  if (qError || !insertedQuestions) {
    return responseFromPostgrestError(qError || new Error("Failed to insert questions"));
  }

  // Map options to newly created question ids by matching order tracking.
  // Because we inserted in bulk and ordered them via order_index, we can pair them up.
  // Sort the inserted questions back to their intended order to match the `questions` array.
  insertedQuestions.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const optionsToInsert: { question_id: string; content: unknown; is_correct: boolean }[] = [];

  for (let i = 0; i < questions.length; i++) {
    const originalQ = questions[i];
    const newQ = insertedQuestions[i];

    if (!newQ) continue;

    for (const opt of originalQ.options) {
      optionsToInsert.push({
        question_id: newQ.id,
        content: opt.content,
        is_correct: opt.is_correct,
      });
    }
  }

  if (optionsToInsert.length > 0) {
    const { error: oError } = await supabase
      .from("options")
      .insert(optionsToInsert);

    if (oError) {
      // Note: Ideally this would be inside an RPC or Postgres function, 
      // but if the options fail, we should probably return an error so the user knows.
      return responseFromPostgrestError(oError);
    }
  }

  return jsonOk({ message: "Import successful", count: insertedQuestions.length }, 201);
}
