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
  Video,
  FileText,
  Clock,
  Settings,
  FileQuestion,
  Save,
  ArrowLeft,
  ChevronRight,
  GripVertical
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { 
  Rocket,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
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
import { PublishValidationModal } from "./PublishValidationModal";

import type { Course, Subject, Class, Exam, TranslatedText, CourseStatus } from "@/types/database";
import { useRouter } from "next/navigation";

// Define the shape that the `/tree` endpoint returns
type SubjectWithClasses = Subject & { classes: Class[]; exams?: Exam[] };
type CourseTree = {
  course: Course & { total_questions_count?: number };
  subjects: SubjectWithClasses[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string, locale: string = "es-ES") {
  return new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: CourseStatus }) {
  const { t } = useTranslation();
  switch (status) {
    case "published":
      return <Badge variant="default">{t("adminDetail.published")}</Badge>;
    case "draft":
      return <Badge variant="secondary">{t("adminDetail.draft")}</Badge>;
    case "archived":
      return <Badge variant="outline" className="text-slate-500 border-slate-200">{t("adminDetail.archived")}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchCourseTree(courseId: string): Promise<CourseTree> {
  const res = await fetch(`/api/courses/${courseId}/tree`);
  if (!res.ok) throw new Error("Error loading course tree");
  const json = await res.json();
  return {
    course: json.data.course,
    subjects: json.data.subjects,
  };
}

// Subjects API
async function createSubject(courseId: string, payload: any): Promise<Subject> {
  const res = await fetch(`/api/courses/${courseId}/subjects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error creating subject");
  return (await res.json()).data.subject;
}

async function updateSubject(courseId: string, subjectId: string, payload: any): Promise<Subject> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error updating subject");
  return (await res.json()).data.subject;
}

async function deleteSubject(courseId: string, subjectId: string): Promise<void> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) throw new Error("Error deleting subject");
}

// Classes API
async function createClass(courseId: string, subjectId: string, payload: any): Promise<Class> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/classes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error?.message || "Error creating class");
  }
  return (await res.json()).data.class;
}

async function createModuleExam(courseId: string, subjectId: string): Promise<Exam> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/exams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: { es: "Examen del módulo", en: "Module exam" },
      passing_score: 70,
      max_attempts: 1,
    }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error?.message || "Error creating exam");
  }
  return (await res.json()).data.exam;
}

async function updateClass(courseId: string, subjectId: string, classId: string, payload: any): Promise<Class> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/classes/${classId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error updating class");
  return (await res.json()).data.class;
}

async function deleteClass(courseId: string, subjectId: string, classId: string): Promise<void> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/classes/${classId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) throw new Error("Error deleting class");
}

// Reorder API
async function reorderSubjects(courseId: string, orderedSubjectIds: string[]): Promise<void> {
  const res = await fetch(`/api/courses/${courseId}/subjects/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderedSubjectIds }),
  });
  if (!res.ok) throw new Error("Error guardando el nuevo orden de módulos");
}

async function reorderClasses(courseId: string, subjectId: string, orderedClassIds: string[]): Promise<void> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/classes/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderedClassIds }),
  });
  if (!res.ok) throw new Error("Error guardando el nuevo orden de clases");
}

