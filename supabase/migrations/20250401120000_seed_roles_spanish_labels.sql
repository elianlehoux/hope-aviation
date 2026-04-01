-- Spanish display names and descriptions for default roles.
-- Slugs remain admin / instructor / student (RLS and has_role depend on them).

INSERT INTO public.roles (name, slug, description)
VALUES
  (
    'Administrador',
    'admin',
    'Acceso completo a la plataforma y gestión de usuarios y roles.'
  ),
  (
    'Profesor',
    'instructor',
    'Crea y gestiona cursos, materias, clases y exámenes.'
  ),
  (
    'Alumno',
    'student',
    'Se inscribe en cursos y completa lecciones y exámenes.'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
