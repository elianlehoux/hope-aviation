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
  ArrowLeft,
  ChevronRight,
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

import type { Course, Subject, Class, TranslatedText, CourseStatus } from "@/types/database";

// Define the shape that the `/tree` endpoint returns
type SubjectWithClasses = Subject & { classes: Class[] };
type CourseTree = {
  course: Course;
  subjects: SubjectWithClasses[];
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

function StatusBadge({ status }: { status: CourseStatus }) {
  switch (status) {
    case "published":
      return <Badge variant="default">Publicado</Badge>;
    case "draft":
      return <Badge variant="secondary">Borrador</Badge>;
    case "archived":
      return <Badge variant="outline" className="text-slate-500 border-slate-200">Archivado</Badge>;
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
  if (!res.ok) throw new Error("Error creating class");
  return (await res.json()).data.class;
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


// ─── Subject Form Modal ───────────────────────────────────────────────────────

interface SubjectFormProps {
  courseId: string;
  subject?: Subject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function SubjectFormModal({ courseId, subject, open, onOpenChange, onSaved }: SubjectFormProps) {
  const isEdit = !!subject;

  const [titleEs, setTitleEs] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [descEs, setDescEs] = React.useState("");
  const [descEn, setDescEn] = React.useState("");
  const [orderIndex, setOrderIndex] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTitleEs(subject?.title?.es ?? "");
      setTitleEn(subject?.title?.en ?? "");
      setDescEs(subject?.description?.es ?? "");
      setDescEn(subject?.description?.en ?? "");
      setOrderIndex(subject?.order_index?.toString() ?? "");
    }
  }, [subject, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleEs.trim() && !titleEn.trim()) {
      toast.error("El módulo debe tener un título (ES o EN).");
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
        order_index: orderIndex !== "" ? parseInt(orderIndex, 10) : null,
      };

      if (isEdit && subject) {
        await updateSubject(courseId, subject.id, payload);
        toast.success("Módulo actualizado correctamente.");
      } else {
        await createSubject(courseId, payload);
        toast.success("Módulo creado correctamente.");
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Módulo" : "Nuevo Módulo"}</DialogTitle>
          <DialogDescription>
             Este módulo agrupará un listado de clases.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sub-title-es">Título (ES) <span className="text-red-500">*</span></Label>
              <Input
                id="sub-title-es"
                placeholder="Ej. Introducción"
                value={titleEs}
                onChange={(e) => setTitleEs(e.target.value)}
                required={!titleEn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-title-en">Título (EN)</Label>
              <Input
                id="sub-title-en"
                placeholder="e.g. Introduction"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                required={!titleEs}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sub-desc-es">Descripción (ES)</Label>
              <Textarea
                id="sub-desc-es"
                placeholder="Descripción en español..."
                value={descEs}
                onChange={(e) => setDescEs(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-desc-en">Descripción (EN)</Label>
              <Textarea
                id="sub-desc-en"
                placeholder="Description in English..."
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub-order">Orden (Índice)</Label>
            <Input
              id="sub-order"
              type="number"
              placeholder="0, 10, 20..."
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1 text-slate-400">
               Define el orden de aparición (número menor aparece primero).
            </p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Guardar Cambios" : "Crear Módulo"}
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
  const isEdit = !!cls;

  const [titleEs, setTitleEs] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [descEs, setDescEs] = React.useState("");
  const [descEn, setDescEn] = React.useState("");
  const [videoUrl, setVideoUrl] = React.useState("");
  const [resourceUrl, setResourceUrl] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [orderIndex, setOrderIndex] = React.useState<string>("");
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
      setOrderIndex(cls?.order_index?.toString() ?? "");
    }
  }, [cls, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleEs.trim() && !titleEn.trim()) {
      toast.error("La clase debe tener un título (ES o EN).");
      return;
    }
    
    // Fallback to ensuring subjectId is present (it shouldn't be null but typescript)
    if (!subjectId && !cls?.subject_id) {
       toast.error("Referencia al módulo perdida.");
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
        order_index: orderIndex !== "" ? parseInt(orderIndex, 10) : null,
      };

      if (isEdit && cls) {
        await updateClass(courseId, tSubjectId, cls.id, payload);
        toast.success("Clase actualizada correctamente.");
      } else {
        await createClass(courseId, tSubjectId, payload);
        toast.success("Clase creada correctamente.");
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
          <DialogTitle>{isEdit ? "Editar Clase" : "Nueva Clase"}</DialogTitle>
          <DialogDescription>
             Define la lección, videos enlazados y archivos a descargar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cls-title-es">Título (ES) <span className="text-red-500">*</span></Label>
              <Input
                id="cls-title-es"
                placeholder="Ej. Conceptos Básicos"
                value={titleEs}
                onChange={(e) => setTitleEs(e.target.value)}
                required={!titleEn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cls-title-en">Título (EN)</Label>
              <Input
                id="cls-title-en"
                placeholder="e.g. Core Concepts"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                required={!titleEs}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cls-desc-es">Descripción (ES)</Label>
              <Textarea
                id="cls-desc-es"
                placeholder="Descripción en español..."
                value={descEs}
                onChange={(e) => setDescEs(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cls-desc-en">Descripción (EN)</Label>
              <Textarea
                id="cls-desc-en"
                placeholder="Description in English..."
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="cls-video">Video URL (Opcional)</Label>
               <Input
                 id="cls-video"
                 type="url"
                 placeholder="Enlace a Vimeo o YouTube"
                 value={videoUrl}
                 onChange={(e) => setVideoUrl(e.target.value)}
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="cls-resource">Recurso URL (Opcional)</Label>
               <Input
                 id="cls-resource"
                 type="url"
                 placeholder="PDF o Material de apoyo"
                 value={resourceUrl}
                 onChange={(e) => setResourceUrl(e.target.value)}
               />
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="cls-duration">Duración Mínutos (Opcional)</Label>
               <Input
                 id="cls-duration"
                 type="number"
                 placeholder="e.g. 45"
                 value={duration}
                 onChange={(e) => setDuration(e.target.value)}
               />
             </div>
            <div className="space-y-2">
              <Label htmlFor="cls-order">Orden (Índice)</Label>
              <Input
                id="cls-order"
                type="number"
                placeholder="0, 10, 20..."
                value={orderIndex}
                onChange={(e) => setOrderIndex(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Guardar Cambios" : "Crear Clase"}
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
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    if (!item) return;
    setDeleting(true);
    try {
      if (item.type === "subject") {
        await deleteSubject(courseId, item.id);
        toast.success(`Módulo eliminado.`);
      } else {
         if (!item.parentId) throw new Error("Referencia al módulo pérdida para poder eliminar.");
         await deleteClass(courseId, item.parentId, item.id);
         toast.success("Clase eliminada.");
      }
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
          <DialogTitle>Eliminar {item?.type === "subject" ? "Módulo" : "Clase"}</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar <strong className="text-primary">{item?.name}</strong>? Esta acción
            no se puede deshacer. {item?.type === "subject" ? "Si el módulo contiene clases, no se podrá borrar." : ""}
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
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// ─── Main Panel Component ──────────────────────────────────────────────────────

export default function CourseDetailPanel({ courseId }: { courseId: string }) {
  const [tree, setTree] = React.useState<CourseTree | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Modals definitions
  const [subFormOpen, setSubFormOpen] = React.useState(false);
  const [editingSub, setEditingSub] = React.useState<Subject | null>(null);

  const [clsFormOpen, setClsFormOpen] = React.useState(false);
  const [targetSubId, setTargetSubId] = React.useState<string | null>(null);
  const [editingCls, setEditingCls] = React.useState<Class | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingItem, setDeletingItem] = React.useState<{type: "subject" | "class", id: string, parentId?: string, name: string} | null>(null);

  
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCourseTree(courseId);
      setTree(data);
    } catch {
      toast.error("Error cargando el detalle del curso.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);


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
        No se pudo cargar la información del curso.
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
            Volver a Cursos
         </Link>
         
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <div>
                <Title level="h2">{getLocalizedText(tree.course.title)}</Title>
                <div className="flex items-center mt-2 text-sm text-slate-500 gap-3">
                   <StatusBadge status={tree.course.status} />
                   <span>Creado el {formatDate(tree.course.created_at)}</span>
                   <span className="bg-slate-100 rounded-md px-2 py-0.5 border border-slate-200 text-xs font-mono">{tree.subjects.length} módulos</span>
                </div>
             </div>
             
             <Button onClick={openNewSubject}>
                <Plus className="size-4" />
                Nuevo Módulo
             </Button>
         </div>
      </div>

      {tree.subjects.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 mb-5">
             <LayoutList className="size-8 text-accent" />
           </div>
           <p className="text-lg font-semibold text-primary tracking-tight">
             El curso está vacío
           </p>
           <p className="mt-1 text-sm text-slate-500 max-w-xs">
             Añade tu primer módulo para comenzar a estructurar el contenido de las clases.
           </p>
           <Button className="mt-6 border border-primary/20" variant="secondary" onClick={openNewSubject}>
             <Plus className="size-4" />
             Crear Primer Módulo
           </Button>
         </div>
      ) : (
         <div className="bg-white rounded-2xl border border-slate-100 p-2 shadow-sm space-y-1">
             <Accordion type="multiple" className="w-full">
               {tree.subjects.map((sub, index) => (
                  <AccordionItem value={sub.id} key={sub.id} className="border-slate-100 px-4 group/item">
                    <AccordionTrigger className="hover:no-underline py-5 lg:py-4">
                       <div className="flex items-center gap-3 w-full justify-between">
                          <div className="flex items-center gap-3 text-left">
                             <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                                <span className="font-bold text-[10px] text-accent tracking-widest leading-none">M{index + 1}</span>
                             </div>
                             <div className="flex flex-col gap-0.5">
                               <span className="font-bold text-primary tracking-tight">{getLocalizedText(sub.title)}</span>
                               {sub.description && (
                                  <span className="text-xs font-medium text-slate-500 line-clamp-1">{getLocalizedText(sub.description)}</span>
                               )}
                             </div>
                          </div>

                          {/* Subject Actions Wrapper */}
                          <div className="flex items-center mr-4" onClick={(e) => e.stopPropagation()}>
                             <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={(e) => openEditSubject(e, sub)}
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar Módulo</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={(e) => triggerDeleteSubject(e, sub)}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Eliminar Módulo</TooltipContent>
                            </Tooltip>
                          </div>
                       </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="pb-5 pt-2">
                       <div className="pl-11 space-y-3">
                         {sub.classes.length === 0 ? (
                           <div className="text-sm text-slate-400 font-medium py-3 px-4 border border-dashed rounded-xl flex items-center justify-between">
                              <span>Este módulo no tiene clases aún.</span>
                              <Button variant="secondary" size="xs" onClick={(e) => openNewClass(e, sub.id)}>
                                <Plus className="size-3" /> Añadir Clase
                              </Button>
                           </div>
                         ) : (
                           <div className="space-y-2">
                              {sub.classes.map((cls, cIndex) => (
                                 <div 
                                    key={cls.id}
                                    className="flex items-center justify-between group/cls bg-slate-50/50 hover:bg-slate-100 border border-slate-100 rounded-xl px-4 py-3 transition-colors"
                                 >
                                    <div className="flex items-center gap-3">
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
                                            {cIndex + 1}. {getLocalizedText(cls.title)}
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
                                        <TooltipContent>Editar Clase</TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="icon-xs" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={(e) => triggerDeleteClass(e, sub.id, cls)}>
                                            <Trash2 className="size-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Eliminar Clase</TooltipContent>
                                      </Tooltip>
                                    </div>
                                 </div>
                              ))}
                              
                              <div className="pt-2 flex justify-end">
                                 <Button variant="ghost" size="sm" className="text-slate-500 font-semibold text-xs py-1 h-8" onClick={(e) => openNewClass(e, sub.id)}>
                                    <Plus className="size-3" /> Añadir siguiente clase
                                 </Button>
                              </div>
                           </div>
                         )}
                       </div>
                    </AccordionContent>
                  </AccordionItem>
               ))}
             </Accordion>
         </div>
      )}

      {/* Cross-panel Modals */}
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
