import type { ExamOutcome, ExamPaper } from "./types";

/** Domain error codes raised by the exam RPCs and surfaced by the API routes. */
const KNOWN_CODES = [
  "max_attempts_reached",
  "module_locked",
  "modules_not_passed",
  "no_questions",
  "not_enough_questions",
  "no_open_attempt",
  "not_enrolled",
  "final_exam_not_configured",
] as const;

export type ExamErrorCode = (typeof KNOWN_CODES)[number] | "network" | "unknown";

export type ApiResult<T> =
  | { ok: true; data: T; serverNow: number | null }
  | { ok: false; status: number; code: ExamErrorCode };

function detectCode(status: number, code: unknown, message: unknown): ExamErrorCode {
  const haystack = `${typeof code === "string" ? code : ""} ${typeof message === "string" ? message : ""}`;
  const known = KNOWN_CODES.find((k) => haystack.includes(k));
  if (known) return known;
  // Older routes map RPC errors to generic codes; recover the domain meaning from the text.
  if (/maximum attempts/i.test(haystack)) return "max_attempts_reached";
  if (/no questions/i.test(haystack)) return "no_questions";
  if (/previous module/i.test(haystack)) return "module_locked";
  if (/module exams must be passed/i.test(haystack)) return "modules_not_passed";
  if (/not enrolled/i.test(haystack)) return "not_enrolled";
  return status === 0 ? "network" : "unknown";
}

async function postJson<T>(url: string, body?: unknown): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return { ok: false, status: 0, code: "network" };
  }
  const json = (await res.json().catch(() => null)) as
    | { data?: T; error?: { code?: string; message?: string } }
    | T
    | null;
  if (!res.ok) {
    const err = (json as { error?: { code?: string; message?: string } } | null)?.error;
    return { ok: false, status: res.status, code: detectCode(res.status, err?.code, err?.message) };
  }
  // jsonOk wraps payloads in { data }; accept a bare payload too.
  const data = (json && typeof json === "object" && "data" in json ? (json as { data: T }).data : json) as T;
  const date = res.headers.get("date");
  return { ok: true, data, serverNow: date ? Date.parse(date) : null };
}

export function startExam(url: string) {
  return postJson<ExamPaper>(url);
}

export async function submitExam(
  url: string,
  answers: Record<string, string>,
  questionCount: number,
): Promise<ApiResult<ExamOutcome>> {
  const res = await postJson<Partial<ExamOutcome>>(url, { answers });
  if (!res.ok) return res;
  const score = Number(res.data?.score ?? 0);
  const total = res.data?.total ?? questionCount;
  return {
    ...res,
    data: {
      score,
      passed: Boolean(res.data?.passed),
      total,
      correct: res.data?.correct ?? Math.round((score * total) / 100),
    },
  };
}
