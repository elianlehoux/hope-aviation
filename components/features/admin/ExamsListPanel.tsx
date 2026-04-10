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
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";

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

function formatDate(iso: string, locale: string = "es-ES") {
  return new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
  const { t, lang } = useTranslation();

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
      toast.error(t("adminDetail.examTitleRequired"));
      return;
    }
    if (!selectedCourseId || !selectedSubjectId) {
      toast.error(t("adminDetail.courseSubjectRequired"));
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
        toast.success(t("adminDetail.examUpdated"));
      } else {
        await createExam(selectedCourseId, selectedSubjectId, payload);
        toast.success(t("adminDetail.examCreated"));
      }
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("profile.errorUpdating"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("adminDetail.editExamConfig") : t("adminDetail.newExam")}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("adminDetail.updateExamDetails")
              : t("adminDetail.createExamNote")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="exam-course">{t("adminDetail.parentCourse")} <span className="text-red-500">*</span></Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger id="exam-course" className="bg-white">
                    <SelectValue placeholder={t("adminDetail.selectCourse")} />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesData.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {getLocalizedText(course.title, lang)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exam-subject">{t("adminDetail.subjectModule")} <span className="text-red-500">*</span></Label>
                <Select 
                  value={selectedSubjectId} 
                  onValueChange={setSelectedSubjectId}
                  disabled={!selectedCourseId || availableSubjects.length === 0}
                >
                  <SelectTrigger id="exam-subject" className="bg-white">
                    <SelectValue placeholder={
                      !selectedCourseId ? t("adminDetail.firstChooseCourse") : 
                      availableSubjects.length === 0 ? t("adminDetail.courseNoModules") : 
                      t("adminDetail.selectModule")
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map(sub => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {getLocalizedText(sub.title, lang)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-title-es">{t("adminDetail.titleEs")} <span className="text-red-500">*</span></Label>
              <Input
                id="exam-title-es"
                placeholder={lang === "es" ? "Ej. Evaluación Final" : "e.g. Final Assessment"}
                value={titleEs}
                onChange={(e) => setTitleEs(e.target.value)}
                required={!titleEn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-title-en">{t("adminDetail.titleEn")}</Label>
              <Input
                id="exam-title-en"
                placeholder={lang === "en" ? "e.g. Final Assessment" : "Ej. Evaluación Final"}
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                required={!titleEs}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-desc-es">{t("adminDetail.instructionsEs")}</Label>
              <Textarea
                id="exam-desc-es"
                placeholder={lang === "es" ? "Instrucciones previas al examen..." : "Exam instructions..."}
                value={descEs}
                onChange={(e) => setDescEs(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-desc-en">{t("adminDetail.instructionsEn")}</Label>
              <Textarea
                id="exam-desc-en"
                placeholder={lang === "en" ? "Pre-flight instructions..." : "Instrucciones..."}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="exam-score">{t("adminDetail.passingScore")}</Label>
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
              <Label htmlFor="exam-limit">{t("adminDetail.timeLimit")}</Label>
              <Input
                id="exam-limit"
                type="number"
                min="1"
                placeholder={t("adminDetail.unlimited")}
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground leading-tight">{t("adminDetail.unlimitedTimeNote")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-attempts">{t("adminDetail.maxAttemptsLabel")}</Label>
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
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? t("adminDetail.saveChanges") : t("adminDetail.newExam")}
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
  const { t, lang } = useTranslation();

  async function handleDelete() {
    if (!exam) return;
    setDeleting(true);
    try {
      await deleteExam(exam.course_id, exam.subject_id, exam.id);
      toast.success(t("adminDetail.examDeleted"));
      onDeleted();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("profile.errorUpdating"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("adminDetail.deleteExam")}</DialogTitle>
          <DialogDescription>
            {t("adminDetail.deleteExamConfirm").replace("{name}", getLocalizedText(exam?.title ?? null, lang))}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">{t("common.cancel")}</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting && <Loader2 className="size-4 animate-spin" />}
            {t("adminDetail.deleteExam")}
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
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 mb-5">
        <FileQuestion className="size-8 text-accent" />
      </div>
      <p className="text-lg font-semibold text-primary tracking-tight">
        {t("adminDetail.noExamsYet")}
      </p>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">
        {t("adminDetail.createExamsNote")}
      </p>
      <Button className="mt-6" onClick={onCreateClick}>
        <Plus className="size-4" />
        {t("adminDetail.newExam")}
      </Button>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function ExamsListPanel({ coursesData }: { coursesData: CourseItem[] }) {
  const { t, lang } = useTranslation();
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
      toast.error(t("profile.errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
            {t("adminDetail.examsTitle")}
          </Title>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            {t("adminDetail.examsSubtitle")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full sm:w-[240px] bg-white">
              <BookOpen className="size-4 mr-2 text-slate-400" />
              <SelectValue placeholder={t("adminDetail.filterCourse")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("adminDetail.allCourses")}</SelectItem>
              {coursesData.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {getLocalizedText(course.title, lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleCreate} className="shrink-0 self-start sm:self-auto">
            <Plus className="size-4" />
            {t("adminDetail.newExam")}
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
          <p className="text-base font-semibold text-primary">{t("adminDetail.noExamsFound")}</p>
          <p className="text-sm text-slate-500 mt-1">{t("adminDetail.courseNoExams")}</p>
          <Button variant="ghost" className="mt-4 text-accent" onClick={() => setCourseFilter("all")}>
            {t("adminDetail.viewAllExams")}
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>{t("adminDetail.columnExam")}</TableHead>
                <TableHead>{t("adminDetail.columnCourseSubject")}</TableHead>
                <TableHead>{t("adminDetail.columnScore")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("adminDetail.columnLimit")}</TableHead>
                <TableHead className="text-right">{t("adminDetail.columnActions")}</TableHead>
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
                          {getLocalizedText(exam.title, lang)}
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
                          {t("adminDetail.minScore").replace("{score}", String(exam.passing_score))}
                        </Badge>
                        <span className="text-[11px] text-slate-400 ml-1">{t("adminDetail.maxAttempts").replace("{count}", String(exam.max_attempts))}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col justify-center">
                         <span className="text-sm font-medium text-slate-700">
                           {exam.time_limit_minutes ? t("adminDetail.minutes").replace("{count}", String(exam.time_limit_minutes)) : t("adminDetail.unlimited")}
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
                              <Link href={`/campus/admin/exams/${exam.id}`} aria-label={t("adminDetail.designQuestions")}>
                                <LayoutList className="size-3.5 text-accent" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t("adminDetail.designQuestions")}</TooltipContent>
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
