"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  LayoutList,
  FileQuestion,
} from "lucide-react";

import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/shared/table";
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

import type { Exam, TranslatedText } from "@/types/database";

type SubjectItem = { id: string; title: TranslatedText };
type CourseItem = { id: string; title: TranslatedText; status: string; subjects: SubjectItem[] };

type ExamWithRelations = Exam & {
  course: { id: string; title: TranslatedText; status: string } | null;
  subject: { id: string; title: TranslatedText } | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getLocalizedText(text: TranslatedText | null, primaryLocale: "es" | "en" = "es"): string {
  if (!text) return "—";
  const fallbackLocale = primaryLocale === "es" ? "en" : "es";
  return text[primaryLocale] || text[fallbackLocale] || "—";
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchExams(): Promise<ExamWithRelations[]> {
  const res = await fetch(`/api/exams`);
  if (!res.ok) throw new Error("Error loading exams");
  const json = await res.json();
  return json.data.exams;
}

async function createExam(courseId: string, subjectId: string, payload: any): Promise<Exam> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/exams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error creating exam");
  return (await res.json()).data.exam;
}

async function updateExam(courseId: string, subjectId: string, examId: string, payload: any): Promise<Exam> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/exams/${examId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error updating exam");
  return (await res.json()).data.exam;
}

async function deleteExam(courseId: string, subjectId: string, examId: string): Promise<void> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/exams/${examId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) throw new Error("Error deleting exam");
}

// ─── Exam Form Modal ─────────────────────────────────────────────────────────

