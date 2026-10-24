# Rediseño completo del campus — diseño

Fecha: 2026-10-24 · Rama base: `claude/campus-redesign` (PR #4)

## 1. Por qué

El campus creció por partes y quedó así:

- Hay tres árboles de rutas para lo mismo: `/campus/students/*`, `/campus/professors/*` y `/campus/admin/*`.
- Paneles admin de 700 a 1300 líneas que traen todo desde el cliente al montar.
- Exámenes administrados aparte de los cursos a los que pertenecen.
- Dos pantallas de "usuarios" que se pisan.
- "Certificados" que dice "próximamente", aunque el curso ya se puede completar.

El aula, el inicio y la ficha de curso ya se rediseñaron en el PR #4. Este documento cubre **todo lo demás** y fija los flujos completos para que el sitio se sienta como un solo producto.

**Éxito** quiere decir:

- Un alumno puede crear su cuenta, inscribirse, estudiar, rendir, aprobar y descargar su certificado sin ayuda de nadie.
- Un instructor puede armar y publicar un curso completo desde una sola pantalla.
- Un admin puede encontrar a cualquier persona y ver o corregir su situación en dos clics.

## 2. Metas, no-metas, anti-metas

**Metas**
- Un único mapa de rutas, con una navegación por rol.
- Flujos completos de punta a punta para alumno, instructor y admin, con estados vacíos, de error y de carga.
- Gestión de cursos unificada: estructura, clases, exámenes, ajustes, alumnos e instructores en el mismo lugar.
- Pantallas de examen rediseñadas.
- Certificados reales con verificación pública.
- Cuentas: registro explícito y recuperación de contraseña.
- Carga del lado del servidor y consultas en paralelo, como ya se hizo en el aula.

**No-metas (por ahora)**
- La landing pública. Ya tiene su rediseño (`wip/landing-warm`). *Decisión mía; confirmar.*
- Pagos, foros, chat, notificaciones por mail de progreso y hosting de video propio.
- Generar preguntas con IA. Se mantiene el "copiar prompt" que ya existe.

**Anti-metas (sería un fracaso aunque funcione)**
- Que el alumno pueda ver las respuestas correctas antes o entre intentos.
- Que un recorrido normal del alumno dependa de que un admin haga algo a mano.
- Que se sumen dependencias pesadas, como un generador de PDF en el servidor o una librería de tablas.
- Que la gestión vuelva a ser una cadena de modales anidados.

## 3. Restricciones

- Se usa Next.js 16 con `cacheComponents`: los datos sin cache y `usePathname` tienen que ir dentro de `<Suspense>`.
- Supabase con RLS como capa de autorización. Toda corrección y todo cambio de estado sensible se hace en la base (RPC `SECURITY DEFINER`).
- Bilingüe es/en: textos de UI en `lib/i18n/translations.ts` y contenido en JSONB `{es,en}`.
- El sistema visual es `DESIGN.md`:
  - Fondo papel `#f7f4ee`.
  - Navy `#00263e` para estructura.
  - Azul `#1749ff` para acciones.
  - Ámbar `#ffaa00` para CTA y logros.
  - Tipografías Bricolage, Instrument Sans y Plex Mono.
- Comentarios de código en inglés.
- **Cambios de base:** se escriben como migraciones nuevas y se prueban en Supabase local. **No se aplican a producción hasta el final**, todos juntos (pedido del usuario).

## 4. Mapa de rutas final

### Público
| Ruta | Qué es |
|---|---|
| `/auth/login` | Entrar (email+clave o Google) |
| `/auth/registro` | Crear cuenta (nueva) |
| `/auth/recuperar` | Pedir mail para resetear clave (nueva) |
| `/auth/nueva-clave` | Elegir clave nueva desde el link del mail (nueva) |
| `/certificados/[codigo]` | Verificación pública de un certificado (nueva) |

### Alumno (`/campus`)
| Ruta | Qué es |
|---|---|
| `/campus` | Inicio: continuar, mis cursos, explorar *(hecho en PR #4)* |
| `/campus/courses` | Catálogo *(hecho)* |
| `/campus/courses/[id]` | Ficha del curso *(hecho)* |
| `/campus/courses/[id]/learn/[classId]` | Clase *(hecho)* |
| `/campus/courses/[id]/learn/exam/[examId]` | Examen de módulo (rediseñar) |
| `/campus/courses/[id]/learn/final-exam` | Examen final (rediseñar) |
| `/campus/certificates` | Mis certificados (nuevo de verdad) |
| `/campus/certificates/[enrollmentId]` | Certificado imprimible / PDF (nuevo) |
| `/campus/profile` | Perfil y cuenta (rediseñar) |

### Gestión (staff, `/campus/admin`; se mantiene la URL)
| Ruta | Quién | Qué es |
|---|---|---|
| `/campus/admin` | staff | Redirige a cursos |
| `/campus/admin/courses` | staff | Lista de cursos |
| `/campus/admin/courses/[id]` | staff | **Editor de curso** con pestañas Contenido · Ajustes · Alumnos · Instructores |
| `/campus/admin/courses/[id]/lessons/[classId]` | staff | Editor de texto de clase *(hecho)* |
| `/campus/admin/courses/[id]/exams/[examId]` | staff | Editor de examen (se mueve) |
| `/campus/admin/people` | staff | **Personas**: une "usuarios" y "gestión de usuarios" |
| `/campus/admin/people/[userId]` | staff | Ficha de persona |
| `/campus/admin/newsletter` | admin | Newsletter (se mantiene, con retoque visual) |

### Se eliminan (con redirect permanente en `next.config`, no como páginas)
- `/campus/students/**` y `/campus/professors/**` pasan al equivalente nuevo.
- `/campus/admin/exams` pasa a `/campus/admin/courses`.
- `/campus/admin/exams/[id]` pasa a la ruta nueva del examen. Necesita un lookup del curso, así que queda como página mínima de redirect.
- `/campus/admin/users` y `/campus/admin/user-management/**` pasan a `/campus/admin/people/**`.
- `/campus/admin/roles` se elimina. Los roles son fijos (admin, instructor, alumno) y se asignan desde Personas. *Decisión mía; confirmar.*
- `/campus/admin/enrollments` y `/campus/admin/exam-attempts` pasan a `/campus/admin/people`.

### Navegación
- **Alumno:** Inicio · Cursos · Certificados · Perfil.
- **Staff:** lo mismo, más el grupo "Gestión": Cursos · Personas, y Newsletter solo para admin.
- **Aula:** sin barra lateral (ya está así).
- **Móvil:** cajón izquierdo (ya está así).

## 5. Flujos

Cada flujo indica los estados que la pantalla tiene que resolver.

### 5.1 Cuenta

**Hoy hay un problema:** `POST /api/auth/login`, cuando falla el login, **crea una cuenta nueva** con ese mail y esa clave. Un mail mal tipeado genera una cuenta fantasma, y no existe forma de recuperar la clave.

**Nuevo:**
1. **Entrar:** email + clave, o Google. Con error se muestra "Mail o clave incorrectos" y un link a "¿Olvidaste tu clave?". Nunca se crea una cuenta desde acá.
2. **Crear cuenta:** nombre, apellido, email y clave (mín. 8).
   - Si Supabase pide confirmación: pantalla "Revisá tu mail" con opción de reenviar.
   - Si no la pide: entra directo a `/campus`.
   - Google sigue funcionando como alta implícita.
3. **Recuperar:** email, luego "Si existe una cuenta, te mandamos un link" (no revela si existe). El link lleva a `/auth/nueva-clave`, se elige la clave y se entra.
4. Si una página del campus requiere sesión y no la hay, va a `/auth/login?next=<ruta>` y después vuelve a la ruta.

### 5.2 Alumno: de cero a certificado

```
Landing → Entrar/Crear cuenta → Inicio
  → Explorar → Ficha del curso → [Inscribirme] → Aula (primera clase)
  → Clase → [Completar y seguir] → … → Examen del módulo
      → Preparación → Preguntas → Revisión → Enviar → Resultado
          ├─ aprobado → siguiente módulo
          └─ desaprobado → reintentar (si quedan intentos) / contactar
  → … → Examen final (se habilita con todos los módulos aprobados)
      → aprobado → Pantalla "¡Curso completado!" → Ver certificado
  → Certificado → Descargar PDF (impresión) / Copiar link de verificación
```

**Perfil y certificado:** el nombre del certificado sale de `profiles.first_name/last_name`. Si falta, antes de mostrar el certificado se pide completar nombre y apellido con un formulario corto en la misma pantalla. No se bloquea la inscripción ni el estudio.

**Curso sin examen final** (`final_exam_question_count` vacío): el curso se completa cuando todas las clases están completas y todos los exámenes de módulo están aprobados. Hoy un curso así **no se puede completar nunca**. Lo arregla la migración M3.

**Módulo sin examen:** no bloquea. El módulo siguiente se habilita cuando están completas las clases del anterior. *Decisión mía: es lo que más se parece a la regla actual de "examen aprobado".*

### 5.3 Examen (alumno)

1. **Preparación:** título, cantidad de preguntas, tiempo límite, nota mínima, intentos usados de N y mejor nota. Tiene un botón "Empezar" o un aviso de "Sin intentos" con texto para contactar.
2. **Rendir:**
   - Una pregunta por pantalla, con barra de progreso "Pregunta 3 de 10".
   - Se puede saltar adelante y atrás, y hay un mapa de preguntas (puntitos) para ir a cualquiera.
   - El temporizador queda visible si hay límite. Las respuestas se guardan en `sessionStorage` para no perderlas si se recarga.
3. **Revisión:** lista de preguntas con estado respondida o sin responder. "Enviar" pide confirmación si quedan sin responder.
4. **Resultado:** nota grande, aprobado o desaprobado y "X de Y correctas". **No se muestran las respuestas correctas** (anti-meta). Siguiente paso claro: "Seguir al módulo 3", "Reintentar (te quedan 2)" o "Ver certificado".
5. **Tiempo límite real:**
   - Al tocar "Empezar" se registra el inicio en la base (M2).
   - Un envío pasado el límite más 2 minutos de gracia se rechaza.
   - En el cliente, al llegar a 0 se envía solo.

### 5.4 Instructor: armar y publicar un curso

```
Gestión → Cursos → [Nuevo curso] (título es/en) → Editor de curso
  Contenido: árbol a la izquierda | panel del ítem seleccionado a la derecha
    + Módulo → + Clase (título, duración, video, material, [Escribir texto])
             → + Examen del módulo → Editor de examen (config + preguntas)
    Arrastrar para reordenar módulos, clases y preguntas
  Ajustes: título/descripción es/en, portada, examen final (cantidad, nota, tiempo)
  [Vista previa como alumno] → abre el aula en modo vista previa
  [Publicar] → checklist → publicado
```

- **Panel derecho, no modales:**
  - Al elegir un módulo o una clase en el árbol, su formulario se abre a la derecha y se guarda con "Guardar" (o `Cmd+S`).
  - Los modales quedan solo para confirmar acciones destructivas.
  - En móvil el árbol ocupa la pantalla y el panel se abre como hoja.
- **Checklist de publicación.** Tiene que cumplirse todo esto:
  - El curso tiene al menos un módulo.
  - Cada módulo tiene al menos una clase.
  - Cada clase tiene video o texto.
  - Cada examen tiene al menos una pregunta, y cada pregunta tiene al menos dos opciones con exactamente una correcta.
  - La cantidad de preguntas del final no supera el total de preguntas disponibles.
  - Cada punto que falla es un link al ítem a corregir.
  - Reutiliza la lógica de `PublishValidationModal`.
- **Vista previa como alumno:** el staff puede abrir `/campus/courses/[id]/learn` sin inscribirse. Lo ve todo desbloqueado, con una cinta "Vista previa" arriba y sin guardar progreso.
- **Editor de examen:**
  - Configuración arriba (nota mínima, tiempo, intentos, instrucciones).
  - Debajo, la lista de preguntas editable en línea: enunciado es/en, opciones y marca de la correcta.
  - Importación en lote con el formato actual.
  - Se reordena arrastrando.
- **Alumnos (pestaña):**
  - Lista de inscriptos con progreso %, último examen y estado.
  - El click lleva a la ficha de la persona.
  - Botón "Inscribir alumno" por email, solo para admin.
- **Instructores (pestaña, solo admin):** asignar o quitar instructores (la API ya existe).

### 5.5 Admin: personas

```
Gestión → Personas (buscador + filtro por rol/estado + paginado)
  → Ficha: cuenta (rol, activo/inactivo) · cursos con progreso · intentos por examen
      → [Reiniciar intentos de este examen] (confirmación)
      → [Cambiar rol] / [Desactivar cuenta] (solo admin)
```

Un instructor ve en Personas solo a los alumnos de sus cursos, y sin controles de cuenta.

## 6. Pantallas: lineamientos visuales

- **Una sola familia** de componentes campus en `components/features/campus/ui/`:
  - `PageHeader` (título, descripción y acciones).
  - `Surface` (tarjeta blanca sobre papel).
  - `EmptyState` (ícono, texto y CTA).
  - `DataList` (filas responsivas: tabla en desktop, tarjetas en móvil).
  - `StatusBadge` (borrador, publicado, archivado, aprobado, etc., siempre con texto y no solo color).
  - `Field` (label, input, ayuda y error).
  - `ConfirmDialog`.
- **Las pantallas de gestión** usan el mismo papel y la misma tipografía que el lado alumno. Son más densas, pero con la misma voz visual: nada de "dashboard gris genérico".
- **Botones:**
  - CTA principal de cada pantalla: píldora ámbar con texto navy.
  - Acciones secundarias: contorno navy.
  - Destructivas: rojo, solo dentro de confirmaciones.
- **Certificado:**
  - Hoja A4 apaisada con estética de marca (navy, líneas de vuelo ámbar).
  - Contenido: nombre, curso, fecha, código y QR al link de verificación.
  - "Descargar PDF" usa `window.print()` con CSS `@media print`, sin dependencias.
  - El QR se genera como SVG en el servidor. Si suma una dependencia, que sea liviana (`qrcode` ~30 kB); si no, se omite el QR y se muestra el link.
- **Loading:**
  - Esqueletos con la misma forma que el contenido.
  - Errores con mensaje humano y botón "Reintentar".
- **Accesibilidad:**
  - Foco visible y contraste AA.
  - Todo usable con teclado (incluido el reordenamiento: botones subir y bajar además del arrastre).

## 7. Datos y rendimiento

- **Gestión:**
  - Las páginas cargan datos en el servidor, como el aula, en vez de `fetch` al montar.
  - Las mutaciones siguen usando las rutas `/api/...` existentes, seguidas de `router.refresh()`.
  - Se escriben helpers `lib/campus/manage.ts` con `cache()` y consultas en paralelo.
- **Personas:** paginado del lado del servidor, con búsqueda por nombre o email.
- **Los paneles grandes** (`CourseDetailPanel`, `ExamsListPanel`, `ExamEditorPanel`, `UsersPanel`, `UserManagementPanel`, `UserAcademicDetail`, `RolesPanel`, `CoursesPanel`) se reemplazan por componentes chicos por pantalla. Las APIs que queden sin uso se borran.

## 8. Cambios de base (se escriben ahora, se aplican al final)

| # | Migración | Qué hace |
|---|---|---|
| — | `20261024120000_class_written_content` | *(ya en PR #4)* texto de clases |
| — | `20261024130000_exam_integrity` | *(ya en PR #4)* corrección en la base |
| M1 | `certificates` | En `enrollments`: `completed_at timestamptz` y `certificate_code text unique`. Se completan dentro de `submit_final_exam` y de M3. RPC `verify_certificate(code)` (SECURITY DEFINER, ejecutable por `anon`) que devuelve solo nombre, curso y fecha. Backfill de los completados existentes. |
| M2 | `exam_timing` | RPC `start_exam_attempt(exam_id)`, que crea el intento abierto con `started_at`. `submit_exam_attempt` / `submit_final_exam` cierran ese intento y rechazan si se pasó el límite más 2 min. El final necesita guardar qué preguntas se sortearon: `final_exam_sessions(user_id, course_id, question_ids uuid[], started_at)`. |
| M3 | `course_completion_without_final` | RPC `complete_course(course_id)`, válida solo si el curso no tiene final configurado y todo está cumplido. Regla de desbloqueo para módulos sin examen. |
| M4 | `instructor_course_scope` | Las políticas de escritura de cursos, módulos, clases, exámenes y preguntas pasan de "cualquier instructor" a `is_course_instructor` o admin. Hoy **cualquier instructor puede editar cualquier curso**. Crear curso: el instructor que lo crea queda asignado. |
| M5 | `remove_default_admin` | Borra `test.admin@test.com` si existe (lo creó la migración 20250401120001). |

Todas se prueban en Supabase local con el seed (que se amplía con un curso sin final y un segundo instructor), con un caso por cada regla nueva. Orden de deploy: `supabase db push`, después la app.

## 9. Orden de construcción

Cada fase cierra con build, typecheck, prueba en navegador por rol (desktop + 375 px) y commit.

1. **Base:** rutas y redirects, navegación, componentes `campus/ui`, strings i18n.
2. **Cuenta:** login sin alta implícita, registro, recuperar y nueva clave, `?next=`.
3. **Exámenes alumno:** preparación, rendir, revisión, resultado y tiempo (M2).
4. **Certificados y perfil:** M1 y M3, lista, certificado imprimible, verificación pública y perfil.
5. **Gestión de cursos:** lista, editor unificado, editor de examen, publicación, vista previa e instructores (M4).
6. **Personas:** lista, ficha y acciones.
7. **Limpieza:** borrar paneles y APIs muertas, lint, M5 y PR.
8. **Aplicar a producción** (con el usuario): `db push`, deploy y verificación.

## 10. Lo que queda a criterio de quien construye

- Nombres de componentes y archivos dentro de esta estructura.
- Microcopy, siempre que sea corta, en voseo para el español, y que el inglés diga lo mismo.
- Detalles de animación: sobrios, respetando `prefers-reduced-motion`.
- Si una API existente sirve tal cual, se reutiliza; si no, se ajusta.
