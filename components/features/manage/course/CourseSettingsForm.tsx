"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusSurface } from "@/components/features/campus/ui/surface";
import { Field, fieldControl } from "@/components/features/campus/ui/field";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/database";
import { api, cleanOptionalText, cleanText, courseRoutes } from "./api";
import { BilingualField, pairOf, type Pair } from "./form-bits";
import { useBeforeUnload, useSaveShortcut } from "./hooks";

type Form = { title: Pair; description: Pair; cover: string; finalCount: string; finalScore: string; finalTime: string };

const formOf = (c: Course): Form => ({
  title: pairOf(c.title),
  description: pairOf(c.description),
  cover: c.thumbnail_url ?? "",
  finalCount: c.final_exam_question_count ? String(c.final_exam_question_count) : "",
  finalScore: String(Math.round(c.final_exam_passing_score ?? 70)),
  finalTime: c.final_exam_time_limit_minutes ? String(c.final_exam_time_limit_minutes) : "",
});

const isInt = (v: string) => /^\d+$/.test(v.trim());

function isHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Ajustes tab: course identity (title, description, cover) and the final exam. */
export function CourseSettingsForm({ course, availableQuestions }: { course: Course; availableQuestions: number }) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const [saved, setSaved] = React.useState(() => formOf(course));
  const [form, setForm] = React.useState(saved);
  const [errors, setErrors] = React.useState<Partial<Record<keyof Form, string>>>({});
  const [saving, setSaving] = React.useState(false);
  const [coverBroken, setCoverBroken] = React.useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  useBeforeUnload(dirty);
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const count = isInt(form.finalCount) ? Number(form.finalCount) : 0;
  const overPool = count > availableQuestions;

  const save = async () => {
    if (!dirty || saving) return;
    const next: typeof errors = {};
    const title = cleanText(form.title.es, form.title.en);
    if (!title.es && !title.en) next.title = es ? "El curso necesita un título." : "The course needs a title.";
    if (form.cover.trim() && !isHttpUrl(form.cover.trim())) {
      next.cover = es ? "Tiene que ser un link completo a una imagen (https://…)." : "Use a full image link (https://…).";
    }
    if (form.finalCount.trim() && !isInt(form.finalCount)) next.finalCount = es ? "Un número entero." : "A whole number.";
    if (!isInt(form.finalScore) || Number(form.finalScore) < 1 || Number(form.finalScore) > 100) {
      next.finalScore = es ? "Entre 1 y 100." : "Between 1 and 100.";
    }
    if (form.finalTime.trim() && (!isInt(form.finalTime) || Number(form.finalTime) < 1)) {
      next.finalTime = es ? "Minutos enteros, o vacío para sin límite." : "Whole minutes, or empty for no limit.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const res = await api(courseRoutes(course.id).course, "PATCH", {
      title,
      description: cleanOptionalText(form.description.es, form.description.en),
      thumbnail_url: form.cover.trim() || null,
      final_exam_question_count: count > 0 ? count : null,
      final_exam_passing_score: Number(form.finalScore),
      final_exam_time_limit_minutes: form.finalTime.trim() ? Number(form.finalTime) : null,
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(es ? "No se pudieron guardar los ajustes." : "Couldn't save the settings.");
      return;
    }
    setSaved(form);
    toast.success(es ? "Ajustes guardados" : "Settings saved");
    router.refresh();
  };
  useSaveShortcut(save, dirty);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Section
        title={es ? "El curso" : "The course"}
        note={es ? "Así aparece en el catálogo y en la ficha del curso." : "How it shows in the catalog and on the course page."}
      >
        <BilingualField
          id="course-title"
          label={es ? "Título" : "Title"}
          value={form.title}
          onChange={(v) => set("title", v)}
          error={errors.title}
        />
        <BilingualField
          id="course-description"
          label={es ? "Descripción" : "Description"}
          value={form.description}
          onChange={(v) => set("description", v)}
          multiline
          rows={4}
          hint={es ? "Dos o tres líneas: para quién es y qué se lleva." : "Two or three lines: who it's for and what they take away."}
        />
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-start">
          <Field
            label={es ? "Imagen de portada" : "Cover image"}
            htmlFor="course-cover"
            error={errors.cover}
            hint={es ? "Link a una foto horizontal (16:9). Opcional." : "Link to a landscape photo (16:9). Optional."}
          >
            <input
              id="course-cover"
              className={fieldControl}
              value={form.cover}
              inputMode="url"
              placeholder="https://…"
              onChange={(e) => {
                setCoverBroken(false);
                set("cover", e.target.value);
              }}
              aria-invalid={Boolean(errors.cover) || undefined}
            />
          </Field>
          <div className="aspect-video overflow-hidden rounded-xl border border-primary/10 bg-paper">
            {form.cover.trim() && isHttpUrl(form.cover.trim()) && !coverBroken ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary external URL preview
              <img
                src={form.cover.trim()}
                alt=""
                className="size-full object-cover"
                onError={() => setCoverBroken(true)}
              />
            ) : (
              <span className="grid size-full place-items-center text-primary/30">
                <ImageIcon className="size-6" aria-hidden />
              </span>
            )}
          </div>
        </div>
      </Section>

      <Section
        title={es ? "Examen final" : "Final exam"}
        note={
          es
            ? "Se arma al azar con preguntas de los exámenes de los módulos. Dejá la cantidad vacía si el curso no tiene final."
            : "Drawn at random from the module exams' questions. Leave the count empty if the course has no final."
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label={es ? "Cantidad de preguntas" : "Number of questions"}
            htmlFor="final-count"
            error={errors.finalCount}
          >
            <input
              id="final-count"
              className={cn(fieldControl, overPool && "border-highlight")}
              inputMode="numeric"
              value={form.finalCount}
              placeholder={es ? "Sin examen final" : "No final exam"}
              onChange={(e) => set("finalCount", e.target.value)}
              aria-describedby="final-count-pool"
              aria-invalid={Boolean(errors.finalCount) || undefined}
            />
            <p id="final-count-pool" className={cn("text-xs", overPool ? "font-semibold text-primary" : "text-primary/50")}>
              {es
                ? `${availableQuestions} ${availableQuestions === 1 ? "pregunta disponible" : "preguntas disponibles"}`
                : `${availableQuestions} ${availableQuestions === 1 ? "question available" : "questions available"}`}
              {overPool ? (es ? " · pedís más de las que hay" : " · more than there are") : ""}
            </p>
          </Field>
          <Field label={es ? "Nota mínima %" : "Pass mark %"} htmlFor="final-score" error={errors.finalScore}>
            <input
              id="final-score"
              className={fieldControl}
              inputMode="numeric"
              value={form.finalScore}
              onChange={(e) => set("finalScore", e.target.value)}
              aria-invalid={Boolean(errors.finalScore) || undefined}
            />
          </Field>
          <Field label={es ? "Tiempo (min)" : "Time (min)"} htmlFor="final-time" error={errors.finalTime}>
            <input
              id="final-time"
              className={fieldControl}
              inputMode="numeric"
              value={form.finalTime}
              placeholder={es ? "Sin límite" : "No limit"}
              onChange={(e) => set("finalTime", e.target.value)}
              aria-invalid={Boolean(errors.finalTime) || undefined}
            />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-full border border-primary/10 bg-white/90 py-2 pl-5 pr-2 backdrop-blur">
        <span className="mr-auto text-xs text-primary/50 sm:mr-0" aria-live="polite">
          {dirty ? (es ? "Cambios sin guardar · ⌘S" : "Unsaved changes · ⌘S") : es ? "Todo guardado" : "All saved"}
        </span>
        <Button onClick={() => void save()} disabled={!dirty || saving}>
          {saving ? <Loader2 className="animate-spin" aria-hidden /> : null}
          {es ? "Guardar ajustes" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <CampusSurface className="grid gap-6 p-5 sm:p-7 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="font-display text-lg font-semibold text-primary">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-primary/55">{note}</p>
      </div>
      <div className="min-w-0 space-y-6">{children}</div>
    </CampusSurface>
  );
}
