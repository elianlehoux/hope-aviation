import { z } from "zod";

/** Seed roles: slug must not change or be deleted via admin API */
export const PROTECTED_ROLE_SLUGS = ["admin", "instructor", "student"] as const;

const slugPattern = /^[a-z0-9_-]+$/;

export const roleCreateSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(slugPattern),
  description: z.string().nullable().optional(),
});

export const roleUpdateSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    slug: z.string().min(1).max(100).regex(slugPattern).optional(),
    description: z.string().nullable().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "at least one field required",
  });

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .optional();

export const adminProfilePatchSchema = z
  .object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    phone: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    avatar_url: z.string().url().nullable().optional(),
    country_code: z.string().length(3).nullable().optional(),
    birth_date: isoDate,
    is_active: z.boolean().optional(),
  })
  .strict()
  .refine((o) => Object.keys(o).length > 0, {
    message: "at least one field required",
  });

export const userRoleAssignSchema = z.object({
  roleId: z.string().uuid(),
});
