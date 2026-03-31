-- Hope Aviation: core schema (PostgreSQL / Supabase)
-- Multi-language fields use JSONB: { "es": "...", "en": "..." }

-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.email, 'user'), '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Tables: security & users
-- ---------------------------------------------------------------------------

CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  bio text,
  avatar_url text,
  country_code varchar(3),
  birth_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE TABLE public.roles_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles (id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id)
);

CREATE INDEX idx_roles_users_user_id ON public.roles_users (user_id);
CREATE INDEX idx_roles_users_role_id ON public.roles_users (role_id);

-- Role check for RLS (SECURITY DEFINER avoids recursive policy evaluation)
CREATE OR REPLACE FUNCTION public.has_role(p_user_id uuid, p_role_slug text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.roles_users ru
    JOIN public.roles r ON r.id = ru.role_id
    WHERE ru.user_id = p_user_id
      AND r.slug = p_role_slug
  );
$$;

-- ---------------------------------------------------------------------------
-- Core academic (JSONB translations)
-- ---------------------------------------------------------------------------

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title jsonb NOT NULL,
  description jsonb,
  thumbnail_url text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT courses_status_check CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))
);

CREATE INDEX idx_courses_status ON public.courses (status);

CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  title jsonb NOT NULL,
  description jsonb,
  order_index integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subjects_course_id ON public.subjects (course_id);

CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects (id) ON DELETE CASCADE,
  title jsonb NOT NULL,
  description jsonb,
  video_url text,
  resource_url text,
  duration_minutes integer,
  order_index integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_classes_subject_id ON public.classes (subject_id);

-- ---------------------------------------------------------------------------
-- Assessment (JSONB translations)
-- ---------------------------------------------------------------------------

CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects (id) ON DELETE CASCADE,
  title jsonb NOT NULL,
  description jsonb,
  passing_score double precision NOT NULL DEFAULT 70.0,
  time_limit_minutes integer,
  max_attempts integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_exams_course_id ON public.exams (course_id);
CREATE INDEX idx_exams_subject_id ON public.exams (subject_id);

CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams (id) ON DELETE CASCADE,
  content jsonb NOT NULL,
  points double precision NOT NULL DEFAULT 1.0,
  order_index integer
);

CREATE INDEX idx_questions_exam_id ON public.questions (exam_id);

CREATE TABLE public.options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions (id) ON DELETE CASCADE,
  content jsonb NOT NULL,
  is_correct boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_options_question_id ON public.options (question_id);

-- ---------------------------------------------------------------------------
-- Progress
-- ---------------------------------------------------------------------------

CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  UNIQUE (user_id, course_id),
  CONSTRAINT enrollments_status_check CHECK (status = ANY (ARRAY['active'::text, 'completed'::text, 'cancelled'::text]))
);

CREATE INDEX idx_enrollments_user_id ON public.enrollments (user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments (course_id);

CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes (id) ON DELETE CASCADE,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  UNIQUE (user_id, class_id)
);

CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress (user_id);
CREATE INDEX idx_lesson_progress_class_id ON public.lesson_progress (class_id);

CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.exams (id) ON DELETE CASCADE,
  score double precision,
  passed boolean,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE INDEX idx_exam_attempts_user_id ON public.exam_attempts (user_id);
CREATE INDEX idx_exam_attempts_exam_id ON public.exam_attempts (exam_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth: profile row on signup
-- ---------------------------------------------------------------------------

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- roles: readable by authenticated users
CREATE POLICY roles_select_authenticated
  ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

-- profiles: users manage own row; admins can read/update all
CREATE POLICY profiles_select_own_or_admin
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY profiles_update_own_or_admin
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'));

-- roles_users: own rows; admin full access
CREATE POLICY roles_users_select_own_or_admin
  ON public.roles_users
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY roles_users_insert_admin
  ON public.roles_users
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY roles_users_delete_admin
  ON public.roles_users
  FOR DELETE
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- courses: published visible to authenticated; staff sees all; mutations admin/instructor
CREATE POLICY courses_select_published_or_staff
  ON public.courses
  FOR SELECT
  TO authenticated
  USING (
    status = 'published'
    OR public.has_role((SELECT auth.uid()), 'admin')
    OR public.has_role((SELECT auth.uid()), 'instructor')
  );

CREATE POLICY courses_write_admin_or_instructor
  ON public.courses
  FOR ALL
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor'))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor'));