interface ExamFormProps {
  exam?: ExamWithRelations | null;
  coursesData: CourseItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function ExamFormModal({ exam, coursesData, open, onOpenChange, onSaved }: ExamFormProps) {
  const isEdit = !!exam;

  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>("");

  const [titleEs, setTitleEs] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [descEs, setDescEs] = React.useState("");
  const [descEn, setDescEn] = React.useState("");
  const [passingScore, setPassingScore] = React.useState<number>(70);
  const [timeLimit, setTimeLimit] = React.useState<string>("");
  const [maxAttempts, setMaxAttempts] = React.useState<number>(1);
  
  const [saving, setSaving] = React.useState(false);

  // Derive available subjects based on selected course
  const availableSubjects = React.useMemo(() => {
    if (!selectedCourseId) return [];
    const course = coursesData.find((c) => c.id === selectedCourseId);
    return course?.subjects ?? [];
  }, [selectedCourseId, coursesData]);

  // Sync state
  React.useEffect(() => {
    if (open) {
      if (exam) {
        setSelectedCourseId(exam.course_id);
        setSelectedSubjectId(exam.subject_id);
        setTitleEs(exam.title?.es ?? "");
        setTitleEn(exam.title?.en ?? "");
        setDescEs(exam.description?.es ?? "");
        setDescEn(exam.description?.en ?? "");
        setPassingScore(exam.passing_score ?? 70);
        setTimeLimit(exam.time_limit_minutes ? String(exam.time_limit_minutes) : "");
        setMaxAttempts(exam.max_attempts ?? 1);
      } else {
        setSelectedCourseId("");
        setSelectedSubjectId("");
        setTitleEs("");
        setTitleEn("");
        setDescEs("");
        setDescEn("");
        setPassingScore(70);
        setTimeLimit("");
        setMaxAttempts(1);
      }
    }
  }, [exam, open]);

  // Auto-reset subject if course changes and subject is not in course
  React.useEffect(() => {
    if (selectedCourseId && selectedSubjectId) {
      const isValid = availableSubjects.some((s) => s.id === selectedSubjectId);
      if (!isValid) setSelectedSubjectId("");
    }
  }, [selectedCourseId, availableSubjects, selectedSubjectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleEs.trim() && !titleEn.trim()) {
      toast.error("El examen debe tener un título (ES o EN).");
      return;
    }
    if (!selectedCourseId || !selectedSubjectId) {
      toast.error("Debes asociar el examen a un Curso y un Módulo.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: {
          ...(titleEs.trim() ? { es: titleEs.trim() } : {}),
          ...(titleEn.trim() ? { en: titleEn.trim() } : {}),
        },
        description: {
          ...(descEs.trim() ? { es: descEs.trim() } : {}),
          ...(descEn.trim() ? { en: descEn.trim() } : {}),
        },
        passing_score: passingScore,
        time_limit_minutes: timeLimit ? parseInt(timeLimit, 10) : null,
        max_attempts: maxAttempts,
      };

      if (isEdit && exam) {
        await updateExam(exam.course_id, exam.subject_id, exam.id, payload);
        toast.success("Examen actualizado correctamente.");
      } else {
        await createExam(selectedCourseId, selectedSubjectId, payload);
        toast.success("Examen creado correctamente.");
      }
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Ha ocurrido un error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Configuración del Examen" : "Nuevo Examen"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza los detalles y reglas principales de evaluación."
              : "Crea un nuevo examen y asócialo a un módulo específico."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="exam-course">Curso Padre <span className="text-red-500">*</span></Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger id="exam-course" className="bg-white">
                    <SelectValue placeholder="Selecciona un curso..." />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesData.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {getLocalizedText(course.title)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exam-subject">Módulo (Subject) <span className="text-red-500">*</span></Label>
                <Select 
                  value={selectedSubjectId} 
                  onValueChange={setSelectedSubjectId}
                  disabled={!selectedCourseId || availableSubjects.length === 0}
                >
                  <SelectTrigger id="exam-subject" className="bg-white">
                    <SelectValue placeholder={
                      !selectedCourseId ? "Primero elige un curso" : 
                      availableSubjects.length === 0 ? "El curso no tiene módulos" : 
                      "Selecciona un módulo..."
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map(sub => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {getLocalizedText(sub.title)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-title-es">Título (ES) <span className="text-red-500">*</span></Label>
              <Input
                id="exam-title-es"
                placeholder="Ej. Evaluación Final"
                value={titleEs}
                onChange={(e) => setTitleEs(e.target.value)}
                required={!titleEn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-title-en">Título (EN)</Label>
              <Input
                id="exam-title-en"
                placeholder="e.g. Final Assessment"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                required={!titleEs}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-desc-es">Instrucciones (ES)</Label>
              <Textarea
                id="exam-desc-es"
                placeholder="Instrucciones previas al examen..."
                value={descEs}
                onChange={(e) => setDescEs(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-desc-en">Instrucciones (EN)</Label>
              <Textarea
                id="exam-desc-en"
                placeholder="Pre-flight instructions..."
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="exam-score">Nota para Aprobar (0-100)</Label>
              <Input
                id="exam-score"
                type="number"
                min="0"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-limit">Tiempo Límite (Minutos)</Label>
              <Input
                id="exam-limit"
                type="number"
                min="1"
                placeholder="Ilimitado"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground leading-tight">Dejar vacío para tiempo prudencial ilimitado.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-attempts">Intentos Máximos</Label>
              <Input
                id="exam-attempts"
                type="number"
                min="1"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Guardar Configuración" : "Crear Examen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

interface DeleteConfirmProps {
  exam: ExamWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

function DeleteExamModal({ exam, open, onOpenChange, onDeleted }: DeleteConfirmProps) {
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    if (!exam) return;
    setDeleting(true);
    try {
      await deleteExam(exam.course_id, exam.subject_id, exam.id);
      toast.success(`Examen eliminado.`);
      onDeleted();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Examen</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el examen{" "}
            <strong className="text-primary">{getLocalizedText(exam?.title ?? null)}</strong>? 
            Esta acción borrará todas sus preguntas y opciones para siempre.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting && <Loader2 className="size-4 animate-spin" />}
            Eliminar Examen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function ExamsTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function ExamsEmpty({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 mb-5">
        <FileQuestion className="size-8 text-accent" />
      </div>
      <p className="text-lg font-semibold text-primary tracking-tight">
        No hay exámenes todavía
      </p>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">
        Crea evaluaciones enlazadas a módulos de cursos para medir el desempeño de los estudiantes.
      </p>
      <Button className="mt-6" onClick={onCreateClick}>
        <Plus className="size-4" />
        Nuevo Examen
      </Button>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function ExamsListPanel({ coursesData }: { coursesData: CourseItem[] }) {
  const [exams, setExams] = React.useState<ExamWithRelations[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modal states
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingExam, setEditingExam] = React.useState<ExamWithRelations | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingExam, setDeletingExam] = React.useState<ExamWithRelations | null>(null);

  // Filter state
  const [courseFilter, setCourseFilter] = React.useState<string>("all");

  const loadExams = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchExams();
      setExams(data);
    } catch {
      toast.error("No se pudieron cargar los exámenes.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadExams();
  }, [loadExams]);

  function handleCreate() {
    setEditingExam(null);
    setFormOpen(true);
  }

  function handleEdit(exam: ExamWithRelations) {
    setEditingExam(exam);
    setFormOpen(true);
  }

  function handleDeleteClick(exam: ExamWithRelations) {
    setDeletingExam(exam);
    setDeleteOpen(true);
  }

  // Derived filtered listing
  const filteredExams = React.useMemo(() => {
    if (courseFilter === "all") return exams;
    return exams.filter((e) => e.course_id === courseFilter);
  }, [exams, courseFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level="h3" as="h1">
            Gestor de Exámenes
          </Title>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Central de evaluaciones. Monitorea y edita cualquier examen del campus.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full sm:w-[240px] bg-white">
              <BookOpen className="size-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Filtrar por curso..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Cursos</SelectItem>
              {coursesData.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {getLocalizedText(course.title)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleCreate} className="shrink-0 self-start sm:self-auto">
            <Plus className="size-4" />
            Crear Examen
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <ExamsTableSkeleton />
      ) : exams.length === 0 ? (
        <ExamsEmpty onCreateClick={handleCreate} />
      ) : filteredExams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-xl bg-slate-50 mb-4">
             <BookOpen className="size-6 text-slate-300" />
          </div>
          <p className="text-base font-semibold text-primary">No se encontraron exámenes</p>
          <p className="text-sm text-slate-500 mt-1">El curso seleccionado no tiene evaluaciones configuradas.</p>
          <Button variant="ghost" className="mt-4 text-accent" onClick={() => setCourseFilter("all")}>
            Ver todas las evaluaciones
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>Examen</TableHead>
                <TableHead>Curso y Módulo</TableHead>
                <TableHead>Puntuación</TableHead>
                <TableHead className="hidden md:table-cell">Límite</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.map((exam) => {
                return (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <Link 
                          href={`/campus/admin/exams/${exam.id}`}
                          className="font-semibold text-primary tracking-tight hover:text-accent transition-colors text-base"
                        >
                          {getLocalizedText(exam.title)}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col gap-0.5">
                         <span className="text-sm font-medium text-slate-700">
                           {getLocalizedText(exam.course?.title ?? null)}
                         </span>
                         <span className="text-xs text-slate-500 flex items-center gap-1">
                            <div className="w-[1px] h-3 bg-slate-300 ml-1"></div>
                            <div className="w-2 h-[1px] bg-slate-300"></div>
                           {getLocalizedText(exam.subject?.title ?? null)}
                         </span>
                       </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit text-xs font-mono text-emerald-600 bg-emerald-50 border-emerald-200">
                          Min. {exam.passing_score}%
                        </Badge>
                        <span className="text-[11px] text-slate-400 ml-1">{exam.max_attempts} Intentos permitidos</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col justify-center">
                         <span className="text-sm font-medium text-slate-700">
                           {exam.time_limit_minutes ? `${exam.time_limit_minutes} Minutos` : "Ilimitado"}
                         </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              asChild
                              className="mr-2"
                            >
                              <Link href={`/campus/admin/exams/${exam.id}`} aria-label={`Diseñar Preguntas`}>
                                <LayoutList className="size-3.5 text-accent" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Diseñar Preguntas</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleEdit(exam)}
                              aria-label={`Editar Configuración`}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ajustes</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDeleteClick(exam)}
                              aria-label={`Eliminar Examen`}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modals */}
      <ExamFormModal
        exam={editingExam}
        coursesData={coursesData}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={loadExams}
      />
      <DeleteExamModal
        exam={deletingExam}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={loadExams}
      />
    </div>
  );
}
