"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusSurface } from "@/components/features/campus/ui/surface";
import { Field, fieldControl } from "@/components/features/campus/ui/field";
import { useTranslation } from "@/lib/i18n/context";
import type { ManageExam } from "@/lib/campus/manage";
import { api, cleanOptionalText, cleanText, courseRoutes } from "../course/api";
import { BilingualField, pairOf, type Pair } from "../course/form-bits";
import { useBeforeUnload, useSaveShortcut } from "../course/hooks";

type Form = { title: Pair; description: Pair; passing: string; time: string; attempts: string };

const formOf = (e: ManageExam): Form => ({
  title: pairOf(e.title),
  description: pairOf(e.description),
  passing: String(Math.round(e.passing_score)),
  time: e.time_limit_minutes ? String(e.time_limit_minutes) : "",
  attempts: String(e.max_attempts),
});

/** Exam configuration: title, instructions, passing score, time limit and attempts. */
export function ExamSettingsForm({ courseId, exam }: { courseId: string; exam: ManageExam }) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const [saved, setSaved] = React.useState(() => formOf(exam));
  const [form, setForm] = React.useState(saved);
  const [errors, setErrors] = React.useState<Partial<Record<keyof Form, string>>>({});
  const [saving, setSaving] = React.useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  useBeforeUnload(dirty);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!dirty || saving) return;
    const next: typeof errors = {};
    const title = cleanText(form.title.es, form.title.en);
    if (!title.es && !title.en) next.title = es ? "El examen necesita un título." : "The exam needs a title.";
    const passing = Number(form.passing);
    if (!/^\d+$/.test(form.passing) || passing > 100) next.passing = es ? "Entre 0 y 100." : "Between 0 and 100.";
    if (form.time.trim() && (!/^\d+$/.test(form.time.trim()) || Number(form.time) < 1)) {
      next.time = es ? "Minutos enteros, o vacío para sin límite." : "Whole minutes, or empty for no limit.";
    }
    if (!/^\d+$/.test(form.attempts) || Number(form.attempts) < 1) next.attempts = es ? "Al menos 1." : "At least 1.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const res = await api(courseRoutes(courseId).exam(exam.subject_id, exam.id), "PATCH", {
      title,
      description: cleanOptionalText(form.description.es, form.description.en),
      passing_score: passing,
      time_limit_minutes: form.time.trim() ? Number(form.time.trim()) : null,
      max_attempts: Number(form.attempts),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(es ? "No se pudo guardar la configuración." : "Couldn't save the settings.");
      return;
    }
    setSaved(form);
    toast.success(es ? "Configuración guardada" : "Settings saved");
    router.refresh();
  };
  useSaveShortcut(save, dirty);

  return (
    <CampusSurface className="p-5 sm:p-7">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-primary">{es ? "Configuración" : "Settings"}</h2>
        <p className="text-xs text-primary/65">
          {es ? "Lo que ve el alumno antes de empezar." : "What learners see before they start."}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <BilingualField
            id="exam-title"
            label={es ? "Título" : "Title"}
            value={form.title}
            onChange={(v) => set("title", v)}
            error={errors.title}
          />
          <div className="grid grid-cols-3 gap-3">
            <Field label={es ? "Nota mínima %" : "Pass mark %"} htmlFor="exam-passing" error={errors.passing}>
              <input
                id="exam-passing"
                className={fieldControl}
                inputMode="numeric"
                value={form.passing}
                onChange={(e) => set("passing", e.target.value)}
                aria-invalid={Boolean(errors.passing) || undefined}
              />
            </Field>
            <Field label={es ? "Tiempo (min)" : "Time (min)"} htmlFor="exam-time" error={errors.time}>
              <input
                id="exam-time"
                className={fieldControl}
                inputMode="numeric"
                value={form.time}
                placeholder={es ? "Sin límite" : "No limit"}
                onChange={(e) => set("time", e.target.value)}
                aria-invalid={Boolean(errors.time) || undefined}
              />
            </Field>
            <Field label={es ? "Intentos" : "Attempts"} htmlFor="exam-attempts" error={errors.attempts}>
              <input
                id="exam-attempts"
                className={fieldControl}
                inputMode="numeric"
                value={form.attempts}
                onChange={(e) => set("attempts", e.target.value)}
                aria-invalid={Boolean(errors.attempts) || undefined}
              />
            </Field>
          </div>
        </div>
        <BilingualField
          id="exam-description"
          label={es ? "Instrucciones" : "Instructions"}
          value={form.description}
          onChange={(v) => set("description", v)}
          multiline
          rows={4}
          hint={es ? "Opcional. Por ejemplo: «Leé con calma; tenés dos intentos»." : "Optional. E.g. “Read calmly; you have two attempts.”"}
        />
      </div>
      <div className="mt-6 flex items-center justify-end gap-3 border-t border-primary/10 pt-4">
        <span className="hidden text-xs text-primary/65 sm:inline">
          {dirty ? (es ? "Cambios sin guardar · ⌘S" : "Unsaved changes · ⌘S") : es ? "Todo guardado" : "All saved"}
        </span>
        <Button onClick={() => void save()} disabled={!dirty || saving}>
          {saving ? <Loader2 className="animate-spin" aria-hidden /> : null}
          {es ? "Guardar configuración" : "Save settings"}
        </Button>
      </div>
    </CampusSurface>
  );
}