async function updateCourseConfig(courseId: string, payload: any): Promise<Course> {
  const res = await fetch(`/api/courses/${courseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error actualizando la configuración del curso");
  return (await res.json()).data.course;
}


// ─── Course Config Modal ────────────────────────────────────────────────────────

interface CourseConfigProps {
  courseId: string;
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function CourseConfigModal({ courseId, course, open, onOpenChange, onSaved }: CourseConfigProps) {
  const { t } = useTranslation();
  const [questionCount, setQuestionCount] = React.useState("");
  const [timeLimit, setTimeLimit] = React.useState("");
  const [passingScore, setPassingScore] = React.useState("70");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setQuestionCount(course?.final_exam_question_count?.toString() ?? "");
      setTimeLimit(course?.final_exam_time_limit_minutes?.toString() ?? "");
      setPassingScore(course?.final_exam_passing_score?.toString() ?? "70");
    }
  }, [course, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        final_exam_question_count: questionCount !== "" ? parseInt(questionCount, 10) : null,
        final_exam_time_limit_minutes: timeLimit !== "" ? parseInt(timeLimit, 10) : null,
        final_exam_passing_score: passingScore !== "" ? parseInt(passingScore, 10) : 70,
      };

      await updateCourseConfig(courseId, payload);
      toast.success(t("adminDetail.configUpdated"));
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("adminDetail.finalExamConfig")}</DialogTitle>
          <DialogDescription>
             {t("adminDetail.finalExamDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cfg-qcount">{t("adminDetail.questionCountRandom")}</Label>
              <Input
                id="cfg-qcount"
                type="number"
                placeholder="Ej. 15"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfg-limit">{t("adminDetail.durationMinutes")}</Label>
              <Input
                id="cfg-limit"
                type="number"
                placeholder="Ej. 60"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfg-pass">Nota de aprobación (%)</Label>
              <Input
                id="cfg-pass"
                type="number"
                min={1}
                max={100}
                placeholder="70"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">{t("common.cancel")}</Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {t("adminDetail.saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


// ─── Subject Form Modal ───────────────────────────────────────────────────────

interface SubjectFormProps {
  courseId: string;
  subject?: Subject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function SubjectFormModal({ courseId, subject, open, onOpenChange, onSaved }: SubjectFormProps) {
  const { t, lang } = useTranslation();
  const isEdit = !!subject;

  const [titleEs, setTitleEs] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [descEs, setDescEs] = React.useState("");
  const [descEn, setDescEn] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTitleEs(subject?.title?.es ?? "");
      setTitleEn(subject?.title?.en ?? "");
      setDescEs(subject?.description?.es ?? "");
      setDescEn(subject?.description?.en ?? "");
    }
  }, [subject, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleEs.trim() && !titleEn.trim()) {
      toast.error(t("adminDetail.moduleTitleRequired"));
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
      };

      if (isEdit && subject) {
        await updateSubject(courseId, subject.id, payload);
        toast.success(t("adminDetail.moduleUpdated"));
      } else {
        await createSubject(courseId, payload);
        toast.success(t("adminDetail.moduleCreated"));
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("adminDetail.editModule") : t("adminDetail.newModule")}</DialogTitle>
          <DialogDescription>
             {t("adminDetail.moduleDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sub-title-es">{t("adminDetail.titleEs")} <span className="text-red-500">*</span></Label>
              <Input
                id="sub-title-es"
                placeholder={lang === "es" ? "Ej. Introducción" : "e.g. Introduction"}
                value={titleEs}
                onChange={(e) => setTitleEs(e.target.value)}
                required={!titleEn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-title-en">{t("adminDetail.titleEn")}</Label>
              <Input
                id="sub-title-en"
                placeholder={lang === "en" ? "e.g. Introduction" : "Ej. Introducción"}
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                required={!titleEs}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sub-desc-es">{t("adminDetail.descEs")}</Label>
              <Textarea
                id="sub-desc-es"
                placeholder={lang === "es" ? "Descripción en español..." : "Description in Spanish..."}
                value={descEs}
                onChange={(e) => setDescEs(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-desc-en">{t("adminDetail.descEn")}</Label>
              <Textarea
                id="sub-desc-en"
                placeholder={lang === "en" ? "Description in English..." : "Descripción..."}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">{t("common.cancel")}</Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? t("adminDetail.saveChanges") : t("adminDetail.newModule")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


// ─── Class Form Modal ─────────────────────────────────────────────────────────

interface ClassFormProps {
  courseId: string;
  subjectId: string | null;
  cls?: Class | null; // using cls since class is a reserved word
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function ClassFormModal({ courseId, subjectId, cls, open, onOpenChange, onSaved }: ClassFormProps) {
  const { t, lang } = useTranslation();
  const isEdit = !!cls;

  const [titleEs, setTitleEs] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [descEs, setDescEs] = React.useState("");
  const [descEn, setDescEn] = React.useState("");
  const [videoUrl, setVideoUrl] = React.useState("");
  const [resourceUrl, setResourceUrl] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTitleEs(cls?.title?.es ?? "");
      setTitleEn(cls?.title?.en ?? "");
      setDescEs(cls?.description?.es ?? "");
      setDescEn(cls?.description?.en ?? "");
      setVideoUrl(cls?.video_url ?? "");
      setResourceUrl(cls?.resource_url ?? "");
      setDuration(cls?.duration_minutes?.toString() ?? "");
    }
  }, [cls, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleEs.trim() && !titleEn.trim()) {
      toast.error(t("adminDetail.classTitleRequired"));
      return;
    }
    
    // Fallback to ensuring subjectId is present (it shouldn't be null but typescript)
    if (!subjectId && !cls?.subject_id) {
       toast.error(t("adminDetail.moduleRefError"));
       return;
    }

    const tSubjectId = subjectId || cls!.subject_id;

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
        video_url: videoUrl.trim() || null,
        resource_url: resourceUrl.trim() || null,
        duration_minutes: duration !== "" ? parseInt(duration, 10) : null,
      };

      if (isEdit && cls) {
        await updateClass(courseId, tSubjectId, cls.id, payload);
        toast.success(t("adminDetail.classUpdated"));
      } else {
        await createClass(courseId, tSubjectId, payload);
        toast.success(t("adminDetail.classCreated"));
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
          <DialogTitle>{isEdit ? t("adminDetail.editClass") : t("adminDetail.newClass")}</DialogTitle>
          <DialogDescription>
             {t("adminDetail.classDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cls-title-es">{t("adminDetail.titleEs")} <span className="text-red-500">*</span></Label>
              <Input
                id="cls-title-es"
                placeholder={lang === "es" ? "Ej. Conceptos Básicos" : "e.g. Core Concepts"}
                value={titleEs}
                onChange={(e) => setTitleEs(e.target.value)}
                required={!titleEn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cls-title-en">{t("adminDetail.titleEn")}</Label>
              <Input
                id="cls-title-en"
                placeholder={lang === "en" ? "e.g. Core Concepts" : "Ej. Conceptos..."}
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                required={!titleEs}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cls-desc-es">{t("adminDetail.descEs")}</Label>
              <Textarea
                id="cls-desc-es"
                placeholder={lang === "es" ? "Descripción en español..." : "Description in Spanish..."}
                value={descEs}
                onChange={(e) => setDescEs(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cls-desc-en">{t("adminDetail.descEn")}</Label>
              <Textarea
                id="cls-desc-en"
                placeholder={lang === "en" ? "Description in English..." : "Descripción..."}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="cls-video">{t("adminDetail.videoUrl")}</Label>
                <Input
                  id="cls-video"
                  type="text"
                  placeholder="YouTube URL or video ID"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="cls-resource">{t("adminDetail.resourceUrl")}</Label>
                <Input
                  id="cls-resource"
                  type="url"
                  placeholder={t("adminDetail.resourcePlaceholder")}
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                />
             </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <div className="space-y-2">
                <Label htmlFor="cls-duration">{t("adminDetail.durationMinutes")}</Label>
                <Input
                  id="cls-duration"
                  type="number"
                  placeholder="e.g. 45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
             </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">{t("common.cancel")}</Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? t("adminDetail.saveChanges") : t("adminDetail.newClass")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


// ─── Universal Delete Confirmation ────────────────────────────────────────────

interface DeleteConfirmProps {
  courseId: string;
  item: { type: "subject" | "class"; id: string; parentId?: string; name: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

function DeleteConfirmationModal({ courseId, item, open, onOpenChange, onDeleted }: DeleteConfirmProps) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    if (!item) return;
    setDeleting(true);
    try {
      if (item.type === "subject") {
        await deleteSubject(courseId, item.id);
        toast.success(t("adminDetail.moduleDeleted"));
      } else {
         if (!item.parentId) throw new Error(t("adminDetail.moduleRefError"));
         await deleteClass(courseId, item.parentId, item.id);
         toast.success(t("adminDetail.classDeleted"));
      }
      onDeleted();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("adminDetail.errorDeleting"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("common.delete")} {item?.type === "subject" ? t("adminDetail.moduleTitle") : t("adminDetail.classTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("adminDetail.deleteConfirm").replace("{name}", item?.name || "")}
            {" "}{item?.type === "subject" ? t("adminDetail.deleteModuleWarning") : ""}
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
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function ModuleExamRow({
  courseId,
  subjectId,
  exams,
  lang,
}: {
  courseId: string;
  subjectId: string;
  exams: Exam[];
  lang: string;
}) {
  const router = useRouter();
  const [creating, setCreating] = React.useState(false);

  async function handleCreate() {
    setCreating(true);
    try {
      const exam = await createModuleExam(courseId, subjectId);
      router.push(`/campus/admin/exams/${exam.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error creating exam");
      setCreating(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-dashed border-primary/15 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <FileQuestion className="size-4 text-brand-orange" />
          Examen del módulo
        </div>
        {exams.length === 0 ? (
          <Button variant="secondary" size="xs" onClick={handleCreate} disabled={creating}>
            {creating ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
            Crear examen
          </Button>
        ) : null}
      </div>
      {exams.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {exams.map((exam) => (
            <li key={exam.id} className="flex items-center justify-between gap-2">
              <span className="text-sm text-primary/80">
                {getLocalizedText(exam.title, lang as "es" | "en")}
              </span>
              <Button asChild variant="ghost" size="xs">
                <Link href={`/campus/admin/exams/${exam.id}`}>Editar</Link>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-xs text-slate-500">
          Cada módulo necesita un examen antes de publicar.
        </p>
      )}
    </div>
  );
}

// ─── Main Panel Component ──────────────────────────────────────────────────────

export default function CourseDetailPanel({ courseId }: { courseId: string }) {
  const { t, lang } = useTranslation();
  const [tree, setTree] = React.useState<CourseTree | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Modals definitions
  const [subFormOpen, setSubFormOpen] = React.useState(false);
  const [editingSub, setEditingSub] = React.useState<Subject | null>(null);

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const [clsFormOpen, setClsFormOpen] = React.useState(false);
  const [targetSubId, setTargetSubId] = React.useState<string | null>(null);
  const [editingCls, setEditingCls] = React.useState<Class | null>(null);

  const [publishValidationOpen, setPublishValidationOpen] = React.useState(false);
  const [publishPending, setPublishPending] = React.useState(false);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingItem, setDeletingItem] = React.useState<{type: "subject" | "class", id: string, parentId?: string, name: string} | null>(null);

  
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCourseTree(courseId);
      // Sort to ensure array ordering matches DB order_index
      data.subjects.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      for (const sub of data.subjects) {
         sub.classes.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      }
      setTree(data);
    } catch {
      toast.error(t("profile.errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [courseId, t]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destId = result.destination.droppableId;
    
    // Solo permitimos reordenar en la misma zona
    if (sourceId !== destId) return;

    if (sourceId === "subjects") {
      // Reordenar módulos
      if (!tree) return;
      const newSubjects = Array.from(tree.subjects);
      const [reorderedItem] = newSubjects.splice(result.source.index, 1);
      newSubjects.splice(result.destination.index, 0, reorderedItem);
      
      setTree({ ...tree, subjects: newSubjects });
      
      const newOrderIds = newSubjects.map(s => s.id);
      try {
        await reorderSubjects(courseId, newOrderIds);
      } catch {
        toast.error(t("adminDetail.reorderError"));
        loadData(); // Revert
      }
    } else {
      // Reordenar clases dentro de un módulo
      if (!tree) return;
      const subjectIndex = tree.subjects.findIndex(s => s.id === sourceId);
      if (subjectIndex === -1) return;
      
      const subject = tree.subjects[subjectIndex];
      const newClasses = Array.from(subject.classes);
      const [reorderedItem] = newClasses.splice(result.source.index, 1);
      newClasses.splice(result.destination.index, 0, reorderedItem);
      
      const newTreeSubjects = [...tree.subjects];
      newTreeSubjects[subjectIndex] = { ...subject, classes: newClasses };
      setTree({ ...tree, subjects: newTreeSubjects });
      
      const newOrderIds = newClasses.map(c => c.id);
      try {
        await reorderClasses(courseId, subject.id, newOrderIds);
      } catch {
        toast.error(t("adminDetail.reorderError"));
        loadData(); // Revert
      }
    }
  };


  // Action handlers
  const openNewSubject = () => {
     setEditingSub(null);
     setSubFormOpen(true);
  };
  const openEditSubject = (e: React.MouseEvent, subject: Subject) => {
     e.stopPropagation(); // Stop accordion from toggling
     setEditingSub(subject);
     setSubFormOpen(true);
  };
  const triggerDeleteSubject = (e: React.MouseEvent, subject: Subject) => {
     e.stopPropagation();
     setDeletingItem({ type: "subject", id: subject.id, name: getLocalizedText(subject.title) });
     setDeleteOpen(true);
  };

  const openNewClass = (e: React.MouseEvent, subjectId: string) => {
     e.stopPropagation();
     setTargetSubId(subjectId);
     setEditingCls(null);
     setClsFormOpen(true);
  };
  const openEditClass = (e: React.MouseEvent, subjectId: string, cls: Class) => {
     e.stopPropagation();
     setTargetSubId(subjectId);
     setEditingCls(cls);
     setClsFormOpen(true);
  };
  const triggerDeleteClass = (e: React.MouseEvent, subjectId: string, cls: Class) => {
     e.stopPropagation();
     setDeletingItem({ type: "class", id: cls.id, parentId: subjectId, name: getLocalizedText(cls.title) });
     setDeleteOpen(true);
  };

  const handlePublish = async () => {
    if (!tree) return;
    
    const configCount = tree.course.final_exam_question_count || 0;
    const availableCount = tree.course.total_questions_count || 0;

    // Validation: if there is a final exam configured, check if we have enough questions
    if (configCount > 0 && configCount > availableCount) {
      setPublishValidationOpen(true);
      return;
    }

    setPublishPending(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error?.message || t("adminDetail.importError"));
      }

      toast.success(t("common.success")); 
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("adminDetail.importError"));
    } finally {
      setPublishPending(false);
    }
  };



  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="rounded-lg border border-dashed text-center p-8 text-muted-foreground">
        {t("adminDetail.studentNotFound").replace(t("adminDetail.usersTitle"), t("adminDetail.coursesTitle"))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div>
         <Link 
            href="/campus/admin/courses" 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-4 transition-colors"
         >
            <ArrowLeft className="size-4 mr-2" />
            {t("adminDetail.backToExams").replace(t("adminDetail.examsTitle"), t("adminDetail.coursesTitle"))}
         </Link>
         
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <div>
                <Title level="h2" className="font-display text-3xl font-bold tracking-tight">
                  {getLocalizedText(tree.course.title, lang)}
                </Title>
                <div className="flex items-center mt-2 text-sm text-slate-500 gap-3">
                   <StatusBadge status={tree.course.status} />
                   <span>{t("adminDetail.columnJoined")}: {formatDate(tree.course.created_at, lang === "es" ? "es-ES" : "en-US")}</span>
                   <span className="bg-slate-100 rounded-md px-2 py-0.5 border border-slate-200 text-xs font-mono">{tree.subjects.length} {t("adminDetail.columnModules").toLowerCase()}</span>
                   {!(tree.course.final_exam_question_count && tree.course.final_exam_question_count > 0) && (
                      <span className="flex items-center gap-1.5 text-amber-600 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/50 text-xs">
                         <AlertCircle className="size-3.5" />
                         {t("adminDetail.examConfigWarning")}
                      </span>
                   )}
                </div>
             </div>
             
             <div className="flex items-center gap-2">
                {tree.course.status !== "published" && (
                   <Button 
                      variant="default" 
                      className="bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20"
                      onClick={handlePublish}
                      disabled={publishPending}
                   >
                      {publishPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Rocket className="size-4" />
                      )}
                      {t("adminDetail.published").split("/")[0]}
                   </Button>
                )}
                <Button variant="outline" onClick={() => setSettingsOpen(true)}>
                   <Settings className="size-4" />
                   {t("adminDetail.finalExamConfig")}
                </Button>
                <Button onClick={openNewSubject}>
                   <Plus className="size-4" />
                   {t("adminDetail.newModule")}
                </Button>
             </div>
         </div>
      </div>

      {tree.subjects.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 mb-5">
             <LayoutList className="size-8 text-accent" />
           </div>
           <p className="text-lg font-semibold text-primary tracking-tight">
             {t("adminDetail.noExamRecords").replace(t("adminDetail.examsTitle"), t("adminDetail.coursesTitle"))}
           </p>
           <p className="mt-1 text-sm text-slate-500 max-w-xs">
             {t("adminDetail.createRoleNote").replace(t("adminDetail.rolesTitle"), t("adminDetail.moduleTitle"))}
           </p>
           <Button className="mt-6 border border-primary/20" variant="secondary" onClick={openNewSubject}>
             <Plus className="size-4" />
             {t("adminDetail.newModule")}
           </Button>
         </div>
      ) : mounted ? (
         <DragDropContext onDragEnd={handleDragEnd}>
           <Droppable droppableId="subjects" type="SUBJECT">
             {(provided) => (
               <div 
                 {...provided.droppableProps} 
                 ref={provided.innerRef} 
                 className="bg-white rounded-2xl border border-slate-100 p-2 shadow-sm space-y-1"
               >
                 <Accordion type="multiple" className="w-full">
                   {tree.subjects.map((sub, index) => (
                      <Draggable key={sub.id} draggableId={sub.id} index={index}>
                         {(subjProvided, subjSnapshot) => (
                           <div 
                              ref={subjProvided.innerRef}
                              {...subjProvided.draggableProps}
                              className={subjSnapshot.isDragging ? "opacity-90 z-50 bg-white rounded-xl outline outline-1 outline-primary/20 shadow-xl" : ""}
                           >
                             <AccordionItem value={sub.id} className="border-slate-100 px-4 group/item">
                               <div className="relative group/trigger">
                                 <AccordionTrigger className="hover:no-underline py-5 lg:py-4">
                                    <div className="flex items-center gap-3 text-left pr-20">
                                       <div 
                                          {...subjProvided.dragHandleProps}
                                          className="cursor-move text-slate-300 hover:text-slate-500 -ml-2 mr-1 opacity-100 sm:opacity-0 sm:group-hover/trigger:opacity-100 transition-opacity p-2"
                                          onClick={(e) => e.stopPropagation()}
                                       >
                                          <GripVertical className="size-5" />
                                       </div>
                                       <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                                          <span className="font-bold text-[10px] text-accent tracking-widest leading-none">M{index + 1}</span>
                                       </div>
                                       <div className="flex flex-col gap-0.5">
                                         <span className="font-bold text-primary tracking-tight">{getLocalizedText(sub.title, lang)}</span>
                                         {sub.description && (
                                            <span className="text-xs font-medium text-slate-500 line-clamp-1">{getLocalizedText(sub.description, lang)}</span>
                                         )}
                                       </div>
                                    </div>
                                 </AccordionTrigger>

                                 {/* Subject Actions Wrapper */}
                                 <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10 opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity">
                                    <Tooltip>
                                     <TooltipTrigger asChild>
                                       <Button
                                         variant="ghost"
                                         size="icon-xs"
                                         onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditSubject(e, sub); }}
                                         aria-label={t("adminDetail.editWithName").replace("{name}", t("adminDetail.moduleTitle"))}
                                       >
                                         <Pencil className="size-3.5" />
                                       </Button>
                                     </TooltipTrigger>
                                     <TooltipContent>{t("common.edit")}</TooltipContent>
                                   </Tooltip>
                                   
                                   <Tooltip>
                                     <TooltipTrigger asChild>
                                       <Button
                                         variant="ghost"
                                         size="icon-xs"
                                         className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                         onClick={(e) => { e.preventDefault(); e.stopPropagation(); triggerDeleteSubject(e, sub); }}
                                         aria-label={t("adminDetail.deleteWithName").replace("{name}", t("adminDetail.moduleTitle"))}
                                       >
                                         <Trash2 className="size-3.5" />
                                       </Button>
                                     </TooltipTrigger>
                                     <TooltipContent>{t("common.delete")}</TooltipContent>
                                   </Tooltip>
                                 </div>
                               </div>
                              
                              <AccordionContent className="pb-5 pt-2">
                                 <div className="pl-11 space-y-3">
                                   {sub.classes.length === 0 ? (
                                     <>
                                     <div className="text-sm text-slate-400 font-medium py-3 px-4 border border-dashed rounded-xl flex items-center justify-between">
                                        <span>{t("adminDetail.noExamRecords").replace(t("adminDetail.examsTitle"), t("adminDetail.classTitle") + "es")}</span>
                                        <Button variant="secondary" size="xs" onClick={(e) => openNewClass(e, sub.id)}>
                                          <Plus className="size-3" /> {t("adminDetail.newClass")}
                                        </Button>
                                     </div>
                                     <ModuleExamRow
                                       courseId={courseId}
                                       subjectId={sub.id}
                                       exams={sub.exams ?? []}
                                       lang={lang}
                                     />
                                     </>
                                   ) : (
                                     <Droppable droppableId={sub.id} type="CLASS">
                                       {(clsDroppable) => (
                                         <div 
                                           className="space-y-2"
                                           ref={clsDroppable.innerRef}
                                           {...clsDroppable.droppableProps}
                                         >
                                           {sub.classes.map((cls, cIndex) => (
                                              <Draggable key={cls.id} draggableId={cls.id} index={cIndex}>
                                                 {(clsProvided, clsSnapshot) => (
                                                   <div 
                                                      ref={clsProvided.innerRef}
                                                      {...clsProvided.draggableProps}
                                                      className={`flex items-center justify-between group/cls bg-slate-50/50 hover:bg-slate-100 border border-slate-100 rounded-xl px-4 py-3 transition-colors ${clsSnapshot.isDragging ? "shadow-md bg-white border-primary/20 opacity-90 z-50" : ""}`}
                                                   >
                                                      <div className="flex items-center gap-3">
                                                         <div 
                                                            {...clsProvided.dragHandleProps} 
                                                            className="cursor-move text-slate-300 hover:text-slate-500 opacity-100 sm:opacity-0 sm:group-hover/cls:opacity-100 transition-opacity p-1 -ml-2"
                                                         >
                                                            <GripVertical className="size-4" />
                                                         </div>
                                                         {cls.video_url ? (
                                                           <div className="flex size-6 shrink-0 bg-brand-orange/20 text-brand-orange items-center justify-center rounded-md">
                                                              <Video className="size-3" />
                                                           </div>
                                                         ) : cls.resource_url ? (
                                                           <div className="flex size-6 shrink-0 bg-primary/10 text-primary items-center justify-center rounded-md">
                                                              <FileText className="size-3" />
                                                           </div>
                                                         ) : (
                                                           <div className="flex size-6 shrink-0 border border-slate-200 text-slate-400 items-center justify-center rounded-md">
                                                              <FileText className="size-3" />
                                                           </div>
                                                         )}
                                                         <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                              {cIndex + 1}. {getLocalizedText(cls.title, lang)}
                                                              {cls.duration_minutes && (
                                                                <Badge variant="secondary" className="px-1.5 py-0 h-4 rounded text-[10px] gap-1 font-semibold">
                                                                  <Clock className="size-2.5" /> {cls.duration_minutes}m
                                                                </Badge>
                                                              )}
                                                            </span>
                                                         </div>
                                                      </div>
                                                      
                                                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover/cls:opacity-100 transition-opacity">
                                                         <Tooltip>
                                                          <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon-xs" className="h-6 w-6" onClick={(e) => openEditClass(e, sub.id, cls)}>
                                                              <Pencil className="size-3" />
                                                            </Button>
                                                          </TooltipTrigger>
                                                          <TooltipContent>{t("common.edit")}</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                          <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon-xs" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={(e) => triggerDeleteClass(e, sub.id, cls)}>
                                                              <Trash2 className="size-3" />
                                                            </Button>
                                                          </TooltipTrigger>
                                                          <TooltipContent>{t("common.delete")}</TooltipContent>
                                                        </Tooltip>
                                                      </div>
                                                   </div>
                                                 )}
                                              </Draggable>
                                           ))}
                                           {clsDroppable.placeholder}
                                           <div className="pt-2 flex justify-end">
                                              <Button variant="ghost" size="sm" className="text-slate-500 font-semibold text-xs py-1 h-8" onClick={(e) => openNewClass(e, sub.id)}>
                                                 <Plus className="size-3" /> {t("adminDetail.newClass")}
                                              </Button>
                                           </div>
                                         </div>
                                       )}
                                     </Droppable>
                                   )}
                                   <ModuleExamRow
                                     courseId={courseId}
                                     subjectId={sub.id}
                                     exams={sub.exams ?? []}
                                     lang={lang}
                                   />
                                 </div>
                              </AccordionContent>
                            </AccordionItem>
                           </div>
                         )}
                      </Draggable>
                   ))}
                   {provided.placeholder}
                 </Accordion>
               </div>
             )}
           </Droppable>
         </DragDropContext>
      ) : null}

      {/* Cross-panel Modals */}
      <CourseConfigModal
         courseId={courseId}
         course={tree.course}
         open={settingsOpen}
         onOpenChange={setSettingsOpen}
         onSaved={loadData}
      />

      <PublishValidationModal 
         open={publishValidationOpen}
         onOpenChange={setPublishValidationOpen}
         courseTitle={getLocalizedText(tree.course.title, lang)}
         configuredQuestions={tree.course.final_exam_question_count || 0}
         availableQuestions={tree.course.total_questions_count || 0}
      />

      <SubjectFormModal 
         courseId={courseId}
         subject={editingSub}
         open={subFormOpen}
         onOpenChange={setSubFormOpen}
         onSaved={loadData}
      />

      <ClassFormModal 
         courseId={courseId}
         subjectId={targetSubId}
         cls={editingCls}
         open={clsFormOpen}
         onOpenChange={setClsFormOpen}
         onSaved={loadData}
      />

      <DeleteConfirmationModal
         courseId={courseId}
         item={deletingItem}
         open={deleteOpen}
         onOpenChange={setDeleteOpen}
         onDeleted={loadData}
      />
    </div>
  );
}
