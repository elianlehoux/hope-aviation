-- Default roles for Hope Aviation (idempotent on slug)

INSERT INTO public.roles (name, slug, description)
VALUES
  ('Admin', 'admin', 'Full platform access and user/role management.'),
  ('Instructor', 'instructor', 'Create and manage courses, subjects, classes, and exams.'),
  ('Student', 'student', 'Enroll in courses and complete lessons and exams.')
ON CONFLICT (slug) DO NOTHING;