-- subjects, classes: same visibility as parent course (simplified: staff or enrolled path later)
CREATE POLICY subjects_select_staff_or_published_course
  ON public.subjects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = subjects.course_id
        AND (c.status = 'published'
          OR public.has_role((SELECT auth.uid()), 'admin')
          OR public.has_role((SELECT auth.uid()), 'instructor'))
    )
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = subjects.course_id
        AND e.user_id = (SELECT auth.uid())
        AND e.status = 'active'
    )
  );

CREATE POLICY subjects_write_admin_or_instructor
  ON public.subjects
  FOR ALL
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor'))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor'));

CREATE POLICY classes_select_visible
  ON public.classes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.subjects s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = classes.subject_id
        AND (
          c.status = 'published'
          OR public.has_role((SELECT auth.uid()), 'admin')
          OR public.has_role((SELECT auth.uid()), 'instructor')
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.subjects s
      JOIN public.enrollments e ON e.course_id = s.course_id
      WHERE s.id = classes.subject_id
        AND e.user_id = (SELECT auth.uid())
        AND e.status = 'active'
    )
  );

CREATE POLICY classes_write_admin_or_instructor
  ON public.classes
  FOR ALL
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor'))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor'));

-- exams, questions, options: enrolled students read; staff manage
CREATE POLICY exams_select_visible
  ON public.exams
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = exams.course_id
        AND (
          c.status = 'published'
          OR public.has_role((SELECT auth.uid()), 'admin')
          OR public.has_role((SELECT auth.uid()), 'instructor')
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = exams.course_id
        AND e.user_id = (SELECT auth.uid())
        AND e.status = 'active'
    )
  );

CREATE POLICY exams_write_admin_or_instructor
  ON public.exams
  FOR ALL
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor'))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor'));

CREATE POLICY questions_select_via_exam
  ON public.questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = questions.exam_id
        AND (
          EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = e.course_id
              AND (c.status = 'published'
                OR public.has_role((SELECT auth.uid()), 'admin')
                OR public.has_role((SELECT auth.uid()), 'instructor'))
          )
          OR EXISTS (
            SELECT 1 FROM public.enrollments en
            WHERE en.course_id = e.course_id
              AND en.user_id = (SELECT auth.uid())
              AND en.status = 'active'
          )
        )
    )
  );

CREATE POLICY questions_write_admin_or_instructor
  ON public.questions
  FOR ALL
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor'))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor'));

CREATE POLICY options_select_via_question
  ON public.options
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.questions q
      JOIN public.exams e ON e.id = q.exam_id
      WHERE q.id = options.question_id
        AND (
          EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = e.course_id
              AND (c.status = 'published'
                OR public.has_role((SELECT auth.uid()), 'admin')
                OR public.has_role((SELECT auth.uid()), 'instructor'))
          )
          OR EXISTS (
            SELECT 1 FROM public.enrollments en
            WHERE en.course_id = e.course_id
              AND en.user_id = (SELECT auth.uid())
              AND en.status = 'active'
          )
        )
    )
  );

CREATE POLICY options_write_admin_or_instructor
  ON public.options
  FOR ALL
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor'))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor'));

-- enrollments: own rows; admin sees all
CREATE POLICY enrollments_select_own_or_admin
  ON public.enrollments
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY enrollments_insert_own
  ON public.enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY enrollments_update_own_or_admin
  ON public.enrollments
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (user_id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'));

-- lesson_progress: own rows
CREATE POLICY lesson_progress_select_own
  ON public.lesson_progress
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY lesson_progress_insert_own
  ON public.lesson_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY lesson_progress_update_own
  ON public.lesson_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- exam_attempts: own rows
CREATE POLICY exam_attempts_select_own
  ON public.exam_attempts
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY exam_attempts_insert_own
  ON public.exam_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY exam_attempts_update_own
  ON public.exam_attempts
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- Grants (explicit helper execution for authenticated)
-- ---------------------------------------------------------------------------

GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
