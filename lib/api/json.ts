import { NextResponse } from "next/server";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    /** PostgREST / Postgres detail when available (not redacted). */
    details?: string;
    db_code?: string;
    hint?: string;
  };
};

export function jsonError(
  code: string,
  message: string,
  status: number,
  extras?: { details?: string; db_code?: string; hint?: string },
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { error: { code, message, ...extras } },
    { status },
  );
}

export function jsonOk<T>(data: T, status = 200): NextResponse<{ data: T }> {
  return NextResponse.json({ data }, { status });
}
