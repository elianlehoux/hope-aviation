"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, FileJson, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/modal";
import { fieldControl } from "@/components/features/campus/ui/field";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { api, courseRoutes } from "../course/api";

// Ported from the legacy ExamEditorPanel import modal: same JSON format and AI prompt.
const EXAMPLE_JSON = `[
  {
    "content": { "es": "¿Cuál es la función del timón de dirección?" },
    "points": 1,
    "options": [
      { "content": { "es": "Controlar el alabeo" }, "is_correct": false },
      { "content": { "es": "Controlar la guiñada" }, "is_correct": true }
    ]
  }
]`;

const AI_PROMPT = {
  es: "Actuá como un asistente experto. Tengo una lista de preguntas de examen y necesito que las conviertas EXACTAMENTE al siguiente formato JSON para importarlas en mi sistema:\n\nFormato de ejemplo:\n{example}\n\nReglas:\n1. El resultado debe ser un arreglo de objetos JSON.\n2. Cada pregunta debe tener 'content' con la clave 'es' (o 'en' si es inglés).\n3. Cada pregunta debe tener 'points' (generalmente 1).\n4. El campo 'options' debe ser un arreglo con las alternativas.\n5. 'is_correct' debe ser true para la respuesta correcta y false para las demás.\n\nAcá tenés mis preguntas:\n[PEGÁ ACÁ TUS PREGUNTAS]",
  en: "Act as an expert assistant. I have a list of exam questions and I need you to convert them EXACTLY to the following JSON format for import into my system:\n\nExample format:\n{example}\n\nRules:\n1. The result must be a JSON array of objects.\n2. Each question must have 'content' with key 'es' (or 'en' if it's English).\n3. Each question must have 'points' (usually 1).\n4. The 'options' field must be an array with alternatives.\n5. 'is_correct' must be true for the correct answer and false for others.\n\nHere are my questions:\n[PASTE YOUR QUESTIONS HERE]",
};

/** Parses pasted JSON into the batch payload. Accepts a bare array or `{ questions: [...] }`. */
function parseBatch(text: string): { questions: unknown[] } | "empty" | "invalid_json" | "not_array" {
  if (!text.trim()) return "empty";
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return "invalid_json";
  }
  const payload = Array.isArray(parsed) ? { questions: parsed } : (parsed as { questions?: unknown });
  if (!payload || !Array.isArray(payload.questions)) return "not_array";
  return { questions: payload.questions };
}

export function BatchImportDialog({
  courseId,
  subjectId,
  examId,
  open,
  onOpenChange,
}: {
  courseId: string;
  subjectId: string;
  examId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const messages = {
    empty: es ? "Pegá el JSON con las preguntas." : "Paste the questions JSON.",
    invalid_json: es ? "Ese texto no es un JSON válido." : "That text isn't valid JSON.",
    not_array: es ? "El JSON tiene que ser un arreglo de preguntas." : "The JSON must be an array of questions.",
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText((es ? AI_PROMPT.es : AI_PROMPT.en).replace("{example}", EXAMPLE_JSON));
      toast.success(es ? "Instrucciones copiadas. Pegalas en tu IA junto con tus preguntas." : "Instructions copied. Paste them into your AI with your questions.");
    } catch {
      toast.error(es ? "No se pudo copiar." : "Couldn't copy.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseBatch(text);
    if (typeof parsed === "string") {
      setError(messages[parsed]);
      return;
    }
    setPending(true);
    setError(null);
    const res = await api<{ count: number }>(courseRoutes(courseId).questionsBatch(subjectId, examId), "POST", parsed);
    setPending(false);
    if (!res.ok) {
      setError(
        res.code === "validation_error"
          ? es
            ? "El formato no coincide: cada pregunta necesita 'content' y al menos una opción en 'options'."
            : "Format mismatch: each question needs 'content' and at least one option in 'options'."
          : es
            ? "No se pudieron importar las preguntas."
            : "Couldn't import the questions.",
      );
      return;
    }
    const n = res.data?.count ?? parsed.questions.length;
    toast.success(es ? `Se importaron ${n} preguntas` : `${n} questions imported`);
    setText("");
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto p-6 sm:max-w-2xl sm:p-8">
        <form onSubmit={submit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle className="font-display">{es ? "Importar preguntas en lote" : "Batch import questions"}</DialogTitle>
            <DialogDescription>
              {es
                ? "Pegá un arreglo de preguntas en JSON y se suman al final del examen."
                : "Paste a JSON array of questions and they're added at the end of the exam."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 rounded-2xl bg-info px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-primary/80">
              {es
                ? "¿No sabés armar el JSON? Copiá estas instrucciones y pegáselas a una IA (como ChatGPT) junto con tus preguntas."
                : "Not sure how to write the JSON? Copy these instructions and paste them into an AI (like ChatGPT) with your questions."}
            </p>
            <Button type="button" variant="outline" size="sm" className="shrink-0 bg-white" onClick={() => void copyPrompt()}>
              <Copy aria-hidden />
              {es ? "Copiar prompt" : "Copy prompt"}
            </Button>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="batch-json" className="text-sm font-semibold text-primary/80">
              JSON
            </label>
            <textarea
              id="batch-json"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="[{ … }]"
              spellCheck={false}
              aria-invalid={Boolean(error) || undefined}
              className={cn(fieldControl, "h-64 resize-y font-mono text-[13px] leading-relaxed")}
            />
            {error ? (
              <p role="alert" className="text-xs font-medium text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <details className="rounded-xl border border-primary/10 px-4 py-3 text-sm">
            <summary className="flex cursor-pointer items-center gap-2 font-semibold text-primary/70">
              <FileJson className="size-4" aria-hidden />
              {es ? "Ver el formato de ejemplo" : "See the example format"}
            </summary>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-primary px-4 py-3 font-mono text-xs leading-relaxed text-white/90">
              {EXAMPLE_JSON}
            </pre>
          </details>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              {es ? "Cancelar" : "Cancel"}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              {es ? "Importar" : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
