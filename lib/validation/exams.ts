import { z } from "zod";
import {
  translatedDescriptionSchema,
  translatedTitleSchema,
} from "@/lib/validation/academic";

/** Question stem: JSONB translations (same shape as title) */
export const translatedQuestionContentSchema = z
  .object({
    es: z.string().min(1).optional(),
    en: z.string().min(1).optional(),
  })
  .passthrough()
  .refine((o) => Boolean(o.es?.trim?.() || o.en?.trim?.()), {
    message: "content must include at least es or en",
  });

export const examCreateSchema = z.object({
  title: translatedTitleSchema,
  description: translatedDescriptionSchema,
  passing_score: z.number().min(0).max(100).optional().default(70),
  time_limit_minutes: z.number().int().min(1).nullable().optional(),
  max_attempts: z.number().int().min(1).optional().default(1),
  order_index: z.number().int().nullable().optional(),
});

export const examUpdateSchema = z
  .object({
    title: translatedTitleSchema.optional(),
    description: translatedDescriptionSchema,
    passing_score: z.number().min(0).max(100).optional(),
    time_limit_minutes: z.number().int().min(1).nullable().optional(),
    max_attempts: z.number().int().min(1).optional(),
    order_index: z.number().int().nullable().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "at least one field required",
  });

export const questionCreateSchema = z.object({
  content: translatedQuestionContentSchema,
  points: z.number().positive().optional().default(1),
  order_index: z.number().int().nullable().optional(),
});

export const questionUpdateSchema = z
  .object({
    content: translatedQuestionContentSchema.optional(),
    points: z.number().positive().optional(),
    order_index: z.number().int().nullable().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "at least one field required",
  });

export const optionCreateSchema = z.object({
  content: translatedQuestionContentSchema,
  is_correct: z.boolean().optional().default(false),
});

export const optionUpdateSchema = z
  .object({
    content: translatedQuestionContentSchema.optional(),
    is_correct: z.boolean().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "at least one field required",
  });

export const questionBatchCreateSchema = z.object({
  questions: z.array(z.object({
    content: translatedQuestionContentSchema,
    points: z.number().positive().optional().default(1),
    options: z.array(z.object({
      content: translatedQuestionContentSchema,
      is_correct: z.boolean().optional().default(false)
    })).min(1, "Each question must have at least one option")
  })).min(1, "Batch must contain at least one question")
});

export const reorderExamsSchema = z.object({
  orderedExamIds: z.array(z.string().uuid()).min(1),
});

export const reorderQuestionsSchema = z.object({
  orderedQuestionIds: z.array(z.string().uuid()).min(1),
});

export const examSubmitSchema = z.object({
  /** Maps question id to selected option id */
  answers: z.record(z.string().uuid(), z.string().uuid()),
});
