import { NextResponse } from "next/server";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

export function jsonError(
  code: string,
  message: string,
  status: number,
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function jsonOk<T>(data: T, status = 200): NextResponse<{ data: T }> {
  return NextResponse.json({ data }, { status });
}
