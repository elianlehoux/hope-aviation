import { z } from "zod";

const uuidSchema = z.string().uuid();

export function parseUuidParam(value: string): string | null {
  const r = uuidSchema.safeParse(value);
  return r.success ? r.data : null;
}
