import { z } from "zod";

const localeString = z.string().min(1).optional();

/** JSONB translations: at least one locale when required */
export const translatedTitleSchema = z
  .object({
    es: localeString,
    en: localeString,
  })
  .passthrough()
  .refine((o) => Boolean(o.es?.trim?.() || o.en?.trim?.()), {
    message: "title must include at least es or en",
  });

export const translatedDescriptionSchema = z
  .object({
    es: localeString,
    en: localeString,
  })
  .passthrough()
  .optional()
  .nullable();

export const courseStatusSchema = z.enum(["draft", "published", "archived"]);

export const courseCreateSchema = z.object({
  title: translatedTitleSchema,
  description: translatedDescriptionSchema,
  thumbnail_url: z.string().url().nullable().optional(),
  status: courseStatusSchema.optional().default("draft"),
});

export const courseUpdateSchema = z
  .object({
    title: translatedTitleSchema.optional(),
    description: translatedDescriptionSchema,
    thumbnail_url: z.string().url().nullable().optional(),
    status: courseStatusSchema.optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "at least one field required",
  });

export const subjectCreateSchema = z.object({
  title: translatedTitleSchema,
  description: translatedDescriptionSchema,
  order_index: z.number().int().nullable().optional(),
});

export const subjectUpdateSchema = z
  .object({
    title: translatedTitleSchema.optional(),
    description: translatedDescriptionSchema,
    order_index: z.number().int().nullable().optional(),
    /** Move subject to another course (staff only; exams updated server-side) */
    courseId: z.string().uuid().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "at least one field required",
  });

export const classCreateSchema = z.object({
  title: translatedTitleSchema,
  description: translatedDescriptionSchema,
  video_url: z.string().url().nullable().optional(),
  resource_url: z.string().url().nullable().optional(),
  duration_minutes: z.number().int().min(0).nullable().optional(),
  order_index: z.number().int().nullable().optional(),
});

export const classUpdateSchema = z
  .object({
    title: translatedTitleSchema.optional(),
    description: translatedDescriptionSchema,
    video_url: z.string().url().nullable().optional(),
    resource_url: z.string().url().nullable().optional(),
    duration_minutes: z.number().int().min(0).nullable().optional(),
    order_index: z.number().int().nullable().optional(),
    /** Move class to another subject (same course as URL) */
    subjectId: z.string().uuid().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "at least one field required",
  });

export const reorderSubjectsSchema = z.object({
  orderedSubjectIds: z.array(z.string().uuid()).min(1),
});

export const reorderClassesSchema = z.object({
  orderedClassIds: z.array(z.string().uuid()).min(1),
});
