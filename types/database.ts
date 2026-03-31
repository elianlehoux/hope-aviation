/**
 * Hope Aviation — database-aligned TypeScript types (mirror of public schema).
 * Regenerate from Supabase when convenient: `supabase gen types typescript`.
 */

export type LocaleCode = "es" | "en";

/** JSONB column shape for translatable fields */
export type TranslatedText = Partial<Record<LocaleCode, string>> & {
  [key: string]: string | undefined;
};

export type CourseStatus = "draft" | "published" | "archived";
export type EnrollmentStatus = "active" | "completed" | "cancelled";

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  country_code: string | null;
  birth_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface RoleUser {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
}

export interface Course {
  id: string;
  title: TranslatedText;
  description: TranslatedText | null;
  thumbnail_url: string | null;
  status: CourseStatus;
  created_at: string;
  updated_at: string | null;
}

export interface Subject {
  id: string;
  course_id: string;
  title: TranslatedText;
  description: TranslatedText | null;
  order_index: number | null;
  created_at: string;
}

export interface Class {
  id: string;
  subject_id: string;
  title: TranslatedText;
  description: TranslatedText | null;
  video_url: string | null;
  resource_url: string | null;
  duration_minutes: number | null;
  order_index: number | null;
  created_at: string;
}

export interface Exam {
  id: string;
  course_id: string;
  subject_id: string;
  title: TranslatedText;
  description: TranslatedText | null;
  passing_score: number;
  time_limit_minutes: number | null;
  max_attempts: number;
  created_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  content: TranslatedText;
  points: number;
  order_index: number | null;
}

export interface Option {
  id: string;
  question_id: string;
  content: TranslatedText;
  is_correct: boolean;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  status: EnrollmentStatus;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  class_id: string;
  is_completed: boolean;
  completed_at: string | null;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  score: number | null;
  passed: boolean | null;
  started_at: string;
  finished_at: string | null;
}
