import { z } from "zod";

/** Body with a single profile/user UUID (admin flows: enroll another user, assign instructor). */
export const userIdBodySchema = z.object({
  user_id: z.string().uuid(),
});
