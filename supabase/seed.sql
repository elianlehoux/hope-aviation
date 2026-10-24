-- Local development seed (loaded by `supabase db reset`). Never run against production.
--
-- Test accounts (password for all: hope-dev-1234):
--   admin@hope.test       admin
--   instructor@hope.test  instructor (assigned to the demo course)
--   student@hope.test     student (enrolled in the demo course)
--
-- Demo course: "Fundamentos de aviación misionera" with two modules, mixed
-- video / written lessons (Markdown + campus extensions), module exams and a final exam.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  v_pw text := extensions.crypt('hope-dev-1234', extensions.gen_salt('bf'));
  v_admin uuid := '00000000-0000-4000-a000-000000000001';
  v_instructor uuid := '00000000-0000-4000-a000-000000000002';
  v_student uuid := '00000000-0000-4000-a000-000000000003';
  v_course uuid := '10000000-0000-4000-a000-000000000001';
  v_s1 uuid := '20000000-0000-4000-a000-000000000001';
  v_s2 uuid := '20000000-0000-4000-a000-000000000002';
  v_e1 uuid := '40000000-0000-4000-a000-000000000001';
  v_e2 uuid := '40000000-0000-4000-a000-000000000002';
  v_q uuid;
  u record;
BEGIN
  FOR u IN
    SELECT * FROM (VALUES
      (v_admin, 'admin@hope.test', 'Ana', 'Admin', 'admin'),
      (v_instructor, 'instructor@hope.test', 'Iván', 'Instructor', 'instructor'),
      (v_student, 'student@hope.test', 'Sofía', 'Estudiante', 'student')
    ) AS t(id, email, first_name, last_name, role)
  LOOP
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      u.id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      u.email, v_pw, now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('first_name', u.first_name, 'last_name', u.last_name),
      now(), now(), '', '', '', ''
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), u.id, u.id::text,
      jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
      'email', now(), now(), now())
    ON CONFLICT DO NOTHING;

    UPDATE public.profiles SET country_code = 'AR' WHERE id = u.id;

    INSERT INTO public.roles_users (user_id, role_id)
    SELECT u.id, r.id FROM public.roles r WHERE r.slug = u.role
    ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.courses (id, title, description, thumbnail_url, status,
    final_exam_question_count, final_exam_passing_score, final_exam_time_limit_minutes)
  VALUES (
    v_course,
    '{"es": "Fundamentos de aviación misionera", "en": "Foundations of mission aviation"}',
    '{"es": "Qué es la aviación misionera, dónde hace falta y cómo prepararte para servir. Para pilotos, voluntarios y profesionales de la salud.", "en": "What mission aviation is, where it is needed and how to prepare to serve. For pilots, volunteers and health professionals."}',
    NULL, 'published', 4, 70, 20
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.course_instructors (course_id, user_id) VALUES (v_course, v_instructor)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.subjects (id, course_id, title, description, order_index) VALUES
    (v_s1, v_course, '{"es": "Por qué la aviación", "en": "Why aviation"}',
     '{"es": "El problema del acceso y el rol del avión.", "en": "The access problem and the role of the aircraft."}', 0),
    (v_s2, v_course, '{"es": "Operar en el campo", "en": "Operating in the field"}',
     '{"es": "Pistas, carga, seguridad y trabajo en equipo.", "en": "Airstrips, cargo, safety and teamwork."}', 1)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.classes (id, subject_id, title, description, video_url, resource_url, duration_minutes, order_index, content) VALUES
  ('30000000-0000-4000-a000-000000000001', v_s1,
   '{"es": "Llegar donde los caminos no llegan", "en": "Reaching where roads can''t"}',
   '{"es": "Lectura introductoria con datos y ejemplos de Argentina.", "en": "Introductory reading with data and examples from Argentina."}',
   NULL, NULL, 8, 0,
   jsonb_build_object('es', $md$
Argentina es el **octavo país más grande del mundo**. En muchas regiones, una comunidad puede quedar a horas del hospital más cercano, y en temporada de lluvias los caminos simplemente desaparecen.

> [!NOTE] Idea clave
> El avión no reemplaza al médico ni al maestro: **los lleva** a donde hacen falta.

## El problema del acceso

```stats
2.780.400 | km² de territorio
18 | regiones naturales
horas | hasta el hospital más cercano en zonas aisladas
```

Las ambulancias aéreas existentes operan desde aeropuertos grandes. Eso deja cientos de comunidades sin respuesta rápida.

```chart bar
title: Tiempo estimado de llegada a un centro de salud
unit: h
Por tierra (seco): 4
Por tierra (lluvias): 12
En lancha (Delta): 6
En avión STOL: 1
```

## Dónde hace falta

| Región | Desafío principal | Aeronave ideal |
|---|---|---|
| Misiones | Selva y lluvias intensas | Helicóptero o STOL |
| Chaco y Formosa | Calor extremo, sin infraestructura | STOL de alta capacidad |
| Delta del Paraná | Solo acceso por agua | Anfibio o helicóptero |
| Patagonia y Andes | Clima extremo e incendios | STOL o Fire Boss |

```check
? ¿Cuál es el rol principal del avión en una misión humanitaria?
- Reemplazar a los equipos de salud
+ Llevar personas y recursos a donde no llegan los caminos
- Hacer turismo en zonas remotas
> El avión es un puente: su valor está en conectar, no en reemplazar.
```
$md$, 'en', $md$
Argentina is the **eighth-largest country in the world**. In many regions a community can be hours away from the nearest hospital, and in the rainy season roads simply disappear.

> [!NOTE] Key idea
> The aircraft does not replace the doctor or the teacher: **it carries them** to where they are needed.

## The access problem

```stats
2,780,400 | km² of territory
18 | natural regions
hours | to the nearest hospital in isolated areas
```

Existing air ambulances operate from major airports, leaving hundreds of communities without a fast response.

```chart bar
title: Estimated time to reach a health center
unit: h
By land (dry): 4
By land (rain): 12
By boat (Delta): 6
By STOL aircraft: 1
```

```check
? What is the main role of the aircraft in a humanitarian mission?
- Replacing health teams
+ Carrying people and resources where roads can't reach
- Tourism in remote areas
> The aircraft is a bridge: its value is in connecting, not replacing.
```
$md$)),
  ('30000000-0000-4000-a000-000000000002', v_s1,
   '{"es": "Qué es (y qué no es) Hope Aviation", "en": "What Hope Aviation is (and is not)"}',
   '{"es": "Video y resumen escrito.", "en": "Video and written summary."}',
   'https://www.youtube.com/watch?v=gRvLMMk-i30', NULL, 12, 1,
   jsonb_build_object('es', $md$
Hope Aviation **no es una escuela de vuelo** y no otorga licencias. Entramos *después* de tu formación aeronáutica, con lo que la instrucción tradicional no cubre.

```steps
Formación complementaria: técnica, humanitaria y espiritual, desde el campus virtual.
Red de impacto: te conectamos con organizaciones que ya operan en el campo.
Infraestructura: trabajamos por una base y pista propia en Argentina.
```

> [!TIP] Para pilotos
> Hacé tu licencia en la escuela habilitada que prefieras. Nosotros te preparamos para la misión.
$md$, 'en', $md$
Hope Aviation **is not a flight school** and does not issue licenses. We come in *after* your aviation training, with what traditional instruction does not cover.

```steps
Complementary training: technical, humanitarian and spiritual, through the virtual campus.
Impact network: we connect you with organizations already operating in the field.
Infrastructure: we are working toward our own base and airstrip in Argentina.
```
$md$)),
  ('30000000-0000-4000-a000-000000000003', v_s2,
   '{"es": "Pistas, carga y peso", "en": "Airstrips, cargo and weight"}',
   '{"es": "Cómo se planifica una carga segura.", "en": "How safe cargo is planned."}',
   NULL, NULL, 10, 0,
   jsonb_build_object('es', $md$
En pistas cortas y no preparadas, **cada kilo cuenta**. La planificación de carga define si se puede despegar con seguridad.

```chart line
title: Distancia de despegue según peso (ejemplo ilustrativo)
unit: m
800 kg: 210
900 kg: 250
1000 kg: 300
1100 kg: 365
1200 kg: 440
```

> [!WARNING] Ejemplo ilustrativo
> Los valores son de referencia para entender la tendencia. Siempre usá el manual de vuelo de la aeronave.

## Orden de prioridad de carga

1. Pacientes y personal médico
2. Medicamentos y equipo crítico
3. Agua y alimentos
4. Equipaje personal

```check
? Si el peso aumenta, ¿qué pasa con la distancia de despegue?
+ Aumenta, y cada vez más rápido
- Disminuye
- No cambia
> La relación no es lineal: los últimos kilos son los que más pista consumen.
```
$md$, 'en', $md$
On short, unprepared strips **every kilo counts**. Load planning decides whether a safe takeoff is possible.

```chart line
title: Takeoff distance by weight (illustrative example)
unit: m
800 kg: 210
900 kg: 250
1000 kg: 300
1100 kg: 365
1200 kg: 440
```

> [!WARNING] Illustrative example
> Values are for understanding the trend. Always use the aircraft flight manual.
$md$)),
  ('30000000-0000-4000-a000-000000000004', v_s2,
   '{"es": "Seguridad y gestión de emergencias", "en": "Safety and emergency management"}',
   '{"es": "Video de la clase presencial 2025.", "en": "Video from the 2025 in-person class."}',
   'https://www.youtube.com/watch?v=B2H7MbVa_Gw', NULL, 15, 1, NULL)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.exams (id, course_id, subject_id, title, description, passing_score, max_attempts, order_index) VALUES
    (v_e1, v_course, v_s1, '{"es": "Evaluación del módulo 1", "en": "Module 1 assessment"}', NULL, 70, 3, 0),
    (v_e2, v_course, v_s2, '{"es": "Evaluación del módulo 2", "en": "Module 2 assessment"}', NULL, 70, 3, 0)
  ON CONFLICT (id) DO NOTHING;

  -- Module 1 questions
  INSERT INTO public.questions (exam_id, content, points, order_index)
  VALUES (v_e1, '{"es": "¿Hope Aviation otorga licencias de piloto?", "en": "Does Hope Aviation issue pilot licenses?"}', 1, 0)
  RETURNING id INTO v_q;
  INSERT INTO public.options (question_id, content, is_correct) VALUES
    (v_q, '{"es": "Sí", "en": "Yes"}', false),
    (v_q, '{"es": "No, brinda formación complementaria", "en": "No, it provides complementary training"}', true);

  INSERT INTO public.questions (exam_id, content, points, order_index)
  VALUES (v_e1, '{"es": "¿Qué región solo tiene acceso por agua?", "en": "Which region is only reachable by water?"}', 1, 1)
  RETURNING id INTO v_q;
  INSERT INTO public.options (question_id, content, is_correct) VALUES
    (v_q, '{"es": "Delta del Paraná", "en": "Paraná Delta"}', true),
    (v_q, '{"es": "Patagonia", "en": "Patagonia"}', false),
    (v_q, '{"es": "Córdoba", "en": "Córdoba"}', false);

  -- Module 2 questions
  INSERT INTO public.questions (exam_id, content, points, order_index)
  VALUES (v_e2, '{"es": "¿Qué se prioriza primero en la carga?", "en": "What is loaded first in priority?"}', 1, 0)
  RETURNING id INTO v_q;
  INSERT INTO public.options (question_id, content, is_correct) VALUES
    (v_q, '{"es": "Pacientes y personal médico", "en": "Patients and medical staff"}', true),
    (v_q, '{"es": "Equipaje personal", "en": "Personal luggage"}', false);

  INSERT INTO public.questions (exam_id, content, points, order_index)
  VALUES (v_e2, '{"es": "Más peso implica…", "en": "More weight means…"}', 1, 1)
  RETURNING id INTO v_q;
  INSERT INTO public.options (question_id, content, is_correct) VALUES
    (v_q, '{"es": "Más distancia de despegue", "en": "Longer takeoff distance"}', true),
    (v_q, '{"es": "Menos distancia de despegue", "en": "Shorter takeoff distance"}', false);

  INSERT INTO public.enrollments (user_id, course_id, status) VALUES (v_student, v_course, 'active')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.lesson_progress (user_id, class_id, is_completed, completed_at)
  VALUES (v_student, '30000000-0000-4000-a000-000000000001', true, now())
  ON CONFLICT DO NOTHING;
END $$;
