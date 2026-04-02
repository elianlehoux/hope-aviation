import { z } from "zod";

export const enrollmentStatusSchema = z.enum([
  "active",
  "completed",
  "cancelled",
]);

export const enrollmentPatchSchema = z
  .object({
    status: enrollmentStatusSchema.optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "at least one field required",
  });

export { userIdBodySchema as enrollOtherUserSchema } from "./user-actions";

export const lessonProgressPutSchema = z.object({
  is_completed: z.boolean(),
  /** ISO 8601 timestamptz; if omitted when completing, server sets now(). */
  completed_at: z.string().min(1).optional().nullable(),
});
