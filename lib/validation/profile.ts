import { z } from "zod";

/** Fields the signed-in user may change on their own profile (`is_active` is admin-only). */
export const profileSelfPatchSchema = z
  .object({
    first_name: z.string().min(1).max(200).optional(),
    last_name: z.string().min(1).max(200).optional(),
    phone: z.string().max(50).nullable().optional(),
    bio: z.string().max(5000).nullable().optional(),
    avatar_url: z.string().max(2000).nullable().optional(),
    country_code: z.string().min(2).max(8).nullable().optional(),
    birth_date: z.string().max(32).nullable().optional(),
    newsletter_opt_in: z.boolean().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "at least one field required",
  });
