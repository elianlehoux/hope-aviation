"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowLeft,
  GripVertical,
  CheckCircle2,
  Circle,
  AlertCircle,
  HelpCircle,
  Copy,
  Info
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Modal,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/shared/modal";

import type { Exam, Question, Option, TranslatedText } from "@/types/database";

type ExamWithRelations = Exam & {
  course: { id: string; title: TranslatedText } | null;
  subject: { id: string; title: TranslatedText } | null;
};

type QuestionWithOptions = Question & {
  options: Option[];
};

function getLocalizedText(text: TranslatedText | null, primaryLocale: "es" | "en" = "es"): string {
  if (!text) return "—";
  const fallbackLocale = primaryLocale === "es" ? "en" : "es";
  return text[primaryLocale] || text[fallbackLocale] || "—";
}

// ─── API Helpers ────────────────────────────────────────────────────────────────

async function fetchQuestions(courseId: string, subjectId: string, examId: string): Promise<QuestionWithOptions[]> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/exams/${examId}/questions`);
  if (!res.ok) throw new Error("Error loading questions");
  const json = await res.json();
  return json.data.questions;
}

// Questions
async function createQuestion(courseId: string, subjectId: string, examId: string, payload: any) {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/exams/${examId}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error creating question");
  return (await res.json()).data.question;
}

async function updateQuestion(courseId: string, subjectId: string, examId: string, qId: string, payload: any) {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/exams/${examId}/questions/${qId}`, {
    method: "PATCH", // Ensure backend supports PUT or PATCH
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error updating question");
  return (await res.json()).data.question;
}

async function deleteQuestion(courseId: string, subjectId: string, examId: string, qId: string) {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/exams/${examId}/questions/${qId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) throw new Error("Error deleting question");
}

async function reorderQuestions(courseId: string, subjectId: string, examId: string, orderedIds: string[]) {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/exams/${examId}/questions/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderedQuestionIds: orderedIds }),
  });
  if (!res.ok) throw new Error("Error reordering questions");
}

async function importQuestionsBatch(courseId: string, subjectId: string, examId: string, payload: any) {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/exams/${examId}/questions/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Error al importar preguntas");
  }
  return await res.json();
}

