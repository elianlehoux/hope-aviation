import { z } from "zod";

const uuidSchema = z.string().uuid();

export function parseUuidParam(value: string | undefined | null): string | null {
  if (!value) return null;
  const r = uuidSchema.safeParse(value);
  return r.success ? r.data : null;
}