// Options
async function createOption(courseId: string, subjectId: string, examId: string, qId: string, payload: any) {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/exams/${examId}/questions/${qId}/options`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error creating option");
  return (await res.json()).data.option;
}

async function updateOption(courseId: string, subjectId: string, examId: string, qId: string, optId: string, payload: any) {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/exams/${examId}/questions/${qId}/options/${optId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error updating option");
  return (await res.json()).data.option;
}

async function deleteOption(courseId: string, subjectId: string, examId: string, qId: string, optId: string) {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/exams/${examId}/questions/${qId}/options/${optId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) throw new Error("Error deleting option");
}

// ─── Question Form Modal ────────────────────────────────────────────────────
interface QuestionFormProps {
  exam: ExamWithRelations;
  question?: QuestionWithOptions | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function QuestionFormModal({ exam, question, open, onOpenChange, onSaved }: QuestionFormProps) {
  const isEdit = !!question;

  const [contentEs, setContentEs] = React.useState("");
  const [contentEn, setContentEn] = React.useState("");
  const [points, setPoints] = React.useState<number>(1);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setContentEs(question?.content.es ?? "");
      setContentEn(question?.content.en ?? "");
      setPoints(question?.points ?? 1);
    }
  }, [open, question]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contentEs.trim() && !contentEn.trim()) {
      toast.error("El temario debe ser establecido en algún idioma.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        content: {
          ...(contentEs.trim() ? { es: contentEs.trim() } : {}),
          ...(contentEn.trim() ? { en: contentEn.trim() } : {}),
        },
        points,
      };

      if (isEdit && question) {
        await updateQuestion(exam.course_id, exam.subject_id, exam.id, question.id, payload);
        toast.success("Pregunta actualizada.");
      } else {
        await createQuestion(exam.course_id, exam.subject_id, exam.id, payload);
        toast.success("Pregunta agregada.");
      }
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al guardar pregunta");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Pregunta" : "Nueva Pregunta"}</DialogTitle>
          <DialogDescription>
            Define el encabezado o enunciado de la pregunta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
             <Label htmlFor="q-content-es">Enunciado (ES) <span className="text-red-500">*</span></Label>
             <Textarea
               id="q-content-es"
               placeholder="¿Cuál es la función principal de...?"
               value={contentEs}
               onChange={(e) => setContentEs(e.target.value)}
               required={!contentEn}
               rows={3}
             />
          </div>
          <div className="space-y-2">
             <Label htmlFor="q-content-en">Enunciado (EN)</Label>
             <Textarea
               id="q-content-en"
               placeholder="What is the main function of...?"
               value={contentEn}
               onChange={(e) => setContentEn(e.target.value)}
               required={!contentEs}
               rows={3}
             />
          </div>
          <div className="space-y-2">
             <Label htmlFor="q-points">Puntaje / Valor de la pregunta</Label>
             <Input
               id="q-points"
               type="number"
               min="1"
               step="0.1"
               value={points}
               onChange={(e) => setPoints(Number(e.target.value))}
               className="max-w-[200px]"
             />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Guardar Pregunta" : "Añadir Pregunta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Option Form Modal ──────────────────────────────────────────────────────

interface OptionFormProps {
  exam: ExamWithRelations;
  question: QuestionWithOptions | null; // Required, the parent question
  option?: Option | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function OptionFormModal({ exam, question, option, open, onOpenChange, onSaved }: OptionFormProps) {
  const isEdit = !!option;

  const [contentEs, setContentEs] = React.useState("");
  const [contentEn, setContentEn] = React.useState("");
  const [isCorrect, setIsCorrect] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setContentEs(option?.content.es ?? "");
      setContentEn(option?.content.en ?? "");
      setIsCorrect(option?.is_correct ?? false);
    }
  }, [open, option]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question) return;
    if (!contentEs.trim() && !contentEn.trim()) {
      toast.error("La opción debe tener texto.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        content: {
          ...(contentEs.trim() ? { es: contentEs.trim() } : {}),
          ...(contentEn.trim() ? { en: contentEn.trim() } : {}),
        },
        is_correct: isCorrect,
      };

      if (isEdit && option) {
        await updateOption(exam.course_id, exam.subject_id, exam.id, question.id, option.id, payload);
        toast.success("Opción actualizada.");
      } else {
        await createOption(exam.course_id, exam.subject_id, exam.id, question.id, payload);
        toast.success("Opción añadida.");
      }
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al guardar opción");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Opción" : "Nueva Opción"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
             <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="opt-correct" 
                  checked={isCorrect}
                  onChange={(e) => setIsCorrect(e.target.checked)}
                  className="size-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                />
                <Label htmlFor="opt-correct" className="text-base font-medium cursor-pointer">
                  Marcar como la respuesta CORRECTA
                </Label>
             </div>
             {isCorrect && (
               <div className="bg-emerald-100/50 text-emerald-800 text-xs px-3 py-2 rounded-md">
                 Los estudiantes recibirán puntos si seleccionan esta opción.
               </div>
             )}
          </div>

          <div className="space-y-2">
             <Label htmlFor="o-content-es">Texto de la Opción (ES)</Label>
             <Input
               id="o-content-es"
               placeholder="Ej. Alternativa A..."
               value={contentEs}
               onChange={(e) => setContentEs(e.target.value)}
               required={!contentEn}
             />
          </div>
          <div className="space-y-2">
             <Label htmlFor="o-content-en">Texto de la Opción (EN)</Label>
             <Input
               id="o-content-en"
               placeholder="e.g. Alternative A..."
               value={contentEn}
               onChange={(e) => setContentEn(e.target.value)}
               required={!contentEs}
             />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={saving} variant={isCorrect ? "default" : "secondary"}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Guardar" : "Añadir Opción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Import JSON Modal ────────────────────────────────────────────────────────

interface ImportJsonModalProps {
  exam: ExamWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function ImportJsonModal({ exam, open, onOpenChange, onSaved }: ImportJsonModalProps) {
  const [jsonText, setJsonText] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setJsonText("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jsonText.trim()) {
      toast.error("El JSON no puede estar vacío.");
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      toast.error("Formato JSON inválido.");
      return;
    }

    // Wrap in expected { questions: [...] } format if it's just an array
    const payload = Array.isArray(parsed) ? { questions: parsed } : parsed;

    if (!payload.questions || !Array.isArray(payload.questions)) {
      toast.error("El JSON debe contener un arreglo de 'questions'.");
      return;
    }

    setSaving(true);
    try {
      const result = await importQuestionsBatch(exam.course_id, exam.subject_id, exam.id, payload);
      toast.success(`Importación exitosa (${result.data?.count || payload.questions.length} preguntas añadidas).`);
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al importar preguntas");
    } finally {
      setSaving(false);
    }
  }

  const exampleJson = `[
  {
    "content": { "es": "¿Cuál es la función del timón de dirección?" },
    "points": 1,
    "options": [
      { "content": { "es": "Controlar el alabeo" }, "is_correct": false },
      { "content": { "es": "Controlar la guiñada" }, "is_correct": true }
    ]
  }
]`;

  const aiPrompt = `Actúa como un asistente experto. Tengo una lista de preguntas de examen y necesito que las conviertas EXACTAMENTE al siguiente formato JSON para importarlas en mi sistema:

Formato de ejemplo:
${exampleJson}

Reglas:
1. El resultado debe ser un arreglo de objetos JSON.
2. Cada pregunta debe tener "content" con la clave "es" (o "en" si es inglés).
3. Cada pregunta debe tener "points" (generalmente 1).
4. El campo "options" debe ser un arreglo con las alternativas.
5. "is_correct" debe ser true para la respuesta correcta y false para las demás.

Aquí tienes mis preguntas:
[PEGA AQUÍ TUS PREGUNTAS]`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(aiPrompt);
    toast.success("Instrucciones para IA copiadas al portapapeles.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Importar Preguntas (JSON)</DialogTitle>
          <DialogDescription>
            Pega un arreglo de preguntas en formato JSON para añadirlas en lote al examen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
             <Info className="size-5 text-blue-600 shrink-0 mt-0.5" />
             <div className="space-y-2">
               <p className="text-sm text-blue-900 font-medium">¿No sabes cómo formatear el JSON?</p>
               <p className="text-xs text-blue-700 leading-relaxed">
                 Puedes pedirle a una IA (como ChatGPT) que convierta tus preguntas por ti. Haz clic en el botón de abajo para copiar las instrucciones exactas que debes pegarle.
               </p>
               <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={copyPrompt}
               >
                 <Copy className="size-3.5 mr-2" />
                 Copiar Prompt para IA
               </Button>
             </div>
          </div>

          <div className="space-y-2">
             <div className="flex justify-between items-center">
               <Label htmlFor="json-input">Cuerpo JSON <span className="text-red-500">*</span></Label>
               <Tooltip>
                 <TooltipTrigger type="button" className="text-xs text-primary hover:underline">
                    Ver Esquema de Ejemplo
                 </TooltipTrigger>
                 <TooltipContent side="left" className="w-[450px] p-0 overflow-hidden rounded-xl border border-slate-100 bg-white">
                    <div className="bg-slate-800 text-slate-50 p-4 text-xs font-mono whitespace-pre overflow-x-auto">
                      {exampleJson}
                    </div>
                 </TooltipContent>
               </Tooltip>
             </div>
             <Textarea
               id="json-input"
               placeholder="[{ ... }]"
               value={jsonText}
               onChange={(e) => setJsonText(e.target.value)}
               className="font-mono text-sm h-[300px] bg-slate-50 border-slate-200 focus:border-primary"
               required
             />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Importar JSON
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Editor Component ──────────────────────────────────────────────────

export default function ExamEditorPanel({ exam }: { exam: ExamWithRelations }) {
  const [questions, setQuestions] = React.useState<QuestionWithOptions[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  // Modals Question
  const [qFormOpen, setQFormOpen] = React.useState(false);
  const [editingQ, setEditingQ] = React.useState<QuestionWithOptions | null>(null);

  // Modals Option
  const [oFormOpen, setOFormOpen] = React.useState(false);
  const [targetQForOption, setTargetQForOption] = React.useState<QuestionWithOptions | null>(null);
  const [editingO, setEditingO] = React.useState<Option | null>(null);

  // Modals Import
  const [importFormOpen, setImportFormOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const raw = await fetchQuestions(exam.course_id, exam.subject_id, exam.id);
      setQuestions(raw);
    } catch {
      toast.error("Error al cargar las preguntas.");
    } finally {
      setLoading(false);
    }
  }, [exam.course_id, exam.subject_id, exam.id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);


  // Handlers Question
  function handleCreateQuestion() {
    setEditingQ(null);
    setQFormOpen(true);
  }
  function handleEditQuestion(q: QuestionWithOptions) {
    setEditingQ(q);
    setQFormOpen(true);
  }
  async function handleDeleteQuestion(q: QuestionWithOptions) {
    if (!confirm("¿Eliminar pregunta y todas sus opciones?")) return;
    try {
      await deleteQuestion(exam.course_id, exam.subject_id, exam.id, q.id);
      toast.success("Pregunta eliminada");
      loadData();
    } catch {
      toast.error("Falló la eliminación.");
    }
  }

  // Handlers Option
  function handleCreateOption(q: QuestionWithOptions) {
    setTargetQForOption(q);
    setEditingO(null);
    setOFormOpen(true);
  }
  function handleEditOption(q: QuestionWithOptions, o: Option) {
    setTargetQForOption(q);
    setEditingO(o);
    setOFormOpen(true);
  }
  async function handleDeleteOption(q: QuestionWithOptions, o: Option) {
    if (!confirm("¿Eliminar opción?")) return;
    try {
      await deleteOption(exam.course_id, exam.subject_id, exam.id, q.id, o.id);
      toast.success("Opción eliminada");
      loadData();
    } catch {
      toast.error("Falló la eliminación.");
    }
  }

  // Drag and drop for questions
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;

    const newArr = Array.from(questions);
    const [moved] = newArr.splice(sourceIndex, 1);
    newArr.splice(destIndex, 0, moved);

    // Optimistic UI update
    setQuestions(newArr);

    const orderedIds = newArr.map((q) => q.id);
    try {
      await reorderQuestions(exam.course_id, exam.subject_id, exam.id, orderedIds);
    } catch {
      toast.error("Error al guardar el nuevo orden. Revirtiendo.");
      loadData();
    }
  };

  // Status checks
  const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <Link href="/campus/admin/exams" className="text-sm font-medium text-slate-500 hover:text-primary flex items-center gap-1 mb-2 transition-colors">
             <ArrowLeft className="size-4" /> Volver a Exámenes
          </Link>
          <Title level="h2" as="h1" className="flex items-center gap-3">
             {getLocalizedText(exam.title)}
             <Badge variant="outline" className="bg-white">Configuración</Badge>
          </Title>
          <p className="mt-1 text-sm text-slate-500 font-medium">
             Gestión del temario y opciones verdaderas/falsas.
          </p>
        </div>
        <div className="flex gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex flex-col items-center px-4 border-r border-slate-100">
             <span className="text-xl font-bold text-primary">{exam.passing_score}%</span>
             <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Mínimo</span>
           </div>
           <div className="flex flex-col items-center px-4 border-r border-slate-100">
             <span className="text-xl font-bold text-accent">{totalPoints}</span>
             <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Pts Tolal</span>
           </div>
           <div className="flex flex-col items-center px-4">
             <span className="text-xl font-bold text-primary">{questions.length}</span>
             <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Preguntas</span>
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-accent/5 p-4 rounded-xl border border-accent/10 gap-4">
        <span className="text-sm text-slate-600">
           Generando preguntas para el módulo <strong>{getLocalizedText(exam.subject?.title ?? null)}</strong> del curso <strong>{getLocalizedText(exam.course?.title ?? null)}</strong>.
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" className="bg-white" onClick={() => setImportFormOpen(true)}>
            Importar JSON
          </Button>
          <Button onClick={handleCreateQuestion}>
            <Plus className="size-4" />
            Añadir Pregunta
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
           {[1,2,3].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 backdrop-blur-sm">
          <HelpCircle className="size-16 text-slate-300 mb-5" />
          <h3 className="text-xl font-semibold text-primary tracking-tight">Cuestionario Vacío</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
             Añade tu primera pregunta para empezar a armar el test. Podrás asignar puntaje individual a cada una.
          </p>
          <Button onClick={handleCreateQuestion} className="mt-6">Añadir Primera Pregunta</Button>
        </div>
      ) : mounted ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questions" type="QUESTION">
            {(provided) => (
              <div 
                className="space-y-6"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {questions.map((q, index) => {
                  const hasCorrect = q.options.some(o => o.is_correct);
                  
                  return (
                  <Draggable key={q.id} draggableId={q.id} index={index}>
                    {(dragProvided) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/40 overflow-hidden"
                      >
                        {/* Question Header */}
                        <div className="flex items-start gap-3 p-5 border-b border-slate-50 bg-slate-50/50 group/qHeader">
                           <div 
                             {...dragProvided.dragHandleProps}
                             className="mt-1 cursor-grab opacity-30 hover:opacity-100 transition-opacity"
                           >
                             <GripVertical className="size-5" />
                           </div>
                           <div className="flex-1 space-y-1">
                             <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-primary tracking-tight leading-snug">
                                   {index + 1}. {getLocalizedText(q.content)}
                                </h3>
                                <Badge variant="secondary" className="font-mono bg-white shadow-sm border-slate-200">
                                   {q.points} Pts
                                </Badge>
                             </div>
                             {(q.content.en || q.content.es) && (q.content.es !== q.content.en) && (
                                <p className="text-sm text-slate-400">
                                  {q.content.en ? q.content.en : q.content.es}
                                </p>
                             )}
                           </div>
                           <div className="flex gap-1 ml-4 transition-opacity opacity-0 group-hover/qHeader:opacity-100">
                             <Button variant="outline" size="icon-xs" onClick={() => handleEditQuestion(q)}>
                               <Pencil className="size-3.5" />
                             </Button>
                             <Button variant="outline" size="icon-xs" onClick={() => handleDeleteQuestion(q)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                               <Trash2 className="size-3.5" />
                             </Button>
                           </div>
                        </div>

                        {/* Options Section */}
                        <div className="p-5 pl-[4.5rem]">
                           <div className="space-y-3 relative">
                             <div className="absolute left-[-1.5rem] top-0 bottom-0 w-[2px] bg-slate-100 rounded-full" />
                             
                             {q.options.length === 0 ? (
                               <p className="text-sm text-slate-400 italic">No hay opciones formuladas todavía.</p>
                             ) : (
                               q.options.map((opt) => (
                                 <div 
                                   key={opt.id} 
                                   className={`flex items-center justify-between p-3 rounded-xl border transition-colors group/opt relative
                                     ${opt.is_correct ? "bg-emerald-50/50 border-emerald-200" : "bg-white hover:bg-slate-50 border-slate-200"}
                                   `}
                                 >
                                    <div className="flex items-center gap-3">
                                      {opt.is_correct ? (
                                        <CheckCircle2 className="size-5 text-emerald-600" />
                                      ) : (
                                        <Circle className="size-5 text-slate-300" />
                                      )}
                                      <span className={`text-sm font-medium ${opt.is_correct ? "text-emerald-900" : "text-slate-700"}`}>
                                         {getLocalizedText(opt.content)}
                                      </span>
                                    </div>

                                    <div className="flex gap-1 opacity-0 group-hover/opt:opacity-100 transition-opacity">
                                       <Button variant="ghost" size="icon-xs" onClick={() => handleEditOption(q, opt)}>
                                         <Pencil className="size-3.5" />
                                       </Button>
                                       <Button variant="ghost" size="icon-xs" onClick={() => handleDeleteOption(q, opt)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                         <Trash2 className="size-3.5" />
                                       </Button>
                                    </div>
                                 </div>
                               ))
                             )}

                             {!hasCorrect && q.options.length > 0 && (
                               <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                                 <AlertCircle className="size-4" />
                                 Cuidado: Esta pregunta no tiene marcada ninguna opción correcta.
                               </div>
                             )}

                             <Button variant="outline" size="sm" onClick={() => handleCreateOption(q)} className="mt-4 border-dashed bg-transparent hover:bg-slate-50">
                               <Plus className="size-3.5 mr-1" /> Añadir Opción
                             </Button>
                           </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                )})}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : null}

      {/* Modals */}
      <QuestionFormModal
        exam={exam}
        question={editingQ}
        open={qFormOpen}
        onOpenChange={setQFormOpen}
        onSaved={loadData}
      />

      <OptionFormModal
        exam={exam}
        question={targetQForOption}
        option={editingO}
        open={oFormOpen}
        onOpenChange={setOFormOpen}
        onSaved={loadData}
      />

      <ImportJsonModal
        exam={exam}
        open={importFormOpen}
        onOpenChange={setImportFormOpen}
        onSaved={loadData}
      />
    </div>
  );
}
